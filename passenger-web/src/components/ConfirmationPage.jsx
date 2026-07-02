import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ShieldAlert, MapPin, Navigation, Thermometer, Volume2 } from 'lucide-react';

export default function ConfirmationPage({ type }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmergency = type === 'emergency';

  // Data passed from ReportPage / EmergencyButton
  const state = location.state || {};
  const { alertId, busId, busLocation, busLocationAvailable } = state;

  return (
    <div className="app-shell">
      <div className="confirm-page">
        <div className={`confirm-icon ${isEmergency ? 'emergency' : 'success'}`}>
          {isEmergency
            ? <ShieldAlert size={44} />
            : <CheckCircle size={44} />
          }
        </div>
        <h2>{isEmergency ? 'Emergency Alert Sent!' : 'Report Submitted!'}</h2>
        <p>
          {isEmergency
            ? 'The control center has been notified immediately. Help is on the way. Stay calm and stay safe.'
            : 'Your complaint has been received and will be reviewed by our safety team. Thank you for helping keep everyone safe.'}
        </p>

        {/* Alert ID */}
        {alertId && (
          <div className="confirm-detail-card">
            <span className="confirm-label">Alert Reference</span>
            <span className="confirm-value">#{alertId}</span>
          </div>
        )}

        {/* Bus ID */}
        {busId && (
          <div className="confirm-detail-card">
            <span className="confirm-label">Bus Number</span>
            <span className="confirm-value">{busId}</span>
          </div>
        )}

        {/* Bus Location Data */}
        {busLocationAvailable && busLocation ? (
          <div className="confirm-location-card">
            <div className="location-header">
              <MapPin size={18} />
              <span>Bus Location Captured</span>
            </div>
            <div className="location-grid">
              <div className="location-item">
                <MapPin size={14} />
                <div>
                  <span className="loc-label">Coordinates</span>
                  <span className="loc-value">{busLocation.lat?.toFixed(6)}, {busLocation.lng?.toFixed(6)}</span>
                </div>
              </div>
              {busLocation.speed != null && (
                <div className="location-item">
                  <Navigation size={14} />
                  <div>
                    <span className="loc-label">Speed</span>
                    <span className="loc-value">{busLocation.speed?.toFixed(1)} km/h</span>
                  </div>
                </div>
              )}
              {busLocation.temperature != null && (
                <div className="location-item">
                  <Thermometer size={14} />
                  <div>
                    <span className="loc-label">Temperature</span>
                    <span className="loc-value">{busLocation.temperature?.toFixed(1)}°C</span>
                  </div>
                </div>
              )}
              {busLocation.noiseDb != null && (
                <div className="location-item">
                  <Volume2 size={14} />
                  <div>
                    <span className="loc-label">Noise Level</span>
                    <span className="loc-value">{busLocation.noiseDb?.toFixed(1)} dB</span>
                  </div>
                </div>
              )}
            </div>
            <p className="location-note">
              This data was captured from the bus's onboard sensors at the time of your report.
            </p>
          </div>
        ) : (
          <div className="confirm-detail-card" style={{ borderColor: 'var(--warning)' }}>
            <span className="confirm-label" style={{ color: 'var(--warning)' }}>Bus Location</span>
            <span className="confirm-value" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              GPS data unavailable — the bus device may be offline
            </span>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate('/')}>
          {isEmergency ? 'Back to Report Page' : 'Submit Another Report'}
        </button>
      </div>
    </div>
  );
}
