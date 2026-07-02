import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BusRegistration from './pages/BusRegistration';
import QRGallery from './pages/QRGallery';
import Fleet from './pages/Fleet';
import PassengerReport from './pages/PassengerReport'; // Public facing
import Login from './pages/Login';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/report" element={<PassengerReport />} />
        <Route path="/login" element={<Login />} />
        
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Legacy redirects for old URLs */}
        <Route path="/fleet" element={<Navigate to="/admin/fleet" replace />} />
        <Route path="/register" element={<Navigate to="/admin/register" replace />} />
        <Route path="/qr-codes" element={<Navigate to="/admin/qr-codes" replace />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="register" element={<BusRegistration />} />
            <Route path="qr-codes" element={<QRGallery />} />
          </Route>
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
