import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, Navigation2, Wifi, Radio } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMqtt } from '../hooks/useMqtt';

// ─── Create custom glowing DivIcons for live buses ───
const createLiveIcon = (status) => {
  const color = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  const pulse = status === 'danger' ? 'animation: pulseGlow 1.5s infinite;' : '';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        position: relative;
        width: 28px; height: 28px; border-radius: 50%;
        background: linear-gradient(135deg, ${color}, ${color}dd);
        border: 3px solid #fff;
        box-shadow: 0 0 20px ${color}80, 0 4px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        ${pulse}
      ">
        <div style="
          width: 8px; height: 8px;
          background-color: #fff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255,255,255,0.6);
        "></div>
      </div>
      <div style="
        position: absolute;
        top: -6px; left: -6px;
        width: 40px; height: 40px;
        border-radius: 50%;
        border: 2px solid ${color}40;
        animation: ripple 2s ease-out infinite;
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// ─── Demo / mock bus icon (smaller, dimmer) ───
const createDemoIcon = (status) => {
  const color = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        position: relative;
        width: 20px; height: 20px; border-radius: 50%;
        background-color: ${color}99;
        border: 2px solid #ffffff80;
        box-shadow: 0 0 10px ${color}40, 0 2px 4px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="width: 4px; height: 4px; background-color: #fff; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Mock routes for demo buses (keep for fallback/showcase)
const demoRoutes = {
  'BUS-0042': {
    start: [6.9271, 79.8612],
    end: [7.2906, 80.6337],
    status: 'success', name: 'Colombo - Kandy', speed: 65,
  },
  'BUS-0112': {
    start: [6.0535, 80.2210],
    end: [5.9549, 80.5353],
    status: 'warning', name: 'Galle - Matara', speed: 82,
  },
  'BUS-0089': {
    start: [7.2906, 80.6337],
    end: [6.9497, 80.7828],
    status: 'danger', name: 'Kandy - Nuwara E.', speed: 0,
  }
};

function lerp(start, end, t) {
  return start + (end - start) * t;
}

export default function MapView() {
  const [timestamp, setTimestamp] = useState(0);
  const { busArray, connectionStatus, messageCount } = useMqtt();

  // Animation Loop for demo buses
  useEffect(() => {
    let animationFrameId;
    const startTime = Date.now();

    const renderLoop = () => {
      const elapsed = Date.now() - startTime;
      const t = (elapsed % 30000) / 30000;
      const pingPongT = t < 0.5 ? t * 2 : 2 - (t * 2);
      setTimestamp(pingPongT);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const demoBuses = Object.entries(demoRoutes).map(([id, data]) => {
    const t = data.status === 'danger' ? 0.3 : timestamp;
    return {
      id,
      ...data,
      lat: lerp(data.start[0], data.end[0], t),
      lng: lerp(data.start[1], data.end[1], t),
    };
  });

  // Filter live buses with valid GPS
  const liveBuses = busArray.filter(b => b.gpsValid && b.position.lat !== 0);

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gr-md)' }}>
      {/* Legend Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} color="var(--accent-primary)" /> Live Map Overview
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* MQTT Status Indicator */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
            background: connectionStatus === 'connected' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: connectionStatus === 'connected' ? '#10b981' : '#f59e0b',
          }}>
            {connectionStatus === 'connected' ? <Wifi size={14} /> : <Radio size={14} />}
            {connectionStatus === 'connected' ? `MQTT Live (${messageCount})` : 'Connecting...'}
          </span>

          {/* Live device count */}
          {liveBuses.length > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
              background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#3b82f6', boxShadow: '0 0 6px #3b82f680',
                animation: 'pulseGlow 2s infinite',
              }}></span>
              {liveBuses.length} Live ESP32
            </span>
          )}

          <span className="status-badge success"><CheckCircle size={14} /> Normal</span>
          <span className="status-badge warning"><Navigation2 size={14} /> Overspeeding</span>
          <span className="status-badge danger"><AlertTriangle size={14} /> Emergency</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="card" style={{ flex: 1, minHeight: '600px', padding: 0, position: 'relative', overflow: 'hidden' }}>
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={8}
          style={{ width: '100%', height: '100%', background: '#0a0f1c' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* ── Live ESP32 Buses (primary, larger markers) ── */}
          {liveBuses.map((bus) => (
            <Marker
              key={`live-${bus.deviceId}`}
              position={[bus.position.lat, bus.position.lng]}
              icon={createLiveIcon(bus.status)}
            >
              <Popup className="premium-popup">
                <div style={{ padding: '4px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                        🟢 {bus.deviceId}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>LIVE ESP32</span>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                      background: bus.status === 'danger' ? '#fef2f2' : bus.status === 'warning' ? '#fffbeb' : '#f0fdf4',
                      color: bus.status === 'danger' ? '#dc2626' : bus.status === 'warning' ? '#d97706' : '#16a34a',
                    }}>
                      {bus.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: '#94a3b8' }}>Speed:</span>
                      <br />
                      <strong style={{ color: bus.speed > 60 ? '#ef4444' : '#10b981' }}>{bus.speed.toFixed(1)} km/h</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: '#94a3b8' }}>Temp:</span>
                      <br />
                      <strong>{bus.temperature.toFixed(1)}°C</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: '#94a3b8' }}>Noise:</span>
                      <br />
                      <strong>{bus.noiseDb.toFixed(1)} dB</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: '#94a3b8' }}>Sats:</span>
                      <br />
                      <strong>{bus.satellites}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '0.7rem', color: '#94a3b8' }}>
                    📍 {bus.position.lat.toFixed(6)}, {bus.position.lng.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ── Demo buses (smaller, dimmer markers for showcase) ── */}
          {demoBuses.map((bus) => (
            <Marker key={`demo-${bus.id}`} position={[bus.lat, bus.lng]} icon={createDemoIcon(bus.status)}>
              <Popup className="premium-popup">
                <div style={{ padding: '4px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>{bus.id}</h4>
                  <p style={{ margin: '0 0 4px', color: '#94a3b8', fontSize: '0.7rem' }}>DEMO • {bus.name}</p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Speed:</span>
                    <span style={{ fontSize: '0.8rem', color: `var(--status-${bus.status})` }}>{bus.speed} km/h</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Status:</span>
                    <span style={{ fontSize: '0.8rem', color: `var(--status-${bus.status})`, textTransform: 'uppercase' }}>
                      {bus.status === 'danger' ? 'Emergency' : bus.status === 'warning' ? 'Warning' : 'Active'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Abstract Map Overlay Glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 100px rgba(5, 5, 10, 0.9)' }}></div>
      </div>

      {/* Inject ripple animation */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
