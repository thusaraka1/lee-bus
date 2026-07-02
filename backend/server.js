const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_do_not_use_in_prod';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection parameters
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool;

// ============================================================================
//  MQTT LIVE BUS TRACKER
// ============================================================================
// In-memory cache of live bus locations from ESP32 MQTT data
// Key: device ID (e.g. "lee_bus_esp32_001"), Value: latest sensor data
const liveBusCache = new Map();

const MQTT_CONFIG = {
  host: process.env.MQTT_HOST || '9ce9a991c31542a49529dd4db804495d.s1.eu.hivemq.cloud',
  port: parseInt(process.env.MQTT_PORT) || 8883,
  username: process.env.MQTT_USERNAME || 'lee_project',
  password: process.env.MQTT_PASSWORD || 'Lee_project@123',
  topic: process.env.MQTT_TOPIC || 'lee_bus/sensors',
};

function initMqtt() {
  const connectUrl = `mqtts://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`;
  const clientId = `backend_${Math.random().toString(16).slice(2, 8)}`;

  console.log(`[MQTT] Connecting to ${connectUrl}...`);

  const mqttClient = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 10000,
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    reconnectPeriod: 5000,
  });

  mqttClient.on('connect', () => {
    console.log('[MQTT] ✅ Connected to HiveMQ Cloud!');
    mqttClient.subscribe(MQTT_CONFIG.topic, { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Subscription error:', err);
      } else {
        console.log(`[MQTT] 📡 Subscribed to: ${MQTT_CONFIG.topic}`);
      }
    });
  });

  mqttClient.on('message', (_topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      const deviceId = data.device;

      if (!deviceId) return;

      // Store the latest data in the cache
      liveBusCache.set(deviceId, {
        deviceId,
        lat: data.gps?.valid ? data.gps.lat : null,
        lng: data.gps?.valid ? data.gps.lng : null,
        speed: data.gps?.valid ? data.gps.speed : null,
        altitude: data.gps?.valid ? data.gps.alt : null,
        course: data.gps?.valid ? data.gps.course : null,
        satellites: data.gps?.sats || 0,
        gpsValid: data.gps?.valid || false,
        gpsTime: data.gps?.time || '',
        gpsDate: data.gps?.date || '',
        temperature: data.mpu6050?.temp || null,
        accelX: data.mpu6050?.accel?.x || 0,
        accelY: data.mpu6050?.accel?.y || 0,
        accelZ: data.mpu6050?.accel?.z || 0,
        noiseDb: data.mic?.db || null,
        uptime: data.uptime || 0,
        lastUpdate: new Date(),
        raw: data,
      });

    } catch (err) {
      // Silently ignore parse errors
    }
  });

  mqttClient.on('error', (err) => {
    console.error('[MQTT] Error:', err.message);
  });

  mqttClient.on('reconnect', () => {
    console.log('[MQTT] 🔄 Reconnecting...');
  });

  return mqttClient;
}

/**
 * Look up the live location for a given bus/device ID.
 * Tries exact match first, then partial/flexible matching.
 */
function findBusLocation(busId) {
  if (!busId) return null;

  // 1. Exact match
  if (liveBusCache.has(busId)) {
    return liveBusCache.get(busId);
  }

  // 2. Case-insensitive / partial match
  const normalizedId = busId.toLowerCase().replace(/[-_\s]/g, '');
  for (const [key, value] of liveBusCache.entries()) {
    const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
    if (normalizedKey.includes(normalizedId) || normalizedId.includes(normalizedKey)) {
      return value;
    }
  }

  // 3. Return the first (and likely only) device if only one exists
  //    This handles the case where the bus was registered as "BUS-0042"
  //    but the ESP32 publishes as "lee_bus_esp32_001"
  if (liveBusCache.size === 1) {
    return liveBusCache.values().next().value;
  }

  return null;
}


// ============================================================================
//  DATABASE INITIALIZATION
// ============================================================================
async function initDb() {
  try {
    console.log(`Connecting to MySQL at ${dbConfig.host}...`);
    const connection = await mysql.createConnection(dbConfig);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`leebus\`;`);
    console.log('Database "leebus" verified/created.');
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      database: 'leebus',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'dispatcher', 'viewer') DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Buses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buses (
        id VARCHAR(50) PRIMARY KEY,
        route VARCHAR(255) NOT NULL,
        driver_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Alerts table — stores passenger reports with auto-attached bus GPS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_id VARCHAR(50) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        description TEXT,
        bus_lat DOUBLE DEFAULT NULL,
        bus_lng DOUBLE DEFAULT NULL,
        bus_speed DOUBLE DEFAULT NULL,
        bus_temperature DOUBLE DEFAULT NULL,
        bus_noise_db DOUBLE DEFAULT NULL,
        passenger_lat DOUBLE DEFAULT NULL,
        passenger_lng DOUBLE DEFAULT NULL,
        device_id VARCHAR(100) DEFAULT NULL,
        status ENUM('pending', 'investigating', 'resolved') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default admin user
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@lee.com']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'admin@lee.com', hashedPassword, 'admin']
      );
      console.log('Created default admin user: admin@lee.com / admin123');
    }

    console.log('✅ Database initialization complete.');
  } catch (error) {
    console.error('❌ Database connection failed. Please ensure MySQL is running locally.', error);
    process.exit(1);
  }
}


// ============================================================================
//  ROUTES — AUTHENTICATION
// ============================================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ============================================================================
//  ROUTES — BUSES
// ============================================================================
app.get('/api/buses', async (req, res) => {
  try {
    const [buses] = await pool.query('SELECT id, route, driver_name as driverName, created_at as createdAt FROM buses ORDER BY created_at DESC');
    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ message: 'Error fetching buses' });
  }
});

app.post('/api/buses', async (req, res) => {
  const { id, route, driverName } = req.body;
  if (!id || !route) {
    return res.status(400).json({ message: 'Bus ID and route are required' });
  }

  try {
    await pool.query(
      'INSERT INTO buses (id, route, driver_name) VALUES (?, ?, ?)',
      [id, route, driverName || null]
    );
    res.json({ message: 'Bus created successfully' });
  } catch (error) {
    console.error('Error creating bus:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Bus ID already exists' });
    }
    res.status(500).json({ message: 'Error creating bus' });
  }
});

app.delete('/api/buses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM buses WHERE id = ?', [id]);
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ message: 'Error deleting bus' });
  }
});


// ============================================================================
//  ROUTES — LIVE BUS LOCATION (from MQTT cache)
// ============================================================================

// Get all live bus locations
app.get('/api/bus-locations', (req, res) => {
  const locations = [];
  for (const [, data] of liveBusCache) {
    locations.push({
      deviceId: data.deviceId,
      lat: data.lat,
      lng: data.lng,
      speed: data.speed,
      gpsValid: data.gpsValid,
      temperature: data.temperature,
      noiseDb: data.noiseDb,
      lastUpdate: data.lastUpdate,
    });
  }
  res.json(locations);
});

// Get a specific bus's live location
app.get('/api/bus-location/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const busData = findBusLocation(deviceId);

  if (!busData) {
    return res.status(404).json({
      message: 'Bus not found in live tracking. The device may be offline.',
      availableDevices: Array.from(liveBusCache.keys()),
    });
  }

  res.json({
    deviceId: busData.deviceId,
    lat: busData.lat,
    lng: busData.lng,
    speed: busData.speed,
    altitude: busData.altitude,
    gpsValid: busData.gpsValid,
    temperature: busData.temperature,
    noiseDb: busData.noiseDb,
    satellites: busData.satellites,
    lastUpdate: busData.lastUpdate,
  });
});


// ============================================================================
//  ROUTES — ALERTS (Passenger Reports with auto-attached GPS)
// ============================================================================

// POST /api/alerts — Passenger submits a report
// The backend automatically attaches the bus's live GPS from the MQTT cache
app.post('/api/alerts', async (req, res) => {
  const { busId, alertType, description, passengerLat, passengerLng } = req.body;

  if (!busId || !alertType) {
    return res.status(400).json({ message: 'busId and alertType are required' });
  }

  try {
    // Look up the bus's live location from MQTT cache
    const busData = findBusLocation(busId);

    const busLat = busData?.lat || null;
    const busLng = busData?.lng || null;
    const busSpeed = busData?.speed || null;
    const busTemp = busData?.temperature || null;
    const busNoise = busData?.noiseDb || null;
    const deviceId = busData?.deviceId || null;

    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO alerts 
        (bus_id, alert_type, description, bus_lat, bus_lng, bus_speed, bus_temperature, bus_noise_db, passenger_lat, passenger_lng, device_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [busId, alertType, description || null, busLat, busLng, busSpeed, busTemp, busNoise, passengerLat || null, passengerLng || null, deviceId]
    );

    const alertResponse = {
      id: result.insertId,
      busId,
      alertType,
      description,
      busLocation: busLat && busLng ? {
        lat: busLat,
        lng: busLng,
        speed: busSpeed,
        temperature: busTemp,
        noiseDb: busNoise,
        deviceId,
      } : null,
      busLocationAvailable: !!(busLat && busLng),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log(`🚨 [ALERT] New ${alertType} report for bus ${busId}` +
      (busLat ? ` | GPS: ${busLat.toFixed(6)}, ${busLng.toFixed(6)} @ ${busSpeed?.toFixed(1)} km/h` : ' | No GPS data'));

    res.status(201).json(alertResponse);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Error creating alert' });
  }
});

// GET /api/alerts — Admin fetches all alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; // optional filter

    let query = `
      SELECT id, bus_id as busId, alert_type as alertType, description,
             bus_lat as busLat, bus_lng as busLng, bus_speed as busSpeed,
             bus_temperature as busTemperature, bus_noise_db as busNoiseDb,
             passenger_lat as passengerLat, passenger_lng as passengerLng,
             device_id as deviceId, status, created_at as createdAt
      FROM alerts
    `;
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [alerts] = await pool.query(query, params);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// PATCH /api/alerts/:id — Update alert status
app.patch('/api/alerts/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'investigating', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Valid status required: pending, investigating, resolved' });
  }

  try {
    await pool.query('UPDATE alerts SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Alert status updated', id, status });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ message: 'Error updating alert' });
  }
});


// ============================================================================
//  START SERVER
// ============================================================================
initDb().then(() => {
  // Start MQTT subscriber
  initMqtt();

  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`📡 MQTT tracking active — live bus locations cached in memory`);
  });
});
