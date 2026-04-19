import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReportPage from './components/ReportPage';
import ConfirmationPage from './components/ConfirmationPage';
import './index.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ReportPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/confirmed" element={<ConfirmationPage type="report" />} />
        <Route path="/sos-confirmed" element={<ConfirmationPage type="emergency" />} />
      </Routes>
    </Router>
  );
}
