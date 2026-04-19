const mqtt = require('mqtt');

// HiveMQ Cloud configuration
const host = '9ce9a991c31542a49529dd4db804495d.s1.eu.hivemq.cloud';
const port = 8883; // Port for MQTT over TLS
const username = 'lee_project';
const password = 'Lee_project@123';
const topic = 'lee_bus/sensors';

// Generate a random client ID
const clientId = `mqtt_sub_${Math.random().toString(16).slice(2, 8)}`;
const connectUrl = `mqtts://${host}:${port}`;

console.log('----------------------------------------------------');
console.log(`🔌 Connecting to ${connectUrl}...`);
console.log('----------------------------------------------------');

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 5000,
  username: username,
  password: password,
  reconnectPeriod: 2000,
});

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ Cloud successfully!');
  
  // Subscribe to the topic
  client.subscribe(topic, { qos: 1 }, (error) => {
    if (!error) {
      console.log(`📡 Subscribed to topic: '${topic}'`);
      console.log('⏳ Waiting for ESP32 messages...\n');
    } else {
      console.error('❌ Subscription failed:', error);
    }
  });
});

client.on('message', (topic, payload) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n📦 [${timestamp}] Message received on topic '${topic}':`);
  
  try {
    // Attempt to parse and pretty-print JSON payload
    const data = JSON.parse(payload.toString());
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    // If it's not JSON, print as raw text
    console.log(payload.toString());
  }
});

client.on('error', (error) => {
  console.error('\n⚠️ Connection error:', error.message);
});

client.on('reconnect', () => {
  console.log('🔄 Reconnecting...');
});
