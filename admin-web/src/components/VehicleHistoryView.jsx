import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Info, Search, Calendar, Play } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// Mock historical route data
const historyData = {
  'BUS-0042': {
    name: 'Colombo - Kandy', driver: 'Saman Kumara',
    route: [
      [6.9271, 79.8612], [6.9350, 79.9100], [6.9500, 79.9800],
      [7.0500, 80.1200], [7.1500, 80.3500], [7.2906, 80.6337]
    ],
    incidents: [
      { coord: [7.0500, 80.1200], type: 'Overspeeding', speed: 85, time: '08:22 AM' }
    ]
  },
  'BUS-0112': {
    name: 'Galle - Matara', driver: 'Nuwan Perera',
    route: [
      [6.0535, 80.2210], [6.0100, 80.3500], [5.9800, 80.4500], [5.9549, 80.5353]
    ],
    incidents: [
      { coord: [6.0100, 80.3500], type: 'Sudden Braking', speed: 40, time: '09:12 AM' }
    ]
  },
  'BUS-0089': {
    name: 'Kandy - Nuwara E.', driver: 'Kamal Silva',
    route: [
      [7.2906, 80.6337], [7.1500, 80.6800], [7.0500, 80.7200], [6.9497, 80.7828]
    ],
    incidents: [
      { coord: [7.0500, 80.7200], type: 'Emergency Stop', speed: 0, time: '10:45 AM' }
    ]
  }
};

const createStatusIcon = (color) => L.divIcon({
  className: 'custom-bus-marker',
  html: `<div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${color}; border: 3px solid #fff; box-shadow: 0 0 10px ${color};"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function VehicleHistoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const busData = historyData[id] || historyData['BUS-0042'];
  const [activeRoute, setActiveRoute] = useState(busData.route);
  
  const lats = activeRoute.map(p => p[0]);
  const lngs = activeRoute.map(p => p[1]);
  const bounds = [
    [Math.min(...lats) - 0.05, Math.min(...lngs) - 0.05],
    [Math.max(...lats) + 0.05, Math.max(...lngs) + 0.05]
  ];

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate filtering by removing the first and last point if the route has enough points
      if (busData.route.length > 3) {
        // Just alternating between full route and sliced route for visual proof
        if (activeRoute.length === busData.route.length) {
          setActiveRoute(busData.route.slice(1, busData.route.length - 1));
        } else {
          setActiveRoute(busData.route);
        }
      } else {
        // Reverse trick to force re-render
        setActiveRoute([...activeRoute].reverse());
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gr-md)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '50%',
              width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Tracking History: {id}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{busData.name} • Driven by {busData.driver}</p>
          </div>
        </div>
      </div>

      {/* Date / Time Range Selector Panel */}
      <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', zIndex: 10, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6))', flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Filter Date</label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '12px 16px' }}>
            <Calendar size={20} color="var(--accent-primary)" style={{ marginRight: '12px' }} />
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontFamily: 'Inter', fontSize: '1rem' }} />
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Start Time</label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '12px 16px' }}>
            <Clock size={20} color="var(--accent-primary)" style={{ marginRight: '12px' }} />
            <input type="time" defaultValue="06:00" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontFamily: 'Inter', fontSize: '1rem' }} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>End Time</label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '12px 16px' }}>
            <Clock size={20} color="var(--status-danger)" style={{ marginRight: '12px' }} />
            <input type="time" defaultValue="18:00" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontFamily: 'Inter', fontSize: '1rem' }} />
          </div>
        </div>

        <div>
          <button onClick={handleSearch} style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s',
            height: '48px'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            {loading ? <div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Search size={18} />}
            {loading ? 'Filtering...' : 'Apply Filter'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--gr-md)', flex: 1, minHeight: '500px', opacity: loading ? 0.4 : 1, transition: 'opacity 0.3s' }}>
        {/* Map Container */}
        <div className="card" style={{ flex: 1.618, padding: 0, position: 'relative', overflow: 'hidden', background: '#0a0f1c' }}>
          <MapContainer 
            key={activeRoute[0].toString() + activeRoute.length} // Force re-render map bounds on change
            bounds={bounds}
            style={{ width: '100%', height: '100%', background: '#0a0f1c' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <Polyline positions={activeRoute} color="var(--accent-primary)" weight={5} opacity={0.8} />

            <Marker position={activeRoute[0]} icon={createStatusIcon('var(--status-success)')}>
              <Popup className="premium-popup">Start of Filtered Route</Popup>
            </Marker>
            
            <Marker position={activeRoute[activeRoute.length - 1]} icon={createStatusIcon('var(--text-muted)')}>
              <Popup className="premium-popup">End of Filtered Route</Popup>
            </Marker>

            {busData.incidents.map((inc, i) => (
              <CircleMarker key={i} center={inc.coord} radius={8} color="var(--status-danger)" fillColor="var(--status-danger)" fillOpacity={0.7}>
                <Popup className="premium-popup">
                  <h4 style={{ margin: '0 0 4px', color: 'var(--status-danger)' }}>{inc.type}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Speed recorded: {inc.speed} km/h</p>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 100px rgba(5, 5, 10, 0.9)', zIndex: 1000 }}></div>
        </div>

        {/* Side Panel for Event Log */}
        <div className="card" style={{ flex: 1, overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} color="var(--accent-primary)" /> Tracking Timeline
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: 'var(--glass-border)' }}></div>
            
            <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></div>
              <div>
                <p style={{ fontWeight: 600, margin: '4px 0 2px' }}>Start Location</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>07:05 AM</p>
              </div>
            </div>

            {busData.incidents.map((inc, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--status-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'pulseGlow 2s infinite' }}></div>
                <div style={{ background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--status-danger)', margin: '0 0 4px' }}>{inc.type}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Speed: {inc.speed} km/h</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>{inc.time} - Triggered</p>
                </div>
              </div>
            ))}

             <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-bg)', border: '2px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></div>
              <div>
                <p style={{ fontWeight: 600, margin: '4px 0 2px' }}>Latest Plot Point</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>End of Filtered Range</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for loading spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
          opacity: 0.8;
        }
        input[type="date"]:hover::-webkit-calendar-picker-indicator,
        input[type="time"]:hover::-webkit-calendar-picker-indicator {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
