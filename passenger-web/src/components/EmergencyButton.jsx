import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function EmergencyButton({ busId }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleConfirmSOS = () => {
    // In production: POST emergency alert to backend with GPS
    const emergency = {
      busId,
      type: 'EMERGENCY_SOS',
      timestamp: new Date().toISOString(),
      location: null // would be filled via navigator.geolocation
    };
    console.log('🚨 EMERGENCY ALERT:', emergency);
    setShowModal(false);
    navigate('/sos-confirmed');
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldAlert size={30} color="var(--danger)" />
            </div>
            <h3>Send Emergency Alert?</h3>
            <p>This will immediately notify the control center. Your location and bus details will be shared.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="confirm-danger-btn" onClick={handleConfirmSOS}>Send SOS</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
