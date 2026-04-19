import React from 'react';
import { Activity, TrendingUp, AlertOctagon } from 'lucide-react';

export default function AnalyticsView() {
  return (
    <div className="content-area animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gr-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <Activity size={32} color="var(--accent-primary)" /> System Diagnostics
        </h2>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--glass-bg)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>This Week</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>This Month</span>
        </div>
      </div>

      {/* Top Summary Cards (Golden ratio sized layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--gr-md)' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}><AlertOctagon size={80} /></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Total Incidents</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>128</span>
              <span style={{ color: 'var(--status-success)', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>↓ 12%</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, var(--accent-primary), transparent)' }}></div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}><Activity size={80} /></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Avg Response Time</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3<span style={{fontSize:'1.5rem'}}>m</span> 45<span style={{fontSize:'1.5rem'}}>s</span></span>
              <span style={{ color: 'var(--status-success)', fontSize: '1rem', fontWeight: 600 }}>↓ 30s</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, var(--status-success), transparent)' }}></div>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}><TrendingUp size={80} /></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>High Risk Drivers</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--status-danger)', textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>4</span>
              <span style={{ color: 'var(--status-danger)', fontSize: '1rem', fontWeight: 600 }}>↑ 1</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, var(--status-danger), transparent)' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--gr-md)', flex: 1, minHeight: '350px' }}>
        {/* Main Chart Area */}
        <div className="card" style={{ flex: 1.618, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Incident Typology</h3>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '5%', paddingBottom: '30px', position: 'relative', borderBottom: '1px solid var(--glass-border)' }}>
            {/* Grid lines */}
            <div style={{ position: 'absolute', top: '25%', width: '100%', height: '1px', background: 'var(--glass-border)' }}></div>
            <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'var(--glass-border)' }}></div>
            <div style={{ position: 'absolute', top: '75%', width: '100%', height: '1px', background: 'var(--glass-border)' }}></div>

            {/* Glowing Bar Charts */}
            {[
              { label: 'Overspeeding', value: 80, color: 'var(--status-danger)' },
              { label: 'Reckless', value: 50, color: 'var(--status-warning)' },
              { label: 'Misconduct', value: 30, color: 'var(--accent-primary)' },
              { label: 'Other', value: 20, color: 'var(--text-muted)' }
            ].map(bar => (
              <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{bar.value}%</div>
                <div style={{ 
                  width: '60%', 
                  height: `${bar.value}%`, 
                  background: `linear-gradient(to top, transparent, ${bar.color})`, 
                  borderRadius: '6px 6px 0 0',
                  borderTop: `2px solid ${bar.color}`,
                  boxShadow: `0 -10px 30px ${bar.color}`
                }}></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Leaderboard */}
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Driver Risk Leaderboard</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Kamal Silva', incidents: 12, risk: 'High' },
              { name: 'Saman Kumara', incidents: 8, risk: 'Medium' },
              { name: 'Nuwan Perera', incidents: 5, risk: 'Low' },
              { name: 'Ajith Peiris', incidents: 1, risk: 'Low' }
            ].map((driver, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{driver.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{driver.incidents} incidents</div>
                  </div>
                </div>
                <span className={`status-badge ${driver.risk === 'High' ? 'danger' : driver.risk === 'Medium' ? 'warning' : 'success'}`}>
                  {driver.risk}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
