import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bus, QrCode, PlusCircle, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Live Fleet', path: '/admin/fleet', icon: Bus },
    { name: 'Register Bus', path: '/admin/register', icon: PlusCircle },
    { name: 'QR Gallery', path: '/admin/qr-codes', icon: QrCode },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <Bus className="h-8 w-8 text-blue-500 mr-3" />
          <span className="text-xl font-bold text-white tracking-wide">LeeBus Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <div className="h-8 border-l border-slate-200 mx-2"></div>
            
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                <span className="text-sm font-bold text-blue-700">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-slate-700">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'admin@lee.com'}</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="ml-4 p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
