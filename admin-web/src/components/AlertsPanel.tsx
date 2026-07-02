import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, MapPin, Clock, Navigation, Thermometer, Volume2, RefreshCw, CheckCircle, Search, ShieldAlert, Eye } from 'lucide-react';

const API_URL = 'http://localhost:5000';

interface Alert {
  id: number;
  busId: string;
  alertType: string;
  description: string | null;
  busLat: number | null;
  busLng: number | null;
  busSpeed: number | null;
  busTemperature: number | null;
  busNoiseDb: number | null;
  passengerLat: number | null;
  passengerLng: number | null;
  deviceId: string | null;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: string;
}

const alertTypeLabels: Record<string, { label: string; color: string; bg: string }> = {
  overspeeding: { label: 'Overspeeding', color: 'text-red-700', bg: 'bg-red-100' },
  reckless: { label: 'Reckless Driving', color: 'text-amber-700', bg: 'bg-amber-100' },
  misconduct: { label: 'Driver Misconduct', color: 'text-purple-700', bg: 'bg-purple-100' },
  condition: { label: 'Vehicle Condition', color: 'text-cyan-700', bg: 'bg-cyan-100' },
  EMERGENCY_SOS: { label: '🚨 EMERGENCY SOS', color: 'text-red-700', bg: 'bg-red-200' },
  other: { label: 'Other Issue', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  investigating: { label: 'Investigating', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  resolved: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const updateStatus = async (alertId: number, newStatus: string) => {
    setUpdatingId(alertId);
    try {
      const response = await fetch(`${API_URL}/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus as Alert['status'] } : a));
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={fetchAlerts} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Passenger Alerts
          </h3>
          <p className="text-sm text-slate-500">Live reports from passengers with bus GPS coordinates</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="p-2 text-slate-400 hover:text-blue-600 border border-slate-200 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">No alerts reported yet</p>
          <p className="text-xs text-slate-400 mt-1">Passenger reports will appear here in real-time</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Time</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Bus ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Alert Type</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Bus Location</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const typeInfo = alertTypeLabels[alert.alertType] || alertTypeLabels.other;
                const statusInfo = statusConfig[alert.status] || statusConfig.pending;
                const isExpanded = expandedId === alert.id;
                const isEmergency = alert.alertType === 'EMERGENCY_SOS';

                return (
                  <>
                    <tr
                      key={alert.id}
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors ${isEmergency ? 'bg-red-50/50' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                    >
                      <td className="py-3 px-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {timeAgo(alert.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-800">{alert.busId}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {alert.busLat && alert.busLng ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{alert.busLat.toFixed(4)}, {alert.busLng.toFixed(4)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No GPS data</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr key={`${alert.id}-details`} className="bg-slate-50/80">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Bus Sensor Data */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Bus Sensor Data</h4>
                              <div className="space-y-2">
                                {alert.busLat && alert.busLng && (
                                  <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <MapPin className="h-4 w-4 text-green-500" />
                                    <span>GPS: <strong>{alert.busLat.toFixed(6)}, {alert.busLng.toFixed(6)}</strong></span>
                                  </div>
                                )}
                                {alert.busSpeed != null && (
                                  <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <Navigation className="h-4 w-4 text-blue-500" />
                                    <span>Speed: <strong className={alert.busSpeed > 60 ? 'text-red-500' : ''}>{alert.busSpeed.toFixed(1)} km/h</strong></span>
                                  </div>
                                )}
                                {alert.busTemperature != null && (
                                  <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <Thermometer className="h-4 w-4 text-orange-500" />
                                    <span>Temp: <strong>{alert.busTemperature.toFixed(1)}°C</strong></span>
                                  </div>
                                )}
                                {alert.busNoiseDb != null && (
                                  <div className="flex items-center text-sm text-slate-600 gap-2">
                                    <Volume2 className="h-4 w-4 text-purple-500" />
                                    <span>Noise: <strong>{alert.busNoiseDb.toFixed(1)} dB</strong></span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Description</h4>
                              <p className="text-sm text-slate-600">{alert.description || 'No description provided'}</p>
                              {alert.passengerLat && alert.passengerLng && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <p className="text-xs text-slate-400">Passenger Location</p>
                                  <p className="text-xs font-mono text-slate-500 mt-1">
                                    {alert.passengerLat.toFixed(6)}, {alert.passengerLng.toFixed(6)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Status Actions */}
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Update Status</h4>
                              <div className="flex flex-col gap-2">
                                {['pending', 'investigating', 'resolved'].map((s) => {
                                  const cfg = statusConfig[s];
                                  return (
                                    <button
                                      key={s}
                                      onClick={(e) => { e.stopPropagation(); updateStatus(alert.id, s); }}
                                      disabled={alert.status === s || updatingId === alert.id}
                                      className={`text-left px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                        alert.status === s
                                          ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-blue-300`
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                      } disabled:opacity-50`}
                                    >
                                      {cfg.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-3">
                                Alert #{alert.id} • {new Date(alert.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
