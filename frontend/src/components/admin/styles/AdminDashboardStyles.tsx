import React from 'react';

export const AdminDashboardStyles: React.FC = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #0b132b;
      color: #f8fafc;
      overflow-x: hidden;
    }

    .admin-dot-canvas {
      background-color: #0b132b !important;
      background-image: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 70%) !important;
      background-size: 100% 100% !important;
      background-position: center !important;
      background-attachment: fixed !important;
      position: relative;
    }

    .glass-card, .card {
      background: rgba(15, 23, 42, 0.82) !important;
      border: 1px solid rgba(52, 211, 153, 0.2) !important;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5) !important;
      color: #ffffff !important;
      backdrop-filter: blur(20px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
      border-radius: 1.5rem !important;
    }

    .glass-card:hover, .card:hover {
      border-color: rgba(52, 211, 153, 0.45) !important;
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.6) !important;
    }

    .glass-header {
      background: rgba(11, 19, 43, 0.92) !important;
      backdrop-filter: blur(28px) saturate(200%) !important;
      -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
      border-bottom: 1px solid rgba(52, 211, 153, 0.28) !important;
      box-shadow: 0 4px 30px rgba(2, 10, 36, 0.6), 0 0 25px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.08) !important;
    }

    .sd-sidebar {
      background: linear-gradient(180deg, rgba(11, 19, 43, 0.97) 0%, rgba(7, 13, 30, 0.97) 100%) !important;
      border-right: 1px solid rgba(52, 211, 153, 0.25) !important;
      box-shadow: 0 0 60px -10px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.08) !important;
    }

    .input-field {
      width: 100%;
      background-color: rgba(11, 19, 43, 0.9);
      border: 1px solid rgba(52, 211, 153, 0.35);
      border-radius: 0.875rem;
      padding: 0.625rem 1rem;
      font-size: 0.8125rem;
      color: #ffffff;
      transition: all 0.2s ease;
    }
    .input-field:focus {
      outline: none;
      background-color: rgba(19, 34, 68, 0.98);
      border-color: rgba(52, 211, 153, 0.7);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
    }
    .input-field::placeholder {
      color: #94a3b8;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      color: #ffffff;
      font-weight: 800;
      border-radius: 0.875rem;
      padding: 0.625rem 1.25rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    }

    .btn-secondary {
      background: rgba(19, 34, 68, 0.85);
      border: 1px solid rgba(52, 211, 153, 0.35);
      color: #ffffff;
      font-weight: 700;
      border-radius: 0.875rem;
      padding: 0.625rem 1.25rem;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background: rgba(28, 48, 92, 0.95);
      border-color: rgba(52, 211, 153, 0.6);
    }

    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(11, 19, 43, 0.5);
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(52, 211, 153, 0.4);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.7);
    }
  `}</style>
);

export default AdminDashboardStyles;
