import React from 'react';

export const StudentDashboardStyles: React.FC = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #04091a;
      color: #f8fafc;
      overflow-x: hidden;
    }

    .student-dot-canvas {
      background-color: #050c20 !important;
      background-image: radial-gradient(ellipse 85% 65% at 50% 0%, rgba(29, 78, 216, 0.15) 0%, transparent 80%), radial-gradient(circle at 10% 90%, rgba(14, 165, 233, 0.10) 0%, transparent 60%) !important;
      background-size: 100% 100% !important;
      background-position: center !important;
      background-attachment: fixed !important;
      position: relative;
    }

    .glass-card, .card {
      background: rgba(8, 16, 40, 0.88) !important;
      border: 1px solid rgba(56, 189, 248, 0.18) !important;
      box-shadow: 0 10px 25px -10px rgba(2, 8, 24, 0.7) !important;
      color: #ffffff !important;
      backdrop-filter: blur(20px) saturate(140%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
      border-radius: 1.5rem !important;
    }

    .glass-card:hover, .card:hover {
      border-color: rgba(56, 189, 248, 0.45) !important;
      box-shadow: 0 12px 30px -8px rgba(14, 165, 233, 0.2), 0 0 15px rgba(56, 189, 248, 0.12) !important;
      transform: translateY(-3px) !important;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .glass-header {
      background: rgba(6, 14, 36, 0.95) !important;
      backdrop-filter: blur(28px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2) !important;
      box-shadow: 0 4px 20px rgba(2, 8, 26, 0.7), 0 0 15px rgba(29, 78, 216, 0.15), inset 0 1px 0 rgba(255,255,255,0.06) !important;
    }

    .sd-sidebar {
      background: linear-gradient(180deg, rgba(6, 14, 38, 0.98) 0%, rgba(4, 10, 28, 0.98) 100%) !important;
      border-right: 1px solid rgba(56, 189, 248, 0.2) !important;
      box-shadow: 0 0 30px -10px rgba(29, 78, 216, 0.2), inset 0 1px 0 rgba(255,255,255,0.06) !important;
    }

    .sd-content {
      background: transparent !important;
    }

    .bg-brand-orange, .bg-brand-green, .bg-brand-purple {
      background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      box-shadow: 0 8px 25px -5px rgba(56, 189, 248, 0.4) !important;
      border-radius: 999px !important;
    }
    .hover\:bg-brand-orange:hover, .hover\:bg-brand-green:hover, .hover\:bg-brand-purple:hover {
      background: linear-gradient(135deg, #1e40af, #0284c7) !important;
      transform: translateY(-1px);
      box-shadow: 0 10px 30px -5px rgba(56, 189, 248, 0.5) !important;
    }
    .text-brand-orange, .text-brand-green, .text-brand-purple {
      color: #38bdf8 !important;
    }

    .text-brand-bronze, .text-brand-emerald, .text-brand-violet {
      color: #38bdf8 !important;
    }
    .border-brand-bronze, .border-brand-emerald, .border-brand-violet {
      border-color: rgba(56, 189, 248, 0.3) !important;
    }

    .btn-periwinkle {
      background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      box-shadow: 0 8px 25px -5px rgba(56, 189, 248, 0.4) !important;
      border-radius: 999px !important;
    }
    .btn-periwinkle:hover {
      background: linear-gradient(135deg, #1e40af, #0284c7) !important;
      transform: translateY(-1px);
    }

    .badge-match-peach, .badge-match-mint, .badge-match-pink {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(29, 78, 216, 0.2)) !important;
      color: #7dd3fc !important;
      border: 1px solid rgba(56, 189, 248, 0.35) !important;
      border-radius: 999px !important;
      font-weight: 700 !important;
      backdrop-filter: blur(8px) !important;
    }

    .badge-status-applied {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.2)) !important;
      color: #fbbf24 !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
      border-radius: 999px !important;
      font-weight: 700 !important;
      backdrop-filter: blur(8px) !important;
    }

    .ds-content::-webkit-scrollbar { width: 8px; }
    .ds-content::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(56, 189, 248, 0.45), rgba(29, 78, 216, 0.45));
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .ds-content::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(56, 189, 248, 0.65), rgba(29, 78, 216, 0.65));
      background-clip: padding-box;
    }
    .ds-nav::-webkit-scrollbar { display: none; }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-right-color: #0ea5e9;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 60px auto;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .pulse-dot { animation: pulse2 1.4s infinite; }

    .input-field {
      width: 100%;
      background-color: rgba(10, 28, 74, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.38);
      border-radius: 0.875rem;
      padding: 0.625rem 1rem;
      font-size: 0.8125rem;
      color: #ffffff;
      transition: all 0.2s ease;
    }
    .input-field:focus {
      outline: none;
      background-color: rgba(15, 38, 98, 0.98);
      border-color: rgba(56, 189, 248, 0.75);
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
    }
    .input-field::placeholder {
      color: #94a3b8;
    }

    .mono-section-text {
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
      font-size: 0.875rem;
      line-height: 1.85;
      letter-spacing: 0.01em;
      color: #f1f5f9;
      font-weight: 400;
    }

    .mono-label-small {
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
      font-size: 0.65rem;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      font-weight: 700;
      color: #38bdf8;
      opacity: 1;
    }
  `}</style>
);

export default StudentDashboardStyles;
