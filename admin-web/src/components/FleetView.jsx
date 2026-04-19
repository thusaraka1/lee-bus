import React, { useState } from 'react';
import { Bus, Filter, Plus, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialFleetData = [
  { id: 'BUS-0042', route: 'Colombo - Kandy', driver: 'Saman Kumara', status: 'Active', complaintsToday: 0, lastUpdated: 'Just now' },
  { id: 'BUS-0112', route: 'Galle - Matara', driver: 'Nuwan Perera', status: 'Warning', complaintsToday: 2, lastUpdated: '2 mins ago' },
  { id: 'BUS-0089', route: 'Kandy - Nuwara Eliya', driver: 'Kamal Silva', status: 'Emergency', complaintsToday: 5, lastUpdated: '1 min ago' },
  { id: 'BUS-0331', route: 'Colombo - Negombo', driver: 'Ajith Peiris', status: 'Active', complaintsToday: 0, lastUpdated: '5 mins ago' },
  { id: 'BUS-0210', route: 'Kandy - Kurunegala', driver: 'Ruwan Fernando', status: 'Inactive', complaintsToday: 1, lastUpdated: '1 hour ago' },
];

export default function FleetView() {
  const navigate = useNavigate();
  const [fleetData, setFleetData] = useState(initialFleetData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ id: '', route: '', driver: '' });

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.route || !newVehicle.driver) return;
    
    const formattedVehicle = {
      ...newVehicle,
      status: 'Active',
      complaintsToday: 0,
      lastUpdated: 'Just now'
    };
    
    setFleetData([formattedVehicle, ...fleetData]);
    setIsModalOpen(false);
    setNewVehicle({ id: '', route: '', driver: '' });
  };

  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gr-md)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', fontWeight: 600, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Bus size={32} color="var(--accent-primary)" /> Fleet Terminal
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)', 
            borderRadius: '12px',
            fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s'
          }}>
            <Filter size={18} /> Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '0 20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '20px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle ID</th>
                <th style={{ padding: '20px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Route</th>
                <th style={{ padding: '20px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Driver</th>
                <th style={{ padding: '20px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Status</th>
                <th style={{ padding: '20px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Alerts</th>
                <th style={{ padding: '20px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Signal</th>
              </tr>
            </thead>
            <tbody>
              {fleetData.map((bus, idx) => {
                const isAlert = bus.complaintsToday > 0;
                return (
                  <tr 
                    key={idx} 
                    onClick={() => navigate('/history/' + bus.id)}
                    style={{ 
                      borderBottom: idx !== fleetData.length - 1 ? '1px solid var(--glass-border)' : 'none',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer'
                    }} 
                    className="hover-row"
                  >
                    <td style={{ padding: '16px', fontWeight: 700, fontSize: '1.05rem' }}>{bus.id}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{bus.route}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {bus.driver.charAt(0)}
                        </div>
                        {bus.driver}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`status-badge ${bus.status === 'Emergency' ? 'danger' : bus.status === 'Warning' ? 'warning' : bus.status === 'Inactive' ? 'secondary' : 'success'}`}
                            style={bus.status === 'Emergency' ? { animation: 'pulseGlow 2s infinite' } : {}}>
                        {bus.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {isAlert ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ background: 'var(--status-danger)', width: 8, height: 8, borderRadius: '50%', boxShadow: '0 0 8px var(--status-danger)' }}></div>
                          <span style={{ color: 'var(--status-danger)', fontWeight: 'bold' }}>{bus.complaintsToday} Warnings</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Clear</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{bus.lastUpdated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(8px)', animation: 'fadeInScale 0.3s forwards'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Add New Vehicle</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Register a new bus into the active fleet monitoring system.</p>

            <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vehicle Reg ID</label>
                <input 
                  type="text" 
                  value={newVehicle.id}
                  onChange={(e) => setNewVehicle({...newVehicle, id: e.target.value})}
                  placeholder="e.g. BUS-0455"
                  required
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Assigned Route</label>
                <input 
                  type="text" 
                  value={newVehicle.route}
                  onChange={(e) => setNewVehicle({...newVehicle, route: e.target.value})}
                  placeholder="e.g. Colombo - Kandy"
                  required
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Assigned Driver Name</label>
                <input 
                  type="text" 
                  value={newVehicle.driver}
                  onChange={(e) => setNewVehicle({...newVehicle, driver: e.target.value})}
                  placeholder="e.g. Nimal Perera"
                  required
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '1rem', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: 'var(--status-success)', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                >
                  <Check size={18} /> Confirm Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
