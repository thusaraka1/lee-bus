import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function EmergencyButton({ busId }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleConfirmSOS = async () => {
    if (!busId?.trim()) {
      alert('Please enter a bus number first.');
      setShowModal(false);
      return;
    }

    setIsSending(true);

    try {
      // Get passenger's GPS location
      let passengerLat = null;
      let passengerLng = null;

      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        passengerLat = pos.coords.latitude;
        passengerLng = pos.coords.longitude;
      } catch (geoErr) {
        console.warn('Could not get passenger location:', geoErr.message);
      }

      // Send emergency alert to backend
      const response = await fetch(`${API_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busId: busId.trim(),
          alertType: 'EMERGENCY_SOS',
          description: 'EMERGENCY SOS triggered by passenger',
          passengerLat,
          passengerLng,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      const result = await response.json();

      setShowModal(false);
      navigate('/sos-confirmed', {
        state: {
          alertId: result.id,
          busId: busId.trim(),
          busLocation: result.busLocation,
          busLocationAvailable: result.busLocationAvailable,
        }
      });
    } catch (err) {
      console.error('🚨 SOS Error:', err);
      alert('Failed to send emergency alert. Please call emergency services directly.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="sos-container">
        <button className="sos-btn" onClick={() => setShowModal(true)}>
          <ShieldAlert size={24} />
          EMERGENCY SOS
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => !isSending && setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldAlert size={30} color="var(--danger)" />
            </div>
            <h3>Send Emergency Alert?</h3>
            <p>This will immediately notify the control center. Your location and bus details will be shared.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)} disabled={isSending}>Cancel</button>
              <button className="confirm-danger-btn" onClick={handleConfirmSOS} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ marginRight: 6 }} />
                    Sending...
                  </>
                ) : (
                  'Send SOS'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
