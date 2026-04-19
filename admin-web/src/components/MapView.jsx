import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, CheckCircle, Navigation2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock routes with start and end destinations in Sri Lanka
const routes = {
  'BUS-0042': {
    start: [6.9271, 79.8612], // Colombo
    end: [7.2906, 80.6337],   // Kandy
    status: 'success', name: 'Colombo - Kandy', speed: 65,
  },
  'BUS-0112': {
    start: [6.0535, 80.2210], // Galle
    end: [5.9549, 80.5353],   // Matara
    status: 'warning', name: 'Galle - Matara', speed: 82,
  },
  'BUS-0089': {
    start: [7.2906, 80.6337], // Kandy
    end: [6.9497, 80.7828],   // Nuwara Eliya
    status: 'danger', name: 'Kandy - Nuwara E.', speed: 0,
  }
};

// Lerp helper to calculate position
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Create custom glowing DivIcons for Leaflet
const createIcon = (status) => {
  const color = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  const pulse = status === 'danger' ? 'pulse-danger' : '';
  
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        position: relative;
        width: 24px; height: 24px; border-radius: 50%;
        background-color: ${color};
        border: 3px solid #fff;
        box-shadow: 0 0 15px ${color}, 0 4px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        animation: ${pulse ? 'pulseGlow 1.5s infinite' : 'none'};
      ">
        <div style="width: 6px; height: 6px; background-color: #fff; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export default function MapView() {
  const [timestamp, setTimestamp] = useState(0);

  // Animation Loop Setup
  useEffect(() => {
    let animationFrameId;
    const startTime = Date.now();

    const renderLoop = () => {
      // Loop cycle from 0 to 1 over 10 seconds, then repeat (for demo purposes)
      const elapsed = Date.now() - startTime;
      const t = (elapsed % 30000) / 30000; // 30 sec trip
      // We want them moving back and forth just so they keep animating
      const pingPongT = t < 0.5 ? t * 2 : 2 - (t * 2);
      
      setTimestamp(pingPongT);
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const buses = Object.entries(routes).map(([id, data]) => {
    // If it's a danger bus, it's stopped, so don't apply full animation to it, keep it stationary
    const t = data.status === 'danger' ? 0.3 : timestamp;
    return {
      id,
      ...data,
      lat: lerp(data.start[0], data.end[0], t),
      lng: lerp(data.start[1], data.end[1], t),
    };
  });

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gr-md)' }}>
      {/* Legend Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} color="var(--accent-primary)" /> Live Map Overview
        </h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span className="status-badge success"><CheckCircle size={14} /> Normal</span>
          <span className="status-badge warning"><Navigation2 size={14} /> Overspeeding</span>
          <span className="status-badge danger"><AlertTriangle size={14} /> Emergency</span>
        </div>
      </div>

      {/* Main Map Container using React Leaflet */}
      <div className="card" style={{ flex: 1, minHeight: '600px', padding: 0, position: 'relative', overflow: 'hidden' }}>
        <MapContainer 
          center={[7.8731, 80.7718]} 
          zoom={8} 
          style={{ width: '100%', height: '100%', background: '#0a0f1c' }}
          zoomControl={false}
        >
          {/* Dark Mode professional CartoDB tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          
          {buses.map((bus) => (
            <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={createIcon(bus.status)}>
              <Popup className="premium-popup">
                <div style={{ padding: '4px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>{bus.id}</h4>
                  <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.85rem' }}>{bus.name}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Speed:</span>
                    <span style={{ fontSize: '0.8rem', color: `var(--status-${bus.status})` }}>{bus.speed} km/h</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Status:</span>
                    <span style={{ fontSize: '0.8rem', color: `var(--status-${bus.status})`, textTransform: 'uppercase' }}>{bus.status === 'danger' ? 'Emergency' : bus.status === 'warning' ? 'Warning' : 'Active'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Abstract Map Overlay Glow (keeps it premium) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 100px rgba(5, 5, 10, 0.9)' }}></div>
      </div>
    </div>
  );
}
