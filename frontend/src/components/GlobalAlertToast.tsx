import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type AlertTone = 'success' | 'warning' | 'error' | 'info';

interface AlertToast {
  id: number;
  message: string;
  tone: AlertTone;
}

const getTone = (message: string): AlertTone => {
  if (/\b(failed|failure|error|unable|invalid|not found)\b/i.test(message)) return 'error';
  if (/\b(please|must|required|cannot|not allowed|pending)\b/i.test(message)) return 'warning';
  if (/\b(success|successfully|saved|updated|approved|accepted|created|deleted|assigned|sent|uploaded|completed|issued|removed)\b/i.test(message)) return 'success';
  return 'info';
};

const toneStyles: Record<AlertTone, { color: string; border: string; background: string; title: string }> = {
  success: {
    color: '#34d399',
    border: 'rgba(52, 211, 153, 0.35)',
    background: 'rgba(52, 211, 153, 0.12)',
    title: 'Completed',
  },
  warning: {
    color: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.35)',
    background: 'rgba(251, 191, 36, 0.12)',
    title: 'Check this',
  },
  error: {
    color: '#fb7185',
    border: 'rgba(251, 113, 133, 0.35)',
    background: 'rgba(251, 113, 133, 0.12)',
    title: 'Something went wrong',
  },
  info: {
    color: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.35)',
    background: 'rgba(56, 189, 248, 0.12)',
    title: 'InternSmart',
  },
};

export const GlobalAlertToast = () => {
  const [toast, setToast] = useState<AlertToast | null>(null);

  useEffect(() => {
    const originalAlert = window.alert;
    let nextId = 0;

    window.alert = (message?: unknown) => {
      const text = String(message ?? '');
      setToast({ id: ++nextId, message: text, tone: getTone(text) });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  if (!toast) return null;

  const style = toneStyles[toast.tone];
  const Icon = toast.tone === 'success'
    ? CheckCircle2
    : toast.tone === 'warning' || toast.tone === 'error'
    ? AlertCircle
    : Info;

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 30000,
        width: 'min(420px, calc(100vw - 32px))',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '15px 16px',
        color: '#e2e8f0',
        background: 'rgba(8, 19, 48, 0.97)',
        border: `1px solid ${style.border}`,
        borderRadius: '14px',
        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.48)',
        backdropFilter: 'blur(18px)',
        animation: 'internsmart-toast-in 180ms ease-out',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '34px',
          height: '34px',
          flex: '0 0 34px',
          display: 'grid',
          placeItems: 'center',
          color: style.color,
          background: style.background,
          border: `1px solid ${style.border}`,
          borderRadius: '10px',
        }}
      >
        <Icon size={18} />
      </span>
      <div style={{ minWidth: 0, flex: 1, paddingTop: '1px' }}>
        <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, lineHeight: 1.3 }}>
          {style.title}
        </div>
        <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, marginTop: '3px', overflowWrap: 'anywhere' }}>
          {toast.message}
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => setToast(null)}
        style={{
          width: '28px',
          height: '28px',
          flex: '0 0 28px',
          display: 'grid',
          placeItems: 'center',
          color: '#94a3b8',
          background: 'transparent',
          border: 0,
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        <X size={16} />
      </button>
      <style>{`@keyframes internsmart-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};