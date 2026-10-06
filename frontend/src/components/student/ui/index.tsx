import React from 'react';
import { X, Inbox } from 'lucide-react';

export const Spinner = () => <div className="spinner" />;

export const SectionHead = ({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h1>
      {sub && <p className="mono-section-text text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">{sub}</p>}
    </div>
    {action}
  </div>
);

export const PrimaryButton = ({ children, onClick, disabled, className = '', type }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-all duration-300 shadow-[0_10px_30px_-8px_rgba(56,189,248,0.55)] active:scale-[0.98] whitespace-nowrap cursor-pointer overflow-hidden group ${className}`}
  >
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </button>
);

export const SecondaryButton = ({ children, onClick, className = '', type }: any) => (
  <button
    type={type}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.03] hover:from-white/[0.1] hover:to-white/[0.06] text-white font-bold text-xs border border-sky-400/15 hover:border-sky-400/35 transition-all duration-200 whitespace-nowrap cursor-pointer backdrop-blur-md shadow-lg shadow-black/20 ${className}`}
  >
    {children}
  </button>
);

export const GoldButton = ({ children, onClick, disabled, className = '', type }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-amber-500/12 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/18 disabled:opacity-50 disabled:cursor-not-allowed text-amber-300 font-black text-xs border border-amber-400/25 hover:border-amber-400/40 transition-all duration-200 whitespace-nowrap cursor-pointer backdrop-blur-md shadow-[0_4px_15px_-5px_rgba(245,158,11,0.3)] ${className}`}
  >
    {children}
  </button>
);

export const Pill = ({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) => {
  const map: Record<string, string> = {
    indigo: 'bg-gradient-to-r from-sky-500/18 to-blue-600/14 text-sky-300 border-sky-400/25',
    green: 'bg-gradient-to-r from-emerald-500/18 to-teal-600/14 text-emerald-300 border-emerald-400/25',
    emerald: 'bg-gradient-to-r from-emerald-500/18 to-teal-600/14 text-emerald-300 border-emerald-400/25',
    red: 'bg-gradient-to-r from-rose-500/18 to-pink-600/14 text-rose-300 border-rose-400/25',
    amber: 'bg-gradient-to-r from-amber-500/18 to-orange-600/14 text-amber-300 border-amber-400/25',
    blue: 'bg-gradient-to-r from-sky-500/18 to-blue-600/14 text-sky-300 border-sky-400/25',
    purple: 'bg-gradient-to-r from-violet-500/18 to-indigo-600/14 text-violet-300 border-violet-400/25',
    slate: 'bg-gradient-to-br from-slate-900/80 to-slate-900/60 text-slate-300 border-slate-700/60',
    peach: 'bg-gradient-to-r from-amber-500/18 to-orange-600/14 text-amber-300 border-amber-400/25',
    orange: 'bg-gradient-to-r from-amber-500/18 to-orange-600/14 text-amber-300 border-amber-400/25',
    bronze: 'bg-gradient-to-r from-amber-500/18 to-orange-600/14 text-amber-300 border-amber-400/25',
    applied: 'bg-gradient-to-r from-amber-500/18 to-orange-600/14 text-amber-300 border-amber-400/25',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-inner ${map[color] || map.slate}`}>
      {children}
    </span>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title, sub, action }: any) => (
  <div className="text-center py-14 px-6 border border-dashed border-sky-400/15 rounded-[2rem] bg-gradient-to-br from-slate-900/55 via-slate-900/45 to-blue-950/20 backdrop-blur-2xl shadow-2xl">
    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-sky-500/15 to-blue-600/10 border border-sky-400/20 shadow-inner">
      <Icon className="w-7 h-7 text-sky-300" />
    </div>
    <h3 className="text-sm font-extrabold text-white tracking-tight">{title}</h3>
    {sub && <p className="mono-section-text text-xs text-slate-300 mt-1.5 max-w-sm mx-auto leading-relaxed">{sub}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Modal = ({ children, onClose, maxWidth = 'max-w-lg' }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
    <div
      className={`relative w-full ${maxWidth} text-white rounded-[2rem] shadow-[0_35px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-15px_rgba(56,189,248,0.15)] overflow-hidden border border-sky-400/20 backdrop-blur-[32px] saturate-[180%] animate-in fade-in zoom-in-95 duration-200 z-10`}
      style={{
        background:
          'linear-gradient(135deg, rgba(10, 18, 50, 0.92) 0%, rgba(6, 12, 38, 0.88) 50%, rgba(8, 16, 48, 0.94) 100%)',
      }}
    >
      {children}
    </div>
  </div>
);

export const ModalHeader = ({ title, sub, onClose }: any) => (
  <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-sky-400/12 bg-gradient-to-b from-slate-900/60 to-transparent">
    <div>
      <h2 className="text-lg font-black text-white tracking-tight">{title}</h2>
      {sub && <p className="mono-section-text text-xs text-slate-300 mt-1 leading-relaxed">{sub}</p>}
    </div>
    <button
      onClick={onClose}
      className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer border border-transparent hover:border-sky-400/20"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

export const FormField = ({ label, children, hint, required }: any) => (
  <div className="space-y-1.5">
    <label className="mono-label-small text-slate-300/90">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
    {hint && <p className="mono-section-text text-[0.7rem] text-slate-300 leading-relaxed">{hint}</p>}
  </div>
);

export const StatCard = ({ label, value, sub, color: _color = 'blue' }: any) => {
  return (
    <div className="relative rounded-[1.75rem] p-5 sm:p-6 bg-gradient-to-br from-slate-900/55 via-slate-900/45 to-blue-950/25 border border-sky-400/15 shadow-2xl hover:shadow-sky-900/25 hover:border-sky-400/30 backdrop-blur-2xl saturate-[180%] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group">
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-sky-500/14 to-blue-600/0 blur-2xl group-hover:from-sky-500/22 transition-all duration-500 pointer-events-none" />
      <div className="mono-label-small text-sky-300/65 mb-1.5 tracking-widest">{label}</div>
      <div className="relative text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-400 drop-shadow-[0_0_18px_rgba(56,189,248,0.2)]">
        {value}
      </div>
      {sub && <div className="mono-section-text text-[0.78rem] text-slate-300 mt-2 leading-relaxed">{sub}</div>}
    </div>
  );
};

export const DetailStat = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-sky-400/12 rounded-[1.25rem] p-3.5 bg-gradient-to-br from-slate-900/60 via-slate-900/50 to-blue-950/20 text-center backdrop-blur-xl hover:border-sky-400/25 transition-all duration-200">
    <p className="mono-label-small text-sky-300/65 tracking-widest">{label}</p>
    <p className="text-xs font-extrabold text-white mt-0.5 tracking-tight">{value || 'N/A'}</p>
  </div>
);

export const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2.5">
    <p className="mono-label-small text-sky-300/70 tracking-widest">{title}</p>
    {children}
  </div>
);
