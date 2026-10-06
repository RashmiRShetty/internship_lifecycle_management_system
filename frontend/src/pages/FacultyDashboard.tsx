import mitLogo from '../assets/mit_logo.png';
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

import ChatModal from '../components/ChatModal';
import MessagesView from '../components/MessagesView';
import NotificationsView from '../components/NotificationsView';
import { ExplainableMatchDrawer, type MatchBreakdownData } from '../components/ExplainableMatchDrawer';
import { RejectionModal } from '../components/RejectionModal';

import { calculateRealMatchDetails } from '../utils/matchCalculator';

import StudentDashboardStyles from '../components/student/styles/StudentDashboardStyles';
import FacultyDashboardStyles from '../components/faculty/FacultyDashboardStyles';
import ParticlesBackground from '../components/student/ParticlesBackground';
import { FacultyOverview } from '../components/faculty/FacultyOverview';
import { FacultySchedulesView } from '../components/faculty/FacultySchedulesView';
import { FacultyPostInternship } from '../components/faculty/FacultyPostInternship';
import { ProjectsView } from '../components/faculty/projects/ProjectsView';
import { ApplicantsView } from '../components/faculty/applicants/ApplicantsView';
import ProfileSettings from './ProfileSettings';

import {
  LayoutDashboard,
  PlusCircle,
  Plus,
  Users,
  ClipboardList,
  Calendar,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';

const FacultyDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<any | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const facultyEmail = decoded?.sub ? String(decoded.sub).trim() : undefined;

  const [profileData, setProfileData] = useState<any>(null);
  const [profileImgError, setProfileImgError] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showProfileCompleteModal, setShowProfileCompleteModal] = useState(false);

  // AI Match Drawer State
  const [explainableData, setExplainableData] = useState<MatchBreakdownData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Rejection Modal State
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [pendingRejectHandler, setPendingRejectHandler] = useState<((reason: string) => void) | null>(null);

  useEffect(() => {
    if (location.pathname.includes('/messages')) {
      setChatRecipient(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfileAndNotifications = async () => {
      try {
        const [profileRes, notificationsRes] = await Promise.all([
          api.get(`/users/profile/faculty?email=${facultyEmail}`).catch(() => ({ data: null })),
          api.get(`/notifications/user?email=${facultyEmail}`).catch(() => ({ data: [] })),
        ]);
        setProfileData(profileRes.data);
        setNotifications(notificationsRes.data || []);
      } catch (error) {
        console.error('Error fetching faculty profile/notifications:', error);
      }
    };
    if (facultyEmail) fetchProfileAndNotifications();
  }, [facultyEmail]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`).catch(() => null);
      setNotifications((ns) => ns.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const isProfileComplete = () => !!profileData?.profileComplete;
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };
  const unread = notifications.filter((n) => !n.isRead).length;

  const handleInspectMatch = (app: any) => {
    const hasMeaningfulSkillData = (value: any): boolean => {
      if (!value) return false;
      if (Array.isArray(value)) return value.some((entry) => hasMeaningfulSkillData(entry));
      if (typeof value === 'object') return Object.values(value).some((entry) => hasMeaningfulSkillData(entry));
      const text = String(value).trim();
      return text.length > 2 && !/^\d+$/.test(text);
    };

    let matchRes = app.matchResult;
    const hasSkillData = hasMeaningfulSkillData(app) || hasMeaningfulSkillData(app?.postedInternship) || hasMeaningfulSkillData(app?.fullStudentProfile);
    if (!matchRes || typeof matchRes.matchPercentage !== 'number' || (matchRes.matchPercentage === 0 && hasSkillData)) {
      const studentProfile = {
        skills: app.studentSkills || app.technicalSkills || app.fullStudentProfile?.skills || '',
        technicalSkills: app.technicalSkills || app.fullStudentProfile?.technicalSkills || '',
        programmingLanguages: app.programmingLanguages || app.fullStudentProfile?.programmingLanguages || app.languages || '',
        projects: app.projects || app.fullStudentProfile?.projects || '',
        certificates: app.certificates || app.fullStudentProfile?.certificates || app.certifications || '',
        completedCourseworks: app.completedCourseworks || app.fullStudentProfile?.completedCourseworks || app.coursework || '',
        coursework: app.coursework || app.fullStudentProfile?.coursework || '',
        bio: app.bio || app.coverLetter || app.fullStudentProfile?.bio || app.about || '',
        about: app.about || app.fullStudentProfile?.about || '',
        interestedDomain: app.interestedDomain || app.fullStudentProfile?.interestedDomain || app.domain || '',
        domain: app.domain || app.fullStudentProfile?.domain || '',
        experience: app.experience || app.fullStudentProfile?.experience || app.experienceSummary || '',
        experienceSummary: app.experienceSummary || app.fullStudentProfile?.experienceSummary || '',
        experienceYears: app.experienceYears ?? app.fullStudentProfile?.experienceYears ?? app.yearsExperience ?? app.totalExperience ?? app.yearsOfExperience ?? null,
        yearsExperience: app.yearsExperience ?? app.fullStudentProfile?.yearsExperience ?? null,
        cgpa: app.cgpa ?? app.studentCgpa ?? app.fullStudentProfile?.cgpa ?? null,
        studentCgpa: app.studentCgpa ?? app.fullStudentProfile?.studentCgpa ?? app.cgpa ?? null,
        semester: app.semester ?? app.studentSemester ?? app.fullStudentProfile?.semester ?? null,
        studentSemester: app.studentSemester ?? app.fullStudentProfile?.studentSemester ?? app.semester ?? null,
        department: app.department || app.fullStudentProfile?.department || app.course || app.studying || '',
        studying: app.studying || app.fullStudentProfile?.studying || '',
        course: app.course || app.fullStudentProfile?.course || '',
        internships: app.internships || app.fullStudentProfile?.internships || app.pastInternships || app.internshipHistory || '',
        pastInternships: app.pastInternships || app.fullStudentProfile?.pastInternships || '',
        internshipHistory: app.internshipHistory || app.fullStudentProfile?.internshipHistory || '',
        workExperiences: app.workExperiences || app.fullStudentProfile?.workExperiences || '',
        languages: app.languages || app.fullStudentProfile?.languages || '',
        interests: app.interests || app.fullStudentProfile?.interests || '',
        awards: app.awards || app.fullStudentProfile?.awards || '',
        volunteering: app.volunteering || app.fullStudentProfile?.volunteering || '',
        customSections: app.customSections || app.fullStudentProfile?.customSections || '',
        ...(app.fullStudentProfile || {}),
      };
      const internshipData = {
        id: app.internshipId,
        title: app.internshipTitle || app.title || '',
        internshipTitle: app.internshipTitle || app.title || '',
        description: app.internshipDescription || app.description || '',
        internshipDescription: app.internshipDescription || app.description || '',
        skillsRequired: app.internshipSkillsRequired || app.skillsRequired || app.requirements || app.technicalRequirements || '',
        requirements: app.requirements || app.internshipSkillsRequired || app.skillsRequired || '',
        technicalRequirements: app.technicalRequirements || app.internshipSkillsRequired || app.skillsRequired || '',
        skillsPreferred: app.internshipSkillsPreferred || app.skillsPreferred || app.preferredSkills || [],
        preferredSkills: app.preferredSkills || app.internshipSkillsPreferred || app.skillsPreferred || [],
        eligibilityCriteria: app.internshipEligibility || app.eligibilityCriteria || app.eligibility || app.requiredQualification || '',
        eligibility: app.eligibility || app.internshipEligibility || app.eligibilityCriteria || '',
        requiredQualification: app.requiredQualification || app.internshipEligibility || app.eligibilityCriteria || '',
        preferredQualification: app.preferredQualification || '',
        responsibilities: app.responsibilities || app.jobResponsibilities || app.duties || app.keyResponsibilities || '',
        jobResponsibilities: app.jobResponsibilities || app.responsibilities || '',
        keyResponsibilities: app.keyResponsibilities || app.responsibilities || '',
        duties: app.duties || app.responsibilities || '',
        keyProjects: app.keyProjects || app.postedInternship?.projects || '',
        projects: app.postedInternship?.projects || app.keyProjects || '',
        mode: app.mode || '',
        internshipType: app.internshipType || '',
        duration: app.duration || '',
        location: app.location || '',
        department: app.postedInternship?.department || '',
        ...(app.postedInternship || {}),
      };
      matchRes = calculateRealMatchDetails(internshipData, studentProfile, app.matchResult || null);
    }

    const parseSkillList = (value: any): string[] => {
      const flatten = (input: any): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) {
          return input.flatMap((entry) => flatten(entry));
        }
        if (typeof input === 'object') {
          const values = Object.values(input);
          return values.flatMap((entry) => flatten(entry));
        }
        if (typeof input === 'string') {
          return input
            .split(/[|,;\n]+/)
            .map((item) => item.trim())
            .filter(Boolean)
            .filter((item) => !/^\d+$/.test(item));
        }
        return [String(input).trim()].filter(Boolean);
      };

      return [...new Set(flatten(value).map((item) => item.replace(/\s+/g, ' ').trim()).filter(Boolean))].slice(0, 20);
    };

    const studentSkills = parseSkillList(
      app.studentSkills ||
      app.technicalSkills ||
      app.fullStudentProfile?.skills ||
      app.fullStudentProfile?.technicalSkills ||
      app.skills ||
      app.profileSkills ||
      app.studentProfile?.skills
    );

    const internshipSkills = parseSkillList(
      app.internshipSkillsRequired ||
      app.skillsRequired ||
      app.requirements ||
      app.technicalRequirements ||
      app.requiredSkills ||
      app.internshipRequirement ||
      app.internshipRequirements ||
      app.postedInternship?.skillsRequired ||
      app.postedInternship?.technicalRequirements ||
      app.postedInternship?.requirements ||
      app.postedInternship?.requiredSkills ||
      app.postedInternship?.internshipSkillsRequired ||
      (app.matchResult && (app.matchResult.requiredSkills || app.matchResult.requirements || app.matchResult.technicalRequirements))
    );

    const preferredSkills = parseSkillList(
      app.internshipSkillsPreferred ||
      app.skillsPreferred ||
      app.preferredSkills ||
      app.postedInternship?.skillsPreferred ||
      app.postedInternship?.preferredSkills ||
      app.postedInternship?.internshipSkillsPreferred ||
      (app.matchResult && (app.matchResult.preferredSkills || app.matchResult.skillsPreferred))
    );

    setExplainableData({
      studentName: app.studentName || app.studentEmail,
      internshipTitle: app.internshipTitle || 'Internship Position',
      matchPercentage: matchRes.matchPercentage,
      recommendation:
        matchRes.recommendation ||
        (matchRes.matchPercentage >= 80
          ? 'Highly Recommended'
          : matchRes.matchPercentage >= 65
          ? 'Recommended'
          : matchRes.matchPercentage >= 45
          ? 'Moderate Match'
          : 'Low Match'),
      matchedRequirements:
        matchRes.matchedTechnicalRequirements || matchRes.matchedRequirements || matchRes.matchedItems || [],
      missingRequirements:
        matchRes.missingTechnicalRequirements || matchRes.missingRequirements || matchRes.missingItems || [],
      requirements: matchRes.requirements || [],
      studentSkills,
      internshipSkills: internshipSkills.length ? internshipSkills : (matchRes?.matchedRequirements || matchRes?.missingRequirements || []),
      preferredSkills,
      matchedPreferredSkills: matchRes.matchedPreferredSkills || [],
      missingPreferredSkills: matchRes.missingPreferredSkills || [],
      reason: matchRes.reason,
      bestMatchingSections: (matchRes as any).bestMatchingSections || {},
      similarityScores: (matchRes as any).similarityScores || {},
      aiEngine: (matchRes as any).aiEngine || 'Semantic Matching Engine',
    });
    setIsDrawerOpen(true);
  };

  const navLink = (to: string, label: string, icon: React.ReactNode, badge?: number, exact = false) => {
    const active = exact ? location.pathname === to : location.pathname.startsWith(to);
    const isPostInternship = to === '/faculty/post-internship';
    return (
      <Link
        to={to}
        className={`fd-nav-item${active ? ' active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        {isPostInternship && active ? (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#5b51ef',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Plus size={13} strokeWidth={3} />
          </div>
        ) : (
          icon
        )}
        <span>{label}</span>
        {!!badge && <span className="fd-nav-badge">{badge}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#12092b] text-slate-100 relative student-dot-canvas fd-shell">
      <StudentDashboardStyles />
      <FacultyDashboardStyles />
      <ParticlesBackground colorScheme="purple" />

      <div className={`fd-overlay${isSidebarOpen ? ' open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <aside className={`w-64 bg-[#150734]/95 backdrop-blur-3xl border-r border-purple-500/30 flex flex-col flex-shrink-0 h-screen overflow-y-auto fixed top-0 left-0 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="fd-logo" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="px-2 py-1 bg-white/95 rounded-lg shadow-sm flex items-center shrink-0"><img src={mitLogo} alt="MIT Logo" className="h-7 object-contain" /></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                InternSmart
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', marginTop: '2px' }}>
                MIT Faculty Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="fd-nav">
          {navLink('/faculty', 'Dashboard', <LayoutDashboard size={16} />, undefined, true)}
          {navLink('/faculty/post-internship', 'Post internship', <PlusCircle size={16} />)}
          {navLink('/faculty/applicants', 'Applicants', <Users size={16} />)}
          {navLink('/faculty/projects', 'Project management', <ClipboardList size={16} />)}
          {navLink('/faculty/schedules', 'Schedules', <Calendar size={16} />)}
          {navLink('/faculty/messages', 'Messages', <MessageSquare size={16} />)}
          {navLink('/faculty/notifications', 'Notifications', <Bell size={16} />, unread || undefined)}
        </nav>

        <div className="fd-sidebar-footer">
          {navLink('/faculty/profile', 'Profile', <User size={16} />)}
          <button
            className="fd-nav-item logout"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className={`fd-main${isSidebarOpen ? ' blurred' : ''}`}>
        <header className="h-[64px] bg-[#190c34]/90 border-b border-purple-500/30 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-xl border border-purple-400/30 flex items-center justify-center text-purple-200 bg-purple-950/80 backdrop-blur-xs cursor-pointer hover:bg-purple-900/80 transition shrink-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            <Link to="/faculty" className="flex items-center gap-2.5">
              <div className="px-2 py-1 bg-white/95 rounded-lg shadow-sm flex items-center shrink-0"><img src={mitLogo} alt="MIT Logo" className="h-6 object-contain" /></div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white leading-none">InternSmart</span>
                <span className="text-[9px] font-extrabold text-purple-300 uppercase tracking-wider mt-0.5">Faculty Portal</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/faculty"
              className={`py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
                location.pathname === '/faculty' || location.pathname === '/faculty/'
                  ? 'border-purple-400 text-purple-300 font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/faculty/applicants"
              className={`py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
                location.pathname.includes('/applicants')
                  ? 'border-purple-400 text-purple-300 font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Applicants
            </Link>
            <Link
              to="/faculty/projects"
              className={`py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
                location.pathname.includes('/projects')
                  ? 'border-purple-400 text-purple-300 font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Projects
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/faculty/post-internship')}
              className="bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 text-white rounded-full py-2 px-4 text-xs font-black shadow-md shadow-purple-500/30 hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} /> Post Role
            </button>

            <button
              onClick={() => navigate('/faculty/notifications')}
              className="w-10 h-10 rounded-full border border-purple-400/30 bg-purple-950/80 backdrop-blur-xs hover:bg-purple-900/80 flex items-center justify-center text-purple-200 relative transition cursor-pointer shrink-0"
            >
              <Bell size={18} />
              {unread > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#06112e] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
            </button>

            <Link
              to="/faculty/profile"
              className="flex items-center gap-2.5 bg-purple-950/80 backdrop-blur-xs border border-purple-400/30 hover:border-purple-400/60 rounded-full pl-1 pr-3.5 py-1 shadow-2xs transition"
              title="Faculty Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#12092b] overflow-hidden shrink-0">
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
                  (profileData?.fullName?.[0] || facultyEmail?.[0] || 'F').toUpperCase()
                )}
              </div>
              <span className="text-xs font-extrabold text-slate-200 hidden sm:inline truncate max-w-[120px]">
                {profileData?.fullName ? profileData.fullName.split(' ')[0] : 'Faculty'}
              </span>
            </Link>
          </div>
        </header>

        <div className="fd-content">
          <Routes>
            <Route index element={<FacultyOverview onMessage={(recipient) => setChatRecipient(recipient)} />} />
            <Route
              path="post-internship"
              element={
                <FacultyPostInternship
                  isProfileComplete={isProfileComplete}
                  setShowProfileCompleteModal={setShowProfileCompleteModal}
                />
              }
            />
            <Route
              path="applicants"
              element={
                <ApplicantsView
                  onInspectMatch={handleInspectMatch}
                  onMessageStudent={(email) => setChatRecipient({ email })}
                  onRequestRejectReason={(cb) => {
                    setPendingRejectHandler(() => cb);
                    setIsRejectionModalOpen(true);
                  }}
                />
              }
            />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="schedules" element={<FacultySchedulesView />} />
            <Route path="messages" element={<MessagesView userEmail={facultyEmail || ''} userRole="FACULTY" />} />
            <Route
              path="notifications"
              element={
                <NotificationsView
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              }
            />
            <Route path="profile" element={<ProfileSettings />} />
          </Routes>

          {/* Standardized Faculty Portal Footer */}
          <footer className="pt-8 pb-6 border-t border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-xl text-center space-y-3 mt-12 w-full">
            <div className="flex items-center justify-center gap-2.5">
              <div className="px-2 py-1 bg-white/95 rounded-lg shadow-sm flex items-center shrink-0"><img src={mitLogo} alt="MIT Logo" className="h-6 object-contain" /></div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black text-white leading-tight">InternSmart</span>
                <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">MIT Faculty Portal</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-300 font-semibold flex-wrap">
              <a href="#" className="hover:text-amber-400 transition">Assistance Desk</a>
              <a href="#" className="hover:text-amber-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-amber-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-amber-400 transition">Contact Support</a>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              © {new Date().getFullYear()} Manipal Institute of Technology — InternSmart. All rights reserved.
            </div>
          </footer>
        </div>
      </main>

      {chatRecipient && (
        <ChatModal
          isOpen={!!chatRecipient}
          onClose={() => setChatRecipient(null)}
          senderEmail={facultyEmail || ''}
          recipientEmail={chatRecipient.email}
          recipientName={chatRecipient.email}
        />
      )}

      <ExplainableMatchDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={explainableData}
      />

      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onSubmitReason={(reason) => {
          if (pendingRejectHandler) {
            pendingRejectHandler(reason);
          }
          setIsRejectionModalOpen(false);
        }}
      />

      {showProfileCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowProfileCompleteModal(false)} />
          <div className="modal modal-sm">
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div className="alert-icon">
                <AlertCircle size={24} />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                Complete your profile
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', lineHeight: 1.6 }}>
                Please fill in all your profile details and set your account password before posting internships.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowProfileCompleteModal(false)}>
                Later
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowProfileCompleteModal(false);
                  sessionStorage.setItem('redirectAfterProfile', window.location.pathname);
                  navigate('/faculty/profile');
                }}
              >
                Complete profile &amp; password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;