import mitLogo from '../assets/mit_logo.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight, Globe, Users, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLogin } from '@react-oauth/google';
import { publicApi } from '../services/api';
import ParticlesBackground from '../components/student/ParticlesBackground';

interface CustomJwtPayload {
  role: string;
  sub: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // Default role for Google Login
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (token: string) => {
    sessionStorage.setItem('token', token);
    localStorage.setItem('token', token);
    
    // Decode JWT to get user role
    const decoded = jwtDecode<CustomJwtPayload>(token);
    const userRole = decoded.role;

    // Redirect based on role
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      navigate('/admin');
    } else if (userRole === 'FACULTY') {
      navigate('/faculty');
    } else {
      navigate('/student');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Real API call to authentication
      const response = await publicApi.post('/auth/token', { email: email.trim().toLowerCase(), password: password.trim() });
      handleLoginSuccess(response.data);
    } catch (error: any) {
      console.error('Login error:', error);
      const rawData = error?.response?.data;
      const errorMessage = typeof rawData === 'string'
        ? rawData
        : rawData?.error || rawData?.message || 'Login failed. Please check your credentials or ensure backend is running.';
      
      // Provide specific message for admin approval pending/rejected
      const errorStr = String(errorMessage).toLowerCase();
      if (errorStr.includes('pending approval') || errorStr.includes('admin account pending')) {
        alert('Your admin account is pending approval from the Super Admin. You will be notified once your account is approved.');
      } else if (errorStr.includes('rejected') || errorStr.includes('has been rejected')) {
        alert('Your admin account has been rejected by the Super Admin. Please contact admin@internsmart.com for more information.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLoginFunction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Send the access token and selected role to backend
        const response = await publicApi.post('/auth/google-login', { 
          token: tokenResponse.access_token,
          role: role 
        });
        handleLoginSuccess(response.data);
      } catch (error: any) {
        console.error('Google Login error:', error);
        const errorMessage = error?.response?.data || 'Google Login failed. Please try again or use standard login.';
        
        // Check for admin approval errors
        const errorStr = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
        if (errorStr.includes('pending approval') || errorStr.includes('admin account pending')) {
          alert('Your admin account is pending approval from the Super Admin. You will be notified once your account is approved.');
        } else if (errorStr.includes('rejected') || errorStr.includes('has been rejected')) {
          alert('Your admin account has been rejected by the Super Admin. Please contact admin@internsmart.com for more information.');
        } else {
          alert(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      alert('Google Login Failed');
    }
  });

  const loginWithGoogle = () => {
    setShowGoogleRoleModal(true);
  };

  return (
    <div className="min-h-screen flex bg-[#06112e] text-slate-100 relative student-dot-canvas">
      <ParticlesBackground />
      {/* Google Role Selection Modal */}
      {showGoogleRoleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#091b48] border border-sky-400/30 rounded-3xl shadow-2xl shadow-cyan-500/20 max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200 text-white">
            <button 
              onClick={() => setShowGoogleRoleModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-sky-500/15 border border-sky-400/30 rounded-3xl flex items-center justify-center mx-auto text-sky-300">
                <Users className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Choose Your Role</h3>
                <p className="text-slate-300 font-medium">Select how you'll use InternSmart</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRole('STUDENT');
                    setShowGoogleRoleModal(false);
                    googleLoginFunction();
                  }}
                  disabled={loading}
                  className="group p-6 rounded-2xl border-2 border-sky-400/20 hover:border-sky-400 hover:bg-sky-500/15 transition-all flex flex-col items-center gap-3 active:scale-[0.97]"
                >
                  <div className="w-14 h-14 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-300">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="font-black text-sm text-white">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('FACULTY');
                    setShowGoogleRoleModal(false);
                    googleLoginFunction();
                  }}
                  disabled={loading}
                  className="group p-6 rounded-2xl border-2 border-sky-400/20 hover:border-sky-400 hover:bg-sky-500/15 transition-all flex flex-col items-center gap-3 active:scale-[0.97]"
                >
                  <div className="w-14 h-14 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="font-black text-sm text-white">Faculty</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDE - Content & Branding */}
      <div className="hidden lg:flex w-[35%] relative overflow-hidden bg-gradient-to-br from-[#091b48] via-[#071438] to-[#040c24] border-r border-sky-400/20">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
            alt="Collaboration"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-900/60" />
        
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={mitLogo} alt="MIT Logo" className="h-10 object-contain bg-white p-2.5 rounded-2xl shadow-xl border border-white/30" />
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-white leading-tight">InternSmart</h1>
              <span className="text-[10px] font-extrabold text-sky-300 uppercase tracking-widest">MIT Academic Portal</span>
            </div>
          </Link>

          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-sky-500/15 backdrop-blur-md px-4 py-2 rounded-full border border-sky-400/30 text-xs font-black uppercase tracking-widest text-sky-200">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              Empowering Careers
            </div>
            <h2 className="text-5xl font-black leading-[0.9] tracking-tight">
              Unlock your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">potential</span> today.
            </h2>
            <p className="text-base text-slate-300 font-medium leading-relaxed max-w-md">
              The central hub for managing your internship journey, from first application to final certification.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-sky-300/80 uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            <span>Trusted Worldwide</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-10">
        <div className="w-full max-w-[450px] space-y-7">
          <div className="text-center lg:text-left space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-300 font-medium">
              Access your personalized portal and manage your growth.
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-950/80 via-blue-900/65 to-indigo-950/75 border border-sky-400/30 shadow-[0_25px_60px_-15px_rgba(2,10,36,0.85),0_0_40px_-10px_rgba(56,189,248,0.25)] p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl -z-10" />
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" title="Reset your password" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-cyan-500/30 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sky-400/20"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]">
                  <span className="bg-[#09183e] px-4 text-sky-300/80 rounded-full border border-sky-400/20">Social Login</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={loading}
                  className="w-full h-12 bg-blue-950/70 border border-sky-400/30 text-white rounded-xl font-black text-sm hover:bg-blue-900/80 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-70 cursor-pointer"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-slate-300 font-bold text-sm">
            New to InternSmart?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
