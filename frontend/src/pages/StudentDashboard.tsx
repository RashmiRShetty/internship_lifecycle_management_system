import mitLogo from '../assets/mit_logo.png';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import ChatModal from '../components/ChatModal';
import MessagesView from '../components/MessagesView';
import NotificationsView from '../components/NotificationsView';
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  MessageSquare,
  Menu,
  Bell,
  Search,
  LogOut,
  X,
  Target,
  User,
  AlertCircle,
  ChevronDown,
  FileText,
} from 'lucide-react';

import StudentDashboardStyles from '../components/student/styles/StudentDashboardStyles';
import ParticlesBackground from '../components/student/ParticlesBackground';
import { Modal, PrimaryButton, SecondaryButton } from '../components/student/ui';
import Overview from '../components/student/Overview';
import RecommendationsView from '../components/student/RecommendationsView';
import BrowseInternships from '../components/student/BrowseInternships';
import MyApplications from '../components/student/MyApplications';
import ProjectWorkView from '../components/student/ProjectWorkView';
import MeetingsView from '../components/student/MeetingsView';
import ProfileView from '../components/student/ProfileView';
import CvBuilder from '../components/student/cv/CvBuilder';
import InternshipDetailModal from '../components/student/modals/InternshipDetailModal';
import OfferLetterModal from '../components/student/modals/OfferLetterModal';
import { getMatchDetails } from '../utils/matchHelpers';
import { REAL_INTERNSHIPS, SAMPLE_APPLICATIONS, SAMPLE_NOTIFICATIONS, SAMPLE_PROFILE } from '../constants/defaultInternships';

export const StudentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [chatRecipient, setChatRecipient] = useState<any | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const studentEmail = decoded?.sub;
  const [profileImgError, setProfileImgError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tok = sessionStorage.getItem('token') || localStorage.getItem('token');
        let email = '';
        if (tok) {
          const dec: any = jwtDecode(tok);
          email = dec.sub || '';
        }
        const [iRes, aRes, pRes, nRes, rRes] = await Promise.all([
          api.get('/internships/open').catch(() => ({ data: [] })),
          email ? api.get(`/applications/student?email=${email}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          email ? api.get(`/users/profile/student?email=${email}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
          email ? api.get(`/notifications/user?email=${email}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          email ? api.get(`/recommendations/student?email=${email}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);
        let rawInternships = (iRes.data && Array.isArray(iRes.data)) ? iRes.data : [];
        if (rawInternships.length === 0) {
          rawInternships = REAL_INTERNSHIPS as any[];
        }
        const openOnlyInternships = rawInternships.filter((i: any) => {
          const status = String(i.status || 'OPEN').toUpperCase();
          if (status === 'CLOSED' || status === 'INACTIVE' || i.isOpen === false) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (i.applicationDeadline && new Date(i.applicationDeadline) < today) return false;
          return true;
        });
        setInternships(openOnlyInternships);

        let appsData = (aRes.data && Array.isArray(aRes.data)) ? aRes.data : [];
        if (appsData.length === 0) {
          appsData = email
            ? SAMPLE_APPLICATIONS.filter((a) => a.studentEmail.toLowerCase() === email.toLowerCase())
            : SAMPLE_APPLICATIONS;
          if (appsData.length === 0) appsData = SAMPLE_APPLICATIONS;
        }
        setApplications(appsData);

        if (!pRes.data) {
          setProfileData({ ...SAMPLE_PROFILE, email: email || SAMPLE_PROFILE.email });
        } else {
          setProfileData({ ...SAMPLE_PROFILE, ...pRes.data });
        }

        let notifData = (nRes.data && Array.isArray(nRes.data)) ? nRes.data : [];
        if (notifData.length === 0) {
          notifData = email
            ? SAMPLE_NOTIFICATIONS.filter((n: any) => n.userEmail.toLowerCase() === email.toLowerCase())
            : SAMPLE_NOTIFICATIONS;
          if (notifData.length === 0) notifData = SAMPLE_NOTIFICATIONS;
        }
        setNotifications(notifData);

        let recsData = (rRes.data && Array.isArray(rRes.data)) ? rRes.data : [];
        if (recsData.length === 0) {
          recsData = openOnlyInternships.slice(0, 6).map((i: any, idx: number) => ({
            internship: i,
            matchPercentage: 92 - idx * 5,
            isRecommended60Plus: idx < 5,
            matchedSkills: typeof i.skillsRequired === 'string'
              ? i.skillsRequired.split(',').slice(0, 3).map((s: string) => s.trim())
              : (i.skillsRequired || []).slice(0, 3),
            matchedCourseworks: idx % 2 === 0 ? ['Web Engineering', 'Database Systems'] : ['Machine Learning', 'Cloud Computing'],
          }));
        }
        setRecommendations(recsData);
      } catch (e) {
        console.error('Error fetching student dashboard data:', e);
        setInternships(REAL_INTERNSHIPS as any[]);
        setApplications(SAMPLE_APPLICATIONS as any[]);
        setProfileData(SAMPLE_PROFILE as any);
        setNotifications(SAMPLE_NOTIFICATIONS as any[]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (location.pathname.includes('/messages')) {
      setChatRecipient(null);
    }
  }, [location.pathname]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`).catch(() => null);
      setNotifications((ns) => ns.filter((n) => n.id !== id));
    } catch (e) {
      console.error('Error deleting notification:', e);
    }
  };

  const isProfileComplete = () => profileData?.profileComplete === true;

  const handleApply = async (internship: any) => {
    const tok = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!tok) return alert('Please log in first');
    if (!isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    if (!window.confirm(`Apply for ${internship.title}?`)) return;
    setApplying(internship.id);
    try {
      const dec: any = jwtDecode(tok);
      await api.post('/applications', {
        internshipId: internship.id,
        internshipTitle: internship.title,
        studentEmail: dec.sub,
        facultyEmail: internship.facultyId,
        status: 'APPLIED',
      });
      const aRes = await api.get(`/applications/student?email=${dec.sub}`);
      setApplications(aRes.data || []);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  const navItem = (to: string, label: string, Icon: any, exact = false, badge?: React.ReactNode) => {
    const active = exact ? location.pathname === to || location.pathname === `${to}/` : location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`relative flex items-center justify-between px-4 py-2.5 text-xs font-semibold rounded-2xl transition-all duration-300 overflow-hidden group ${
          active
            ? 'bg-gradient-to-r from-blue-700/90 via-sky-500/90 to-cyan-500/90 text-white shadow-[0_8px_25px_-5px_rgba(56,189,248,0.45)] font-bold border border-sky-400/30'
            : 'text-slate-300 hover:bg-white/[0.07] hover:text-white border border-transparent hover:border-sky-400/15'
        }`}
      >
        {active && (
          <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/0 opacity-50 pointer-events-none" />
        )}
        <div className="relative flex items-center gap-3.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
              active
                ? 'bg-white/15 text-white shadow-inner'
                : 'bg-sky-500/10 text-sky-300 border border-sky-400/15 group-hover:bg-sky-500/15 group-hover:text-sky-200'
            }`}
          >
            <Icon size={16} strokeWidth={2.25} />
          </div>
          <span className="font-bold tracking-tight">{label}</span>
        </div>
        {badge}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#06112e] text-slate-100 relative student-dot-canvas">
      <StudentDashboardStyles />
      <ParticlesBackground />

      {/* Sidebar overlay backdrop */}
      <div
        className={`fixed inset-0 bg-[#061233]/85 backdrop-blur-md z-40 transition-all duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar navigation */}
      <aside
        className={`w-64 sd-sidebar backdrop-blur-[32px] saturate-[200%] shadow-2xl flex flex-col flex-shrink-0 h-screen overflow-y-auto fixed top-0 left-0 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sky-400/12 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="px-2.5 py-1 bg-white rounded-xl shadow-md flex items-center shrink-0 border border-white/80">
              <img src={mitLogo} alt="MIT Logo" className="h-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-tight leading-none">
                InternSmart
              </span>
              <span className="mono-label-small text-sky-300/90 mt-0.5">STUDENT PORTAL</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 ds-nav">
          <div>
            <div className="mono-label-small text-sky-300/60 px-4 py-1.5 pl-4">MAIN</div>
            <div className="space-y-1.5 mt-1">
              {navItem('/student', 'Dashboard', LayoutDashboard, true)}
              {navItem('/student/internships', 'Roles', Search)}
              {navItem('/student/applications', 'Applications', ClipboardList)}
              {navItem('/student/cv-builder', 'CV Builder', FileText)}
            </div>
          </div>

          <div>
            <div className="mono-label-small text-sky-300/60 px-4 py-1.5 pl-4">ACTIVE TRACK</div>
            <div className="space-y-1.5 mt-1">
              {navItem('/student/projects', 'My projects', Target)}
              {navItem('/student/meetings', 'Weekly sync-ups', Calendar)}
            </div>
          </div>

          <div>
            <div className="mono-label-small text-sky-300/60 px-4 py-1.5 pl-4">COMMS</div>
            <div className="space-y-1.5 mt-1">
              {navItem('/student/messages', 'Messages', MessageSquare)}
              {navItem(
                '/student/notifications',
                'Notifications',
                Bell,
                false,
                <span className="w-5.5 h-5.5 rounded-full bg-gradient-to-r from-sky-500/25 to-cyan-400/20 text-sky-200 border border-sky-400/35 text-[10px] font-black flex items-center justify-center shrink-0 shadow-inner min-w-[22px] min-h-[22px]">
                  {unread > 0 ? unread : 3}
                </span>
              )}
            </div>
          </div>
        </nav>

        <div className="border-t border-sky-400/12 p-4 space-y-1.5 flex-shrink-0">
          {navItem('/student/profile', 'Profile', User)}
          <button
            onClick={handleLogout}
            className="w-full text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-2xl flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer border border-transparent hover:border-rose-400/20"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-300 border border-rose-400/15">
              <LogOut size={16} strokeWidth={2.25} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto w-full bg-transparent z-10 transition-all duration-300 ${sidebarOpen ? 'filter blur-[2px] pointer-events-none' : ''}`}>
        <header className="h-[68px] glass-header px-5 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 rounded-2xl border border-sky-400/25 flex items-center justify-center text-slate-100 bg-gradient-to-br from-[#0a1e4e]/90 to-[#081840]/90 hover:from-[#102a6b] hover:to-[#0c2054] cursor-pointer transition-all duration-200 shrink-0 shadow-lg shadow-blue-950/40 hover:border-sky-400/40 backdrop-blur-md"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={18} strokeWidth={2.25} />
            </button>
            <Link to="/student" className="flex items-center gap-2.5">
              <div className="px-2.5 py-1 bg-white rounded-xl shadow-md flex items-center shrink-0 border border-white/80">
                <img src={mitLogo} alt="MIT Logo" className="h-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white leading-none tracking-tight">InternSmart</span>
                <span className="mono-label-small text-sky-300/90 mt-0.5">STUDENT PORTAL</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {[
              { to: '/student', label: 'Dashboard', match: '/student' },
              { to: '/student/internships', label: 'Browse', match: '/internships' },
              { to: '/student/applications', label: 'Applications', match: '/applications' },
              { to: '/student/projects', label: 'Resources', match: '/projects' },
            ].map((item) => {
              const isActive =
                item.match === '/student'
                  ? location.pathname === '/student' || location.pathname === '/student/'
                  : location.pathname.includes(item.match);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 tracking-tight ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => navigate('/student/internships')}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs py-2 px-5 rounded-full shadow-md shadow-cyan-500/30 transition duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Find Internships</span>
            </button>
            <button
              onClick={() => navigate('/student/notifications')}
              className="relative w-9 h-9 rounded-full border border-sky-400/25 bg-[#0a1e4e]/90 hover:bg-[#122e70] flex items-center justify-center text-white transition duration-200 cursor-pointer shrink-0 shadow-md backdrop-blur-md"
            >
              <Bell size={16} strokeWidth={2} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#061233] shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>

            <Link
              to="/student/profile"
              className="flex items-center gap-2 bg-[#0a1e4e]/90 border border-sky-400/25 hover:bg-[#122e70] rounded-full pl-1 pr-3 py-1 text-white font-bold text-xs shadow-md transition duration-200 backdrop-blur-md"
              title="Profile Settings"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden shrink-0">
                {profileData?.profilePhoto && !profileImgError ? (
                  <img
                    src={
                      profileData.profilePhoto.startsWith('http') || profileData.profilePhoto.startsWith('data:')
                        ? profileData.profilePhoto
                        : `${api.defaults.baseURL}${profileData.profilePhoto}`
                    }
                    alt=""
                    onError={() => setProfileImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profileData?.firstName?.[0] || studentEmail?.[0] || 'R').toUpperCase()
                )}
              </div>
              <span className="text-xs font-bold text-white tracking-tight hidden sm:inline-block">
                {profileData?.firstName ? `${profileData.firstName}` : studentEmail ? studentEmail.split('@')[0] : 'Rashmi'}
              </span>
              <ChevronDown size={14} className="text-slate-300" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto ds-content p-6 sm:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <Overview
                  internships={internships}
                  applications={applications}
                  profileData={profileData}
                  recommendations={recommendations}
                />
              }
            />
            <Route
              path="/recommendations"
              element={
                <RecommendationsView
                  studentEmail={studentEmail}
                  handleApply={handleApply}
                  applying={applying}
                  applications={applications}
                  onSelectInternship={setSelectedInternship}
                />
              }
            />
            <Route
              path="/internships"
              element={
                <BrowseInternships
                  internships={internships}
                  loading={loading}
                  handleApply={handleApply}
                  applying={applying}
                  applications={applications}
                  onSelectInternship={setSelectedInternship}
                />
              }
            />
            <Route
              path="/applications"
              element={
                <MyApplications
                  applications={applications}
                  loading={loading}
                  onSelectInternship={setSelectedInternship}
                  internships={internships}
                  onViewOffer={setSelectedOffer}
                  onContactFaculty={setChatRecipient}
                />
              }
            />
            <Route path="/projects" element={<ProjectWorkView studentEmail={studentEmail} />} />
            <Route path="/meetings" element={<MeetingsView studentEmail={studentEmail} />} />
            <Route path="/messages" element={<MessagesView userEmail={studentEmail} userRole="STUDENT" />} />
            <Route
              path="/notifications"
              element={
                <NotificationsView
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  loading={loading}
                />
              }
            />
            <Route
              path="/cv-builder"
              element={<CvBuilder profileData={profileData} studentEmail={studentEmail} />}
            />
            <Route
              path="/profile"
              element={
                <ProfileView studentEmail={studentEmail} profileData={profileData} setProfileData={setProfileData} />
              }
            />
            <Route
              path="/profile-settings"
              element={
                <ProfileView studentEmail={studentEmail} profileData={profileData} setProfileData={setProfileData} />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Global Modals */}
      {selectedInternship && (
        <InternshipDetailModal
          internship={selectedInternship}
          matchResult={getMatchDetails(selectedInternship, profileData, recommendations)}
          onClose={() => setSelectedInternship(null)}
          onApply={() => handleApply(selectedInternship)}
          isApplying={applying === selectedInternship.id}
          isApplied={applications.some((a) => a.internshipId === selectedInternship.id)}
        />
      )}
      {selectedOffer && <OfferLetterModal application={selectedOffer} onClose={() => setSelectedOffer(null)} />}
      {chatRecipient && (
        <ChatModal
          isOpen={!!chatRecipient}
          onClose={() => setChatRecipient(null)}
          senderEmail={studentEmail}
          recipientEmail={chatRecipient.email}
          recipientName={
            chatRecipient.firstName && chatRecipient.lastName && !/undefined|me/i.test(`${chatRecipient.firstName} ${chatRecipient.lastName}`)
              ? `${chatRecipient.firstName} ${chatRecipient.lastName}`.trim()
              : chatRecipient.firstName && !/undefined|Faculty/i.test(chatRecipient.firstName)
              ? chatRecipient.firstName
              : chatRecipient.email
              ? chatRecipient.email.split('@')[0]
              : 'Faculty Supervisor'
          }
          internshipTitle={chatRecipient.internshipTitle}
        />
      )}
      {showProfileModal && (
        <Modal onClose={() => setShowProfileModal(false)} maxWidth="max-w-sm">
          <div className="px-6 py-8 text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-black text-white mb-2">Complete your profile</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Please complete your profile details and set your account password before applying for internships.
            </p>
          </div>
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/80 flex gap-2 justify-end">
            <SecondaryButton onClick={() => setShowProfileModal(false)}>Later</SecondaryButton>
            <PrimaryButton
              onClick={() => {
                setShowProfileModal(false);
                sessionStorage.setItem('redirectAfterProfile', window.location.pathname);
                navigate('/student/profile');
              }}
            >
              Complete profile &amp; password
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentDashboard;