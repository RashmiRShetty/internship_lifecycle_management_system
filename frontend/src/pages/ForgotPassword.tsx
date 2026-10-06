import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email');
    
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email, purpose: 'forgot-password' });
      alert('OTP sent successfully to your email');
      setStep(2);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Passwords do not match');
    if (newPassword.length < 6) return alert('Password must be at least 6 characters');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      alert('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.error || (typeof error.response?.data === 'string' ? error.response?.data : 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#06112e] text-slate-100 relative student-dot-canvas">
      {/* LEFT SIDE - Image & Branding */}
      <div className="hidden lg:flex w-[36%] relative overflow-hidden bg-gradient-to-br from-[#091b48] via-[#071438] to-[#040c24] border-r border-sky-400/20">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop"
          alt="Forgot Password background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-[#06112e]" />
        
        <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight text-white">InternSmart</h1>
          </Link>

          <div>
            <h2 className="text-5xl font-bold leading-tight text-white">
              Secure your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">account.</span>
            </h2>
            <p className="mt-6 text-slate-300 text-lg leading-8">
              We'll help you get back into your account safely and quickly.
            </p>
          </div>

          <div className="text-sm text-sky-300/70">
            © 2026 InternSmart Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 z-10">
        <div className="w-full max-w-[440px] rounded-3xl bg-gradient-to-br from-blue-950/80 via-blue-900/65 to-indigo-950/75 border border-sky-400/30 shadow-[0_25px_60px_-15px_rgba(2,10,36,0.85),0_0_40px_-10px_rgba(56,189,248,0.25)] p-8 sm:p-10 backdrop-blur-2xl text-white">
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors mb-6 uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <h1 className="text-3xl font-black text-white">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              {step === 1 
                ? "Enter your email and we'll send you an OTP to reset your password." 
                : "Enter the OTP sent to your email and create a new secure password."}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-300 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
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

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 shadow-md shadow-cyan-500/30 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-300 ml-1 uppercase tracking-wider">Verification OTP</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-sm tracking-[0.5em] font-bold text-white placeholder:text-slate-400"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-300 ml-1 uppercase tracking-wider">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="password" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-300 ml-1 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-md shadow-cyan-500/30 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-sky-400/20 text-center">
            <p className="text-xs text-slate-300 font-bold">
              Need help? Contact our <a href="mailto:support@internsmart.com" className="text-cyan-400 font-bold hover:underline">Support Team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;