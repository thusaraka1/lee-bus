import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bus, Gauge, AlertTriangle, UserX, Wrench, MessageCircle, Mic, MicOff, Send } from 'lucide-react';
import EmergencyButton from './EmergencyButton';

const complaintTypes = [
  { id: 'overspeeding', label: 'Over\u00ADspeeding', icon: <Gauge size={26} />, cls: 'speed' },
  { id: 'reckless', label: 'Reckless Driving', icon: <AlertTriangle size={26} />, cls: 'reckless' },
  { id: 'misconduct', label: 'Driver Misconduct', icon: <UserX size={26} />, cls: 'misconduct' },
  { id: 'condition', label: 'Vehicle Condition', icon: <Wrench size={26} />, cls: 'condition' },
  { id: 'other', label: 'Other Issue', icon: <MessageCircle size={26} />, cls: 'other' },
];

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const busId = searchParams.get('bus') || 'BUS-0042';

  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);

  const now = new Date();
  const timestamp = now.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setDetails((prev) => (prev ? prev + ' ' : '') + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleSubmit = () => {
    if (!selected) return;
    // In production this would POST to the backend
    const report = {
      busId,
      type: selected,
      details,
      timestamp: now.toISOString(),
      location: null // would be filled by Geolocation API
    };
    console.log('Report submitted:', report);
    navigate('/confirmed');
  };

  return (
    <div className="app-shell">
      {/* Bus Header */}
      <div className="bus-header">
        <div className="bus-icon">
          <Bus size={26} color="white" />
        </div>
        <div className="bus-info">
          <h1>Safe Ride Guardian</h1>
          <p>{busId} • {timestamp}</p>
        </div>
      </div>

      {/* Complaint Selector */}
      <div className="section-title">
        <AlertTriangle size={18} className="icon" />
        Select Issue Type
      </div>
      <div className="complaint-grid">
        {complaintTypes.map((type) => (
          <div
            key={type.id}
            className={`complaint-card ${selected === type.id ? 'selected' : ''}`}
            onClick={() => setSelected(type.id)}
          >
            <div className={`card-icon ${type.cls}`}>{type.icon}</div>
            <span className="card-label">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Details Section */}
      <div className="details-section">
        <div className="section-title">
          <MessageCircle size={18} className="icon" />
          Additional Details <span style={{ fontWeight: 400, color: 'var(--text-dim)', fontSize: '0.8rem' }}>(optional)</span>
        </div>
        <textarea
          className="text-input"
          placeholder="Describe what happened..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <div className="voice-row">
          <button className={`voice-btn ${isRecording ? 'recording' : ''}`} onClick={handleVoice} type="button">
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            {isRecording ? 'Stop' : 'Voice Input'}
          </button>
          {voiceText && <span className="voice-status">✓ Voice captured</span>}
        </div>
      </div>

      {/* Submit */}
      <button className="submit-btn" disabled={!selected} onClick={handleSubmit}>
        <Send size={20} />
        Submit Report
      </button>

      {/* SOS Button */}
      <EmergencyButton busId={busId} />
    </div>
  );
}
