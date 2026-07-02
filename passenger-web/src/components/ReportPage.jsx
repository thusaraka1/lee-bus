import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bus, Gauge, AlertTriangle, UserX, Wrench, MessageCircle, Mic, MicOff, Send, MapPin, Loader2 } from 'lucide-react';
import EmergencyButton from './EmergencyButton';

const API_URL = 'http://localhost:5000';

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
  const busId = searchParams.get('bus') || searchParams.get('busId') || '';

  const [manualBusId, setManualBusId] = useState(busId);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const recognitionRef = useRef(null);

  const now = new Date();
  const timestamp = now.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });

  // Get passenger's GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPassengerLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationStatus('success');
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setLocationStatus('error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus('error');
    }
  }, []);

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

  const handleSubmit = async () => {
    const effectiveBusId = manualBusId.trim();
    if (!selected || !effectiveBusId) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busId: effectiveBusId,
          alertType: selected,
          description: details || null,
          passengerLat: passengerLocation?.lat || null,
          passengerLng: passengerLocation?.lng || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit report');
      }

      const result = await response.json();

      // Navigate to confirmation with alert data
      navigate('/confirmed', {
        state: {
          alertId: result.id,
          busId: effectiveBusId,
          alertType: selected,
          busLocation: result.busLocation,
          busLocationAvailable: result.busLocationAvailable,
        }
      });
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <p>{manualBusId || 'Enter Bus Number'} • {timestamp}</p>
        </div>
      </div>

      {/* Bus ID Input — shown when no bus ID from QR */}
      <div className="bus-id-section">
        <div className="section-title">
          <Bus size={18} className="icon" />
          Bus Number
        </div>
        <div className="bus-id-input-row">
          <input
            type="text"
            className="bus-id-input"
            placeholder="Enter bus number (e.g. WP-ND-1234)"
            value={manualBusId}
            onChange={(e) => setManualBusId(e.target.value)}
          />
          {manualBusId && (
            <div className="bus-id-status">
              <Bus size={14} /> {manualBusId}
            </div>
          )}
        </div>

        {/* Passenger location status */}
        <div className="location-status">
          {locationStatus === 'loading' && (
            <span className="loc-badge loading"><Loader2 size={12} className="spin" /> Getting your location...</span>
          )}
          {locationStatus === 'success' && (
            <span className="loc-badge success"><MapPin size={12} /> Location captured</span>
          )}
          {locationStatus === 'error' && (
            <span className="loc-badge error"><MapPin size={12} /> Location unavailable</span>
          )}
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

      {/* Error message */}
      {submitError && (
        <div className="submit-error">
          <AlertTriangle size={16} /> {submitError}
        </div>
      )}

      {/* Submit */}
      <button
        className="submit-btn"
        disabled={!selected || !manualBusId.trim() || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="spin" />
            Sending Alert...
          </>
        ) : (
          <>
            <Send size={20} />
            Submit Report
          </>
        )}
      </button>

      {/* SOS Button */}
      <EmergencyButton busId={manualBusId} />
    </div>
  );
}
