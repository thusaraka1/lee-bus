import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bus, MapPin, Navigation, Thermometer, Volume2,
  Satellite, Clock, Gauge, Wifi, WifiOff, RefreshCw, Activity
} from 'lucide-react';
import { useMqtt, LiveBusData } from '../hooks/useMqtt';

// ─── Custom bus marker icons ───
const createBusIcon = (status: string) => {
  const color = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  const pulse = status === 'danger' ? 'animation: pulseMarker 1.5s infinite;' : '';

  return L.divIcon({
    className: 'live-bus-marker',
    html: `
      <div style="
        position: relative;
        width: 32px; height: 32px; border-radius: 50%;
        background: ${color};
        border: 3px solid #fff;
        box-shadow: 0 0 20px ${color}80, 0 4px 12px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        ${pulse}
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/><path d="M15 6v6"/>
          <path d="M2 12h19.6"/>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
          <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// ─── No-GPS icon (gray, for devices without fix) ───
const noGpsIcon = L.divIcon({
  className: 'live-bus-marker',
  html: `
    <div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #64748b;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="width: 6px; height: 6px; background: #fff; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// ─── Auto-fit map to markers ───
function FitBounds({ buses }: { buses: LiveBusData[] }) {
  const map = useMap();
  const validBuses = buses.filter(b => b.gpsValid && b.position.lat !== 0);
  
  if (validBuses.length > 0) {
    const bounds = L.latLngBounds(validBuses.map(b => [b.position.lat, b.position.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }
  
  return null;
}

// ─── Status badge component ───
function StatusBadge({ status }: { status: string }) {
  const config = {
    normal: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Normal' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Warning' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Emergency' },
  }[status] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', label: 'Unknown' };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${config.bg} ${config.border} ${config.text}`}>
      {config.label}
    </span>
  );
}

// ─── Time ago helper ───
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

// ─── Format uptime ───
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];

const Fleet = () => {
  const { busArray, connectionStatus, messageCount, lastMessage, reconnect } = useMqtt();
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [autoFit, setAutoFit] = useState(true);

  // Determine map center — use first valid GPS or default to Sri Lanka
  const mapCenter = useMemo(() => {
    const valid = busArray.find(b => b.gpsValid && b.position.lat !== 0);
    return valid ? [valid.position.lat, valid.position.lng] as [number, number] : SRI_LANKA_CENTER;
  }, [busArray]);

  const statusColor = {
    connecting: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    connected: 'bg-green-50 border-green-200 text-green-700',
    disconnected: 'bg-red-50 border-red-200 text-red-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  }[connectionStatus];

  const statusDotColor = {
    connecting: 'bg-yellow-500',
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    error: 'bg-red-500',
  }[connectionStatus];

  const statusLabel = {
    connecting: 'MQTT Connecting...',
    connected: 'MQTT Live',
    disconnected: 'MQTT Disconnected',
    error: 'MQTT Error',
  }[connectionStatus];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* ─── Header Bar ─── */}
      <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Live Fleet Tracking
          </h3>
          <p className="text-sm text-slate-500">
            Real-time GPS from ESP32 via HiveMQ Cloud • {messageCount} messages received
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Buses Count */}
          <div className="flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Bus className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-slate-700">{busArray.length} Device{busArray.length !== 1 ? 's' : ''}</span>
          </div>

          {/* MQTT Status */}
          <span className={`px-3 py-1.5 border rounded-lg text-sm font-medium flex items-center ${statusColor}`}>
            <span className="relative flex h-2.5 w-2.5 mr-2">
              {connectionStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusDotColor}`}></span>
            </span>
            {statusLabel}
          </span>

          {/* Reconnect Button */}
          {connectionStatus !== 'connected' && (
            <button
              onClick={reconnect}
              className="p-2 text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg transition-colors"
              title="Reconnect"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Map + Side Panel ─── */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-md border border-slate-200 z-0 relative">
          <MapContainer
            center={mapCenter}
            zoom={8}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {autoFit && busArray.length > 0 && <FitBounds buses={busArray} />}

            {busArray.map((bus) => {
              // Skip devices with no GPS fix
              if (!bus.gpsValid || (bus.position.lat === 0 && bus.position.lng === 0)) return null;

              return (
                <Marker
                  key={bus.deviceId}
                  position={[bus.position.lat, bus.position.lng]}
                  icon={createBusIcon(bus.status)}
                  eventHandlers={{
                    click: () => setSelectedBusId(bus.deviceId),
                  }}
                >
                  <Popup className="premium-popup" maxWidth={320}>
                    <div className="p-1 min-w-[260px]">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                        <div>
                          <h3 className="font-bold text-base text-slate-800">{bus.deviceId}</h3>
                          <p className="text-xs text-slate-400">{timeAgo(bus.lastUpdate)}</p>
                        </div>
                        <StatusBadge status={bus.status} />
                      </div>

                      {/* GPS Info */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600">
                          <Navigation className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span>Speed: <strong className={bus.speed > 60 ? 'text-red-500' : 'text-green-600'}>{bus.speed.toFixed(1)} km/h</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span className="text-xs">{bus.position.lat.toFixed(6)}, {bus.position.lng.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Satellite className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span>Satellites: <strong>{bus.satellites}</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Thermometer className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span>Board Temp: <strong className={bus.temperature > 50 ? 'text-red-500' : ''}>{bus.temperature.toFixed(1)}°C</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Volume2 className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span>Noise: <strong className={bus.noiseDb > 80 ? 'text-red-500' : ''}>{bus.noiseDb.toFixed(1)} dB</strong></span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span>Uptime: <strong>{formatUptime(bus.uptime)}</strong></span>
                        </div>
                      </div>

                      {/* Accel/Gyro */}
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Accelerometer (G)</p>
                        <p className="text-xs text-slate-600">
                          X: {bus.accel.x.toFixed(3)} &nbsp; Y: {bus.accel.y.toFixed(3)} &nbsp; Z: {bus.accel.z.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map overlay glow */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 80px rgba(5, 5, 10, 0.7)' }}></div>

          {/* No GPS data overlay */}
          {connectionStatus === 'connected' && busArray.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-slate-200 pointer-events-auto">
                <Wifi className="h-12 w-12 text-blue-500 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Waiting for ESP32 Data</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Connected to MQTT broker. Waiting for the ESP32 device to publish sensor data on <code className="text-blue-600 bg-blue-50 px-1 rounded">lee_bus/sensors</code>
                </p>
              </div>
            </div>
          )}

          {connectionStatus !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-slate-200 pointer-events-auto">
                <WifiOff className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Connecting to MQTT...</h3>
                <p className="text-sm text-slate-500 max-w-xs mb-4">
                  Attempting to connect to HiveMQ Cloud broker via WebSocket (WSS).
                </p>
                <button
                  onClick={reconnect}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Side Panel: Device List ─── */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              Active Devices
            </h4>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2">
            {busArray.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-12">
                <Bus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No devices online
              </div>
            ) : (
              busArray.map((bus) => (
                <div
                  key={bus.deviceId}
                  onClick={() => setSelectedBusId(bus.deviceId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedBusId === bus.deviceId
                      ? 'border-blue-300 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-sm text-slate-800">{bus.deviceId}</h5>
                    <StatusBadge status={bus.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      <span>{bus.speed.toFixed(1)} km/h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Satellite className="h-3 w-3" />
                      <span>{bus.satellites} sats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      <span>{bus.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      <span>{bus.noiseDb.toFixed(1)} dB</span>
                    </div>
                  </div>

                  {bus.gpsValid ? (
                    <p className="text-[10px] text-slate-400 mt-2">
                      📍 {bus.position.lat.toFixed(4)}, {bus.position.lng.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-500 mt-2">⚠ No GPS fix</p>
                  )}

                  <p className="text-[10px] text-slate-400 mt-1">
                    Updated: {timeAgo(bus.lastUpdate)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Latest raw message preview */}
          {lastMessage && (
            <div className="border-t border-slate-100 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Latest Raw Data</p>
              <pre className="text-[9px] text-slate-500 bg-slate-50 rounded p-2 overflow-auto max-h-24 font-mono">
                {JSON.stringify(lastMessage, null, 1)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ─── Inject marker animation keyframes ─── */}
      <style>{`
        @keyframes pulseMarker {
          0%, 100% { box-shadow: 0 0 20px #ef444480, 0 4px 12px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 40px #ef4444cc, 0 4px 20px rgba(0,0,0,0.4); transform: scale(1.1); }
        }
        .live-bus-marker { background: none !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default Fleet;
