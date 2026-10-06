const FacultyDashboardStyles = () => (
  <style>{`
    :root {
      --blue: #8b5cf6;
      --blue-50: rgba(139, 92, 246, 0.15);
      --blue-100: rgba(139, 92, 246, 0.3);
      --blue-600: #7c3aed;
      --green: #8b5cf6;
      --green-50: rgba(139, 92, 246, 0.15);
      --green-100: rgba(139, 92, 246, 0.3);
      --green-600: #a78bfa;
      --green-700: #7c3aed;
      --bronze: #c084fc;
      --purple: #c084fc;
      --purple-50: rgba(192, 132, 252, 0.15);
      --purple-100: rgba(192, 132, 252, 0.3);
      --amber: #f59e0b;
      --amber-50: rgba(245, 158, 11, 0.15);
      --amber-100: rgba(245, 158, 11, 0.3);
      --red: #ef4444;
      --red-50: rgba(239, 68, 68, 0.15);
      --slate-50: #12092b;
      --slate-100: #1d0e42;
      --slate-200: rgba(168, 85, 247, 0.15);
      --slate-300: #c084fc;
      --slate-400: #94a3b8;
      --slate-500: #cbd5e1;
      --slate-600: #e2e8f0;
      --slate-700: #f1f5f9;
      --slate-800: #f8fafc;
      --slate-900: #ffffff;
      --radius-sm: 10px;
      --radius: 14px;
      --radius-lg: 24px;
      --sidebar-w: 250px;
      --header-h: 64px;
    }

    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; background-color: #12092b; color: #ffffff; }

    .fd-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background-color: #0b132b !important;
      background-image: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 70%) !important;
      background-size: cover !important;
      background-position: center !important;
      background-attachment: fixed !important;
      position: relative;
    }
    .fd-sidebar {
      width: var(--sidebar-w);
      background: #0f172a !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border-right: 1px solid rgba(139, 92, 246, 0.2) !important;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100vh;
      overflow: hidden;
      position: fixed;
      top: 0; left: 0;
      z-index: 50;
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5) !important;
    }
    .fd-sidebar.closed { transform: translateX(-100%); }
    .fd-logo { height: var(--header-h); padding: 0 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(139, 92, 246, 0.2); flex-shrink: 0; }
    .fd-logo-mark { width: 34px; height: 34px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; box-shadow: 0 2px 10px rgba(139,92,246,0.3); }
    .fd-logo-text { font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px; }
    .fd-nav { flex: 1; overflow-y: auto; padding: 14px 12px; }
    .fd-nav::-webkit-scrollbar { display: none; }
    .fd-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 14px; border-radius: 9999px;
      cursor: pointer; color: #e2e8f0;
      font-size: 12px; font-weight: 600; text-decoration: none;
      transition: background 0.15s, color 0.15s; position: relative; user-select: none; margin-bottom: 4px;
    }
    .fd-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; }
    .fd-nav-item:hover { background: rgba(139, 92, 246, 0.18); color: #ffffff; }
    .fd-nav-item.active { background: linear-gradient(90deg, #8b5cf6, #6366f1) !important; color: #ffffff !important; font-weight: 800; box-shadow: 0 2px 12px rgba(139,92,246,0.35) !important; }
    .fd-nav-item.active svg { color: #ffffff; }
    .fd-nav-badge { margin-left: auto; background: var(--red); color: #fff; font-size: 10px; font-weight: 800; border-radius: 20px; padding: 1px 6px; line-height: 1.4; }
    .fd-sidebar-footer { border-top: 1px solid rgba(139, 92, 246, 0.2); padding: 12px; }
    .fd-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 40;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .fd-overlay.open { opacity: 1; pointer-events: auto; }
    .fd-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; margin-left: 0 !important; width: 100% !important; transition: margin-left 0.25s ease; }
    
    .fd-header {
      height: var(--header-h);
      background: rgba(15, 23, 42, 0.92) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border-bottom: 1px solid rgba(139, 92, 246, 0.2) !important;
      padding: 0 24px; display: flex; align-items: center; justify-between; gap: 16px;
      flex-shrink: 0; position: sticky; top: 0; z-index: 30;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
    }
    .fd-content {
      flex: 1; overflow-y: auto; padding: 24px; position: relative;
      background: transparent !important;
    }
    .card, .fd-card {
      background: rgba(15, 23, 42, 0.82) !important;
      backdrop-filter: blur(20px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
      border: 1px solid rgba(139, 92, 246, 0.2) !important;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5) !important;
      color: #ffffff !important;
      border-radius: 1.5rem !important;
      padding: 20px;
    }
    .card:hover, .fd-card:hover {
      border-color: rgba(139, 92, 246, 0.45) !important;
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.6) !important;
    }
  `}</style>
);

export default FacultyDashboardStyles;
