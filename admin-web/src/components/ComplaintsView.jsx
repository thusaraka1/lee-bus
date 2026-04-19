import React, { useState } from 'react';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

const initialComplaints = [
  { id: 'CMP-1049', busId: 'BUS-0042', type: 'Overspeeding', details: 'Bus is going 95km/h in a 60km/h zone near the highway exit.', time: '10:05 AM', status: 'New', risk: 'High' },
  { id: 'CMP-1048', busId: 'BUS-0112', type: 'Reckless Driving', details: 'Sudden braking caused passengers to fall.', time: '09:45 AM', status: 'Reviewed', risk: 'Medium' },
  { id: 'CMP-1047', busId: 'BUS-0089', type: 'Emergency', details: 'Passenger fainted. Driver pushed emergency button.', time: '09:30 AM', status: 'Resolved', risk: 'Critical' },
  { id: 'CMP-1046', busId: 'BUS-0331', type: 'Driver Misconduct', details: 'Passenger reported via QR code: driver is using phone.', time: '08:15 AM', status: 'Resolved', risk: 'Low' },
];

export default function ComplaintsView() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedID, setSelectedID] = useState(initialComplaints[0].id);

  const selected = initialComplaints.find(c => c.id === selectedID);

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', gap: 'var(--gr-md)', height: '100%' }}>
      {/* Main Complaints List (flex: 1.618) */}
      <div style={{ flex: 1.618, display: 'flex', flexDirection: 'column', gap: 'var(--gr-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.8rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <ShieldAlert size={32} color="var(--status-danger)" /> Incident Pipeline
          </h2>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            {['All', 'New', 'Reviewed', 'Resolved'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === tab ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.1))' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {initialComplaints.filter(c => activeTab === 'All' || c.status === activeTab).map(complaint => {
            const isSelected = selectedID === complaint.id;
            return (
              <div 
                key={complaint.id} 
                onClick={() => setSelectedID(complaint.id)}
                className="card"
                style={{
                  padding: '20px',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                  background: isSelected ? 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(20, 25, 40, 0.4))' : '',
                  boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.1)' : '',
                  transform: isSelected ? 'translateX(5px)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
                    background: complaint.status === 'New' ? 'linear-gradient(135deg, var(--status-danger), #7f1d1d)' : 
                                complaint.status === 'Reviewed' ? 'linear-gradient(135deg, var(--status-warning), #78350f)' : 
                                'linear-gradient(135deg, var(--status-success), #064e3b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: complaint.status === 'New' ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
                  }}>
                    {complaint.status === 'New' ? <AlertCircle color="white" /> : complaint.status === 'Reviewed' ? <Clock color="white" /> : <CheckCircle2 color="white" />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{complaint.busId}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{complaint.time}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>{complaint.type}</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{complaint.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Detail Panel (flex: 1) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="card" style={{ flex: 1, position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Incident Report</h3>
                <p style={{ color: 'var(--text-muted)' }}>ID: {selected.id}</p>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Vehicle</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selected.busId}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Event Type</div>
                  <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)', borderRadius: '8px', fontWeight: 600 }}>{selected.type}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Risk Assessment</div>
                  <div style={{ fontWeight: 600, color: selected.risk === 'Critical' || selected.risk === 'High' ? 'var(--status-danger)' : 'var(--status-warning)' }}>{selected.risk}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Passenger / Sensor Details</div>
                  <div style={{ padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', lineHeight: 1.6 }}>
                    "{selected.details}"
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, padding: '14px', background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Ignore</button>
                <button style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>Take Action</button>
              </div>
            </div>
          ) : (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select an incident to view full intelligence brief
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
