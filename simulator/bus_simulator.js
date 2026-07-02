const mqtt = require('mqtt');

// ─── HiveMQ Cloud Configuration ───
// This simulator publishes data in the EXACT same JSON format as the ESP32 firmware
// so you can test the admin dashboard without the physical hardware.
const HIVEMQ_HOST = '9ce9a991c31542a49529dd4db804495d.s1.eu.hivemq.cloud';
const HIVEMQ_PORT = 8883;
const MQTT_USER = 'lee_project';
const MQTT_PASS = 'Lee_project@123';
const TOPIC = 'lee_bus/sensors';

const connectUrl = `mqtts://${HIVEMQ_HOST}:${HIVEMQ_PORT}`;
const clientId = `sim_${Math.random().toString(16).slice(2, 8)}`;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚌 Lee Bus ESP32 Simulator');
console.log(`   Broker: ${connectUrl}`);
console.log(`   Topic:  ${TOPIC}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 10000,
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 5000,
});

// Colombo → Avissawella route (matches your bus route)
const ROUTE_POINTS = [
  { name: 'Colombo Fort', lat: 6.9333, lng: 79.8433 },
  { name: 'Town Hall', lat: 6.9155, lng: 79.8633 },
  { name: 'Borella', lat: 6.9152, lng: 79.8785 },
  { name: 'Nugegoda', lat: 6.8718, lng: 79.8895 },
  { name: 'Maharagama', lat: 6.8480, lng: 79.9265 },
  { name: 'Kottawa', lat: 6.8406, lng: 79.9654 },
  { name: 'Homagama', lat: 6.8412, lng: 80.0034 },
  { name: 'Godagama', lat: 6.8443, lng: 80.0245 },
  { name: 'Meepe', lat: 6.8458, lng: 80.0768 },
  { name: 'Hanwella', lat: 6.8978, lng: 80.0814 },
  { name: 'Kosgama', lat: 6.9200, lng: 80.1200 },
  { name: 'Puwakpitiya', lat: 6.9390, lng: 80.1650 },
  { name: 'Avissawella', lat: 6.9533, lng: 80.2117 },
];

let currentStopIndex = 0;
let direction = 1;
let uptimeSeconds = 0;

// ─── Interpolate between route stops for smooth movement ───
function interpolate(from, to, t) {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

// ─── Build ESP32-format JSON payload ───
function buildPayload(position, speed) {
  const now = new Date();
  uptimeSeconds += 5;

  return {
    device: 'lee_bus_esp32_001',
    uptime: uptimeSeconds,
    mpu6050: {
      accel: {
        x: parseFloat((0.02 + Math.random() * 0.1 - 0.05).toFixed(3)),
        y: parseFloat((0.01 + Math.random() * 0.08 - 0.04).toFixed(3)),
        z: parseFloat((0.98 + Math.random() * 0.1 - 0.05).toFixed(3)),
      },
      gyro: {
        x: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        y: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        z: parseFloat((Math.random() * 3 - 1.5).toFixed(2)),
      },
      temp: parseFloat((28 + Math.random() * 8).toFixed(1)),
    },
    gps: {
      valid: true,
      lat: parseFloat(position.lat.toFixed(6)),
      lng: parseFloat(position.lng.toFixed(6)),
      alt: parseFloat((50 + Math.random() * 200).toFixed(1)),
      speed: parseFloat(speed.toFixed(1)),
      course: parseFloat((Math.random() * 360).toFixed(1)),
      sats: Math.floor(6 + Math.random() * 6),
      time: now.toTimeString().split(' ')[0],
      date: now.toISOString().split('T')[0],
    },
    mic: {
      raw: Math.floor(1000 + Math.random() * 2000),
      voltage: parseFloat((0.5 + Math.random() * 1.5).toFixed(3)),
      db: parseFloat((55 + Math.random() * 35).toFixed(1)),
    },
  };
}

client.on('connect', () => {
  console.log('\n✅ Connected to HiveMQ Cloud!');
  console.log('📡 Publishing simulated ESP32 data every 5 seconds...\n');

  // Sub-step interpolation: move between stops smoothly
  let subStep = 0;
  const STEPS_PER_STOP = 3; // 3 intermediate steps between each stop

  setInterval(() => {
    const fromStop = ROUTE_POINTS[currentStopIndex];
    const nextIndex = currentStopIndex + direction;
    const toStop = ROUTE_POINTS[Math.max(0, Math.min(nextIndex, ROUTE_POINTS.length - 1))];

    const t = subStep / STEPS_PER_STOP;
    const position = interpolate(fromStop, toStop, t);

    // Simulate speed: 0 at stops, 30-65 in between
    const speed = subStep === 0 ? 0 : (30 + Math.random() * 35);

    const payload = buildPayload(position, speed);
    const jsonStr = JSON.stringify(payload);

    client.publish(TOPIC, jsonStr, { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Publish error:', err.message);
      } else {
        const stopName = subStep === 0 ? `📍 At ${fromStop.name}` : `🚌 En route to ${toStop.name}`;
        console.log(`[${payload.gps.time}] ${stopName} | Speed: ${speed.toFixed(0)} km/h | Lat: ${position.lat.toFixed(4)} Lng: ${position.lng.toFixed(4)}`);
      }
    });

    // Advance sub-step
    subStep++;
    if (subStep > STEPS_PER_STOP) {
      subStep = 0;
      currentStopIndex += direction;

      if (currentStopIndex >= ROUTE_POINTS.length - 1) {
        direction = -1;
        currentStopIndex = ROUTE_POINTS.length - 1;
      } else if (currentStopIndex <= 0) {
        direction = 1;
        currentStopIndex = 0;
      }
    }
  }, 5000);
});

client.on('error', (err) => {
  console.error('⚠️ MQTT Error:', err.message);
});

client.on('reconnect', () => {
  console.log('🔄 Reconnecting to HiveMQ Cloud...');
});

client.on('close', () => {
  console.log('🔌 Connection closed');
});
