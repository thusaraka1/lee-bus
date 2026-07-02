import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bus, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.user, data.token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-950 overflow-hidden font-sans text-slate-300">
      
      {/* Left Side - Visual Area (Golden Ratio ~62%) */}
      <div className="hidden lg:flex lg:w-[62%] relative bg-slate-950 overflow-hidden">
        {/* Deep ambient gradients */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen translate-x-1/3 translate-y-1/3"></div>
        
        {/* Subtle grid pattern for modern touch */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        
        <div className="relative z-30 flex flex-col px-16 xl:px-24 h-full py-16">
          {/* Top Logo */}
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Bus className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold ml-4 tracking-wider text-slate-100 uppercase letter-spacing-2">LeeBus Connect</h1>
          </div>
          
          {/* Centered Main Text */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-6xl xl:text-7xl font-light leading-tight mb-8 text-white tracking-tight">
              Elevating <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Transit Intelligence</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-xl leading-relaxed font-light">
              Experience the pinnacle of fleet management. Precision tracking, predictive analytics, and seamless operations powered by artificial intelligence.
            </p>
          </div>
          
          {/* Bottom Footer */}
          <div className="mt-auto flex items-center gap-6 text-sm text-slate-500 uppercase tracking-widest font-semibold">
            <span>© 2026 LeeBus Transit</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></span>
            <span>Enterprise Edition</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel (Golden Ratio ~38%) */}
      <div className="w-full lg:w-[38%] flex items-center justify-center p-8 sm:p-12 relative z-20 border-l border-slate-800/50 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
        
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center mb-12">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Bus className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold ml-3 text-slate-100 uppercase tracking-widest">LeeBus</h1>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Sign In</h2>
            <p className="text-slate-400 mt-3 text-sm">Authenticate to access the command center.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-950/50 border border-red-900/50 text-red-400 rounded-lg text-sm flex items-start animate-in fade-in">
                <div className="mt-0.5 mr-3 flex-shrink-0">!</div>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner"
                    placeholder="admin@lee.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-medium text-amber-500/80 hover:text-amber-400 transition-colors">Forgot?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-inner"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 mt-8 border border-transparent rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.15)] text-sm font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="ml-2 h-4 w-4 text-slate-800 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
