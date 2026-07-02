import { useState, useEffect, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';

// ─── MQTT Configuration ───
// HiveMQ Cloud uses port 8884 for WebSocket over TLS (wss://)
const MQTT_CONFIG = {
  host: import.meta.env.VITE_MQTT_HOST || '9ce9a991c31542a49529dd4db804495d.s1.eu.hivemq.cloud',
  port: Number(import.meta.env.VITE_MQTT_WSS_PORT) || 8884,
  username: import.meta.env.VITE_MQTT_USERNAME || 'lee_project',
  password: import.meta.env.VITE_MQTT_PASSWORD || 'Lee_project@123',
  topic: import.meta.env.VITE_MQTT_TOPIC || 'lee_bus/sensors',
};

// ─── Types ───
export interface GpsData {
  valid: boolean;
  lat: number;
  lng: number;
  alt: number;
  speed: number;     // km/h
  course: number;
  sats: number;
  time: string;
  date: string;
}

export interface Mpu6050Data {
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  temp: number;
}

export interface MicData {
  raw: number;
  voltage: number;
  db: number;
}

export interface SensorPayload {
  device: string;
  uptime: number;
  mpu6050: Mpu6050Data;
  gps: GpsData;
  mic: MicData;
}

export interface LiveBusData {
  deviceId: string;
  position: { lat: number; lng: number };
  speed: number;
  altitude: number;
  course: number;
  satellites: number;
  gpsValid: boolean;
  gpsTime: string;
  gpsDate: string;
  temperature: number;      // MPU6050 board temp
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  noiseDb: number;
  uptime: number;
  lastUpdate: Date;
  status: 'normal' | 'warning' | 'danger';
}

export type MqttConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseMqttReturn {
  buses: Map<string, LiveBusData>;
  busArray: LiveBusData[];
  connectionStatus: MqttConnectionStatus;
  lastMessage: SensorPayload | null;
  messageCount: number;
  reconnect: () => void;
}

// ─── Status determination logic ───
function determineStatus(data: SensorPayload): 'normal' | 'warning' | 'danger' {
  // Overspeeding threshold: > 80 km/h
  if (data.gps.valid && data.gps.speed > 80) return 'danger';
  
  // High acceleration (potential crash/harsh braking): > 2G on any axis
  const { accel } = data.mpu6050;
  const totalG = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
  if (totalG > 3.0) return 'danger';
  
  // Moderate warning thresholds
  if (data.gps.valid && data.gps.speed > 60) return 'warning';
  if (totalG > 2.0) return 'warning';
  if (data.mic.db > 90) return 'warning';
  
  return 'normal';
}

// ─── Hook ───
export function useMqtt(): UseMqttReturn {
  const [buses, setBuses] = useState<Map<string, LiveBusData>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<MqttConnectionStatus>('connecting');
  const [lastMessage, setLastMessage] = useState<SensorPayload | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const clientRef = useRef<MqttClient | null>(null);

  const connect = useCallback(() => {
    // Clean up previous connection
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }

    setConnectionStatus('connecting');

    const connectUrl = `wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`;
    const clientId = `admin_web_${Math.random().toString(16).slice(2, 8)}`;

    console.log(`[MQTT] Connecting to ${connectUrl}...`);

    const client = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 10000,
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      reconnectPeriod: 5000,
      protocolVersion: 4,
    });

    clientRef.current = client;

    client.on('connect', () => {
      console.log('[MQTT] ✅ Connected to HiveMQ Cloud!');
      setConnectionStatus('connected');

      client.subscribe(MQTT_CONFIG.topic, { qos: 1 }, (error) => {
        if (error) {
          console.error('[MQTT] Subscription failed:', error);
        } else {
          console.log(`[MQTT] 📡 Subscribed to: ${MQTT_CONFIG.topic}`);
        }
      });
    });

    client.on('message', (_topic: string, payload: Buffer) => {
      try {
        const data: SensorPayload = JSON.parse(payload.toString());
        setLastMessage(data);
        setMessageCount((prev) => prev + 1);

        const busData: LiveBusData = {
          deviceId: data.device,
          position: {
            lat: data.gps.valid ? data.gps.lat : 0,
            lng: data.gps.valid ? data.gps.lng : 0,
          },
          speed: data.gps.valid ? data.gps.speed : 0,
          altitude: data.gps.valid ? data.gps.alt : 0,
          course: data.gps.valid ? data.gps.course : 0,
          satellites: data.gps.sats,
          gpsValid: data.gps.valid,
          gpsTime: data.gps.time,
          gpsDate: data.gps.date,
          temperature: data.mpu6050.temp,
          accel: data.mpu6050.accel,
          gyro: data.mpu6050.gyro,
          noiseDb: data.mic.db,
          uptime: data.uptime,
          lastUpdate: new Date(),
          status: determineStatus(data),
        };

        setBuses((prev) => {
          const updated = new Map(prev);
          updated.set(data.device, busData);
          return updated;
        });
      } catch (err) {
        console.error('[MQTT] Failed to parse message:', err);
      }
    });

    client.on('error', (error: Error) => {
      console.error('[MQTT] Error:', error.message);
      setConnectionStatus('error');
    });

    client.on('reconnect', () => {
      console.log('[MQTT] 🔄 Reconnecting...');
      setConnectionStatus('connecting');
    });

    client.on('close', () => {
      console.log('[MQTT] Connection closed');
      setConnectionStatus('disconnected');
    });

    client.on('offline', () => {
      setConnectionStatus('disconnected');
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, [connect]);

  // Convert Map to array for easy rendering
  const busArray = Array.from(buses.values());

  return {
    buses,
    busArray,
    connectionStatus,
    lastMessage,
    messageCount,
    reconnect: connect,
  };
}
