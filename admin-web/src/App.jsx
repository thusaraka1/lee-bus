import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Map, Bus, AlertCircle, BarChart3, Settings, Bell } from 'lucide-react';

import MapView from './components/MapView';
import FleetView from './components/FleetView';
import ComplaintsView from './components/ComplaintsView';
import AnalyticsView from './components/AnalyticsView';
import VehicleHistoryView from './components/VehicleHistoryView';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bus size={20} color="white" />
            </div>
            <h1 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>SAFE RIDE<br/><span style={{ fontSize: '0.8rem', opacity: 0.8, background: 'none', WebkitTextFillColor: 'var(--text-muted)' }}>GUARDIAN</span></h1>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Map size={20} />
              <span>Live Map</span>
            </NavLink>
            <NavLink to="/fleet" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Bus size={20} />
              <span>Fleet Overview</span>
            </NavLink>
            <NavLink to="/complaints" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <AlertCircle size={20} />
              <span>Complaints</span>
              <span className="badge" style={{ animation: 'pulseGlow 2s infinite', marginLeft: 'auto' }}>3 New</span>
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <BarChart3 size={20} />
              <span>Analytics</span>
            </NavLink>
            
            <div style={{ flex: 1 }}></div>
            
            <div className="nav-link" style={{marginTop: 'auto', opacity: 0.7, cursor: 'pointer'}}>
              <Settings size={20} />
              <span>Settings</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="header">
            <div>
              <h2 style={{margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>System Dashboard</h2>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>Real-time fleet monitoring active</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
              <div style={{position: 'relative', cursor: 'pointer'}}>
                <Bell size={22} color="var(--text-muted)" />
                <div style={{position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: 'var(--status-danger)', border: '2px solid var(--bg-dark)'}}></div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '1.5rem', borderLeft: '1px solid var(--glass-border)'}}>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '0.9rem', fontWeight: 600}}>Admin User</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--status-success)'}}>Online</div>
                </div>
                <div style={{width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #475569, #1e293b)', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 0 10px rgba(0,0,0,0.5)'}}></div>
              </div>
            </div>
          </header>
          
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/fleet" element={<FleetView />} />
            <Route path="/complaints" element={<ComplaintsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/history/:id" element={<VehicleHistoryView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
