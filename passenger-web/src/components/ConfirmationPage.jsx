import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldAlert } from 'lucide-react';

export default function ConfirmationPage({ type }) {
  const navigate = useNavigate();
  const isEmergency = type === 'emergency';

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
        <button className="back-btn" onClick={() => navigate('/')}>
          {isEmergency ? 'Back to Report Page' : 'Submit Another Report'}
        </button>
      </div>
    </div>
  );
}
