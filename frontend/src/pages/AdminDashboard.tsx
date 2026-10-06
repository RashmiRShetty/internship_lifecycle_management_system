import mitLogo from '../assets/mit_logo.png';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  Users, 
  ShieldCheck, 
  Settings, 
  Menu, 
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  GraduationCap,
  Briefcase,
  LogOut,
  Mail,
  UserCircle2,
  Layers,
  FolderKanban,
  Hash,
  MapPin,
  Clock,
  CreditCard,
  Crown,
  X,
  Trash2,
  PieChart as PieChartIcon,
  Table as TableIcon,
  Eye,
  Filter,
  User,
  Edit3,
  Save,
  KeyRound,
  Lock,
  ArrowLeft,
  Database,
  UserPlus,
  Building2 as BuildingIcon
} from 'lucide-react';
import AdminDashboardStyles from '../components/admin/styles/AdminDashboardStyles';
import ParticlesBackground from '../components/student/ParticlesBackground';
import api from '../services/api';
import { DEPARTMENTS } from '../constants/departmentsAndSkills';
import {
  DepartmentComparisonChart,
  ApplicationPipelineDonutChart,
  FacultyPerformanceChart,
  InternshipDistributionChart,
  ActivityTrendChart,
  ProjectStatusPieChart
} from '../components/admin/AdminCharts';
import DepartmentManagementModal from '../components/admin/DepartmentManagementModal';
import AdminCreationModal from '../components/admin/AdminCreationModal';

const SUPER_ADMIN_EMAIL = 'admin@internsmart.com';

// Utility function to export JSON array as CSV file download
const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        const escaped = typeof val === 'object' ? JSON.stringify(val) : (val !== undefined && val !== null ? String(val) : '');
        return `"${escaped.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Flexible department domain matching helper
const isDepartmentMatch = (deptA?: string, deptB?: string): boolean => {
  if (!deptA || !deptB) return false;

  const normA = deptA.toLowerCase().trim();
  const normB = deptB.toLowerCase().trim();
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const cleanA = normA.replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanB = normB.replace(/&/g, 'and').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanA === cleanB) return true;

  // Specific department abbreviation & alias checks
  const isCseA = cleanA.includes('computer science') || cleanA.includes('cse') || cleanA.includes('comp sci');
  const isCseB = cleanB.includes('computer science') || cleanB.includes('cse') || cleanB.includes('comp sci');
  if (isCseA && isCseB) return true;

  const isMechA = cleanA.includes('mechanical') || cleanA.includes('mech');
  const isMechB = cleanB.includes('mechanical') || cleanB.includes('mech');
  if (isMechA && isMechB) return true;

  const isCivilA = cleanA.includes('civil');
  const isCivilB = cleanB.includes('civil');
  if (isCivilA && isCivilB) return true;

  const isElecA = cleanA.includes('electrical') || cleanA.includes('ece') || cleanA.includes('eee');
  const isElecB = cleanB.includes('electrical') || cleanB.includes('ece') || cleanB.includes('eee');
  if (isElecA && isElecB) return true;

  const isDsA = cleanA.includes('data science') || cleanA.includes('ds');
  const isDsB = cleanB.includes('data science') || cleanB.includes('ds');
  if (isDsA && isDsB) return true;

  const isItA = cleanA.includes('information technology') || cleanA.includes(' it');
  const isItB = cleanB.includes('information technology') || cleanB.includes(' it');
  if (isItA && isItB) return true;

  return false;
};


const ACCENT_STYLES: Record<string, { name: string; primaryGrad: string; activeNav: string; textAccent: string; borderAccent: string; badge: string; glow: string; dot: string; headerTag: string }> = {
  emerald: {
    name: 'Cyber Emerald',
    primaryGrad: 'from-emerald-400 via-teal-500 to-cyan-500',
    activeNav: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30',
    textAccent: 'text-emerald-300',
    borderAccent: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35',
    glow: 'radial-gradient(ellipse 85% 65% at 0% 0%, rgba(16, 185, 129, 0.5) 0%, transparent 68%), radial-gradient(ellipse 70% 55% at 100% 5%, rgba(20, 184, 166, 0.45) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(6, 182, 212, 0.4) 0%, transparent 68%)',
    dot: 'bg-emerald-400',
    headerTag: 'text-emerald-400'
  },
  cyan: {
    name: 'Electric Cyan',
    primaryGrad: 'from-cyan-400 via-sky-500 to-blue-600',
    activeNav: 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30',
    textAccent: 'text-cyan-300',
    borderAccent: 'hover:border-cyan-400/50 hover:shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/35',
    glow: 'radial-gradient(ellipse 85% 65% at 0% 0%, rgba(6, 182, 212, 0.5) 0%, transparent 68%), radial-gradient(ellipse 70% 55% at 100% 5%, rgba(14, 165, 233, 0.45) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(59, 130, 246, 0.4) 0%, transparent 68%)',
    dot: 'bg-cyan-400',
    headerTag: 'text-cyan-400'
  },
  purple: {
    name: 'Royal Amethyst',
    primaryGrad: 'from-purple-400 via-violet-500 to-indigo-600',
    activeNav: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/30',
    textAccent: 'text-purple-300',
    borderAccent: 'hover:border-purple-400/50 hover:shadow-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-400/35',
    glow: 'radial-gradient(ellipse 85% 65% at 0% 0%, rgba(168, 85, 247, 0.5) 0%, transparent 68%), radial-gradient(ellipse 70% 55% at 100% 5%, rgba(139, 92, 246, 0.45) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 68%)',
    dot: 'bg-purple-400',
    headerTag: 'text-purple-400'
  },
  amber: {
    name: 'Gold Sunburst',
    primaryGrad: 'from-amber-400 via-orange-500 to-yellow-500',
    activeNav: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30',
    textAccent: 'text-amber-300',
    borderAccent: 'hover:border-amber-400/50 hover:shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-400/35',
    glow: 'radial-gradient(ellipse 85% 65% at 0% 0%, rgba(245, 158, 11, 0.5) 0%, transparent 68%), radial-gradient(ellipse 70% 55% at 100% 5%, rgba(249, 115, 22, 0.45) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(234, 179, 8, 0.4) 0%, transparent 68%)',
    dot: 'bg-amber-400',
    headerTag: 'text-amber-400'
  },
  rose: {
    name: 'Crimson Ruby',
    primaryGrad: 'from-rose-400 via-pink-500 to-red-600',
    activeNav: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30',
    textAccent: 'text-rose-300',
    borderAccent: 'hover:border-rose-400/50 hover:shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-400/35',
    glow: 'radial-gradient(ellipse 85% 65% at 0% 0%, rgba(244, 63, 94, 0.5) 0%, transparent 68%), radial-gradient(ellipse 70% 55% at 100% 5%, rgba(236, 72, 153, 0.45) 0%, transparent 60%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(239, 68, 68, 0.4) 0%, transparent 68%)',
    dot: 'bg-rose-400',
    headerTag: 'text-rose-400'
  }
};


const getDeptImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('computer') || n.includes('cse') || n.includes('software')) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('civil') || n.includes('structur') || n.includes('architect')) {
    return 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('mechanic') || n.includes('robot') || n.includes('auto')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('electr') || n.includes('circuit') || n.includes('hardware')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('data') || n.includes('ai') || n.includes('intelligence')) {
    return 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
};


const getPhotoUrl = (photoPath?: string) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('data:')) {
    return photoPath;
  }
  const apiBase = api.defaults.baseURL || 'http://localhost:8080/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${cleanPath.startsWith('/uploads') ? serverBase : apiBase}${cleanPath}`;
};

const getUserAvatar = (user: any) => {
  if (!user) return null;
  const photo = user.profilePhoto || user.profilePicture || user.photoUrl || user.avatar;
  if (photo && typeof photo === 'string' && photo.trim().length > 0) {
    return getPhotoUrl(photo.trim());
  }
  return null;
};

const UserAvatar = ({ user, size = "w-11 h-11", className = "" }: { user: any; size?: string; className?: string }) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getUserAvatar(user);

  const fn = (user?.firstName || user?.name?.split(' ')[0] || '').trim();
  const ln = (user?.lastName || user?.name?.split(' ')[1] || '').trim();
  let initials = '';
  if (fn || ln) {
    initials = `${fn ? fn[0] : ''}${ln ? ln[0] : ''}`.toUpperCase();
  } else if (user?.email) {
    initials = user.email[0].toUpperCase();
  }

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={user?.firstName || user?.email || 'User avatar'}
        onError={() => setImgError(true)}
        className={`${size} rounded-2xl object-cover shadow-xs ring-2 ring-emerald-500/30 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${size} rounded-2xl bg-emerald-950/60 border border-emerald-300 text-emerald-700 font-black flex items-center justify-center shrink-0 shadow-xs ring-2 ring-emerald-500/20 text-xs tracking-wider ${className}`}>
      {initials ? initials : <User className="w-5 h-5 text-emerald-600" />}
    </div>
  );
};
const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const adminEmail = decoded?.sub || localStorage.getItem('userEmail') || localStorage.getItem('adminEmail') || '';
  const isSuperAdmin = decoded?.role === 'SUPER_ADMIN' || adminEmail === SUPER_ADMIN_EMAIL || localStorage.getItem('userRole') === 'SUPER_ADMIN';

  const [accentTheme, setAccentTheme] = useState<'cyan' | 'emerald' | 'amber' | 'purple' | 'rose'>(() => {
    const saved = localStorage.getItem('admin_accent_theme');
    if (saved && ACCENT_STYLES[saved]) return saved as any;
    return isSuperAdmin ? 'emerald' : 'cyan';
  });

  const handleThemeChange = (newTheme: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose') => {
    setAccentTheme(newTheme);
    localStorage.setItem('admin_accent_theme', newTheme);
  };

  const effectiveAccentTheme = accentTheme;
  const currentAccent = ACCENT_STYLES[effectiveAccentTheme] || ACCENT_STYLES.emerald;
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tok = sessionStorage.getItem('token') || localStorage.getItem('token');
    const dec: any = tok ? jwtDecode(tok) : null;
    const email = dec?.sub || localStorage.getItem('userEmail') || '';
    const isSuper = dec?.role === 'SUPER_ADMIN' || email === SUPER_ADMIN_EMAIL || localStorage.getItem('userRole') === 'SUPER_ADMIN';
    return isSuper ? 'departments' : 'department';
  });
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [_selectedDomainFilter, _setSelectedDomainFilter] = useState<string>('ALL');

  // Raw data
  const [students, setStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [apiDepartments, setApiDepartments] = useState<{ name: string }[]>([]);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [_refreshing, setRefreshing] = useState(false);

  // Filtering & Display controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [deptTabFilter, setDeptTabFilter] = useState<'ALL' | 'FACULTY' | 'STUDENTS'>('ALL');
  const [facProjectStatusFilter, setFacProjectStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('OPEN');
  const [projectDetailView, setProjectDetailView] = useState<'STUDENTS' | 'GRAPH'>('STUDENTS');
  const [viewMode, setViewMode] = useState<'table' | 'graphs'>('table');

  // Admin Profile Edit Modal State
  const [showEditAdminProfileModal, setShowEditAdminProfileModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
    phone: '',
    bio: ''
  });
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);

  // Admin Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [useOtpMode, setUseOtpMode] = useState(false); // false: Old Password mode, true: OTP mode
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Manage Department Admins Modal State (Super Admin)
  const [showManageDeptAdminsModal, setShowManageDeptAdminsModal] = useState(false);
  const [targetDeptForAdminMgmt, setTargetDeptForAdminMgmt] = useState<string>('');
  const [selectedFacultyForDeptAdmin, setSelectedFacultyForDeptAdmin] = useState<string>('');

  // Admin roles & management state
  const [_roleUpdatingEmail, _setRoleUpdatingEmail] = useState<string | null>(null);
  const [deptAdminCandidateEmail, setDeptAdminCandidateEmail] = useState<string>('');
  const [deptAdminUpdating, setDeptAdminUpdating] = useState(false);
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [loadingPendingAdmins, setLoadingPendingAdmins] = useState(false);

  // New Super Admin Features
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showAdminCreationModal, setShowAdminCreationModal] = useState(false);

  // Selected modals & Dedicated Pages
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [_expandedFacultyId, _setExpandedFacultyId] = useState<string | null>(null);
  const [activeFacultyEmail, setActiveFacultyEmail] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const getDisplayFacultyName = (f: any) => {
    if (!f) return 'Faculty Member';
    const first = (f.firstName || '').trim();
    const last = (f.lastName || '').trim();
    const fullName = `${first} ${last}`.trim();

    if (!fullName || fullName.toLowerCase() === 'faculty me' || fullName.toLowerCase() === 'faculty' || fullName.toLowerCase() === 'me') {
      const handle = (f.email || '').split('@')[0];
      const cleanHandle = handle.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      const formatted = cleanHandle.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `Prof. ${formatted || 'Faculty Member'}`;
    }
    return fullName;
  };

  const openFacultyPage = (email: string) => {
    setActiveFacultyEmail(email);
    setActiveTab('faculty-detail');
  };

  const openProjectPage = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveTab('project-detail');
  };

  const navigate = useNavigate();

  // isSuperAdmin already declared above

  // Initialize admin form when profile is loaded
  useEffect(() => {
    if (adminProfile) {
      setAdminForm({
        firstName: adminProfile.firstName || '',
        lastName: adminProfile.lastName || '',
        department: adminProfile.department || '',
        designation: adminProfile.designation || 'Department Admin',
        phone: adminProfile.phone || '',
        bio: adminProfile.bio || ''
      });
    }
  }, [adminProfile]);

  const tokenDept = decoded?.department || decoded?.dept || localStorage.getItem('userDepartment') || localStorage.getItem('department');

  // Department scoping: Non-super admins ONLY see their own department data
  const scopedDepartment = useMemo(() => {
    if (isSuperAdmin) return selectedDept || null;
    return adminProfile?.department || tokenDept || null;
  }, [isSuperAdmin, selectedDept, adminProfile, tokenDept]);

  // Faculty emails within department scope
  const scopedFacultyEmails = useMemo(() => {
    const list = scopedDepartment ? faculties.filter(f => isDepartmentMatch(f.department, scopedDepartment)) : faculties;
    return list.map(f => f.email);
  }, [faculties, scopedDepartment]);

  // Scoped views with flexible department domain matching
  const scopedFaculties = useMemo(() => {
    let list = faculties;
    if (scopedDepartment) {
      list = list.filter(f => isDepartmentMatch(f.department, scopedDepartment));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => 
        (f.firstName || '').toLowerCase().includes(q) ||
        (f.lastName || '').toLowerCase().includes(q) ||
        (f.email || '').toLowerCase().includes(q) ||
        (f.department || '').toLowerCase().includes(q) ||
        (f.designation || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [faculties, scopedDepartment, searchQuery]);

  const scopedInternships = useMemo(() => {
    let list = scopedDepartment
      ? internships.filter(i => {
          const owner = faculties.find(f => f.email === i.facultyId);
          return scopedFacultyEmails.includes(i.facultyId) || (owner && isDepartmentMatch(owner.department, scopedDepartment));
        })
      : internships;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        (i.title || '').toLowerCase().includes(q) ||
        (i.facultyId || '').toLowerCase().includes(q) ||
        (i.location || '').toLowerCase().includes(q) ||
        (i.mode || i.internshipType || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter(i => (i.status || 'OPEN').toUpperCase() === statusFilter);
    }
    return [...list].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [internships, faculties, scopedDepartment, scopedFacultyEmails, searchQuery, statusFilter]);

  const scopedApplications = useMemo(() => {
    let list = scopedDepartment
      ? applications.filter(a => {
          const owner = faculties.find(f => f.email === a.facultyEmail);
          return scopedFacultyEmails.includes(a.facultyEmail) || (owner && isDepartmentMatch(owner.department, scopedDepartment));
        })
      : applications;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        (a.studentEmail || '').toLowerCase().includes(q) ||
        (a.internshipTitle || '').toLowerCase().includes(q) ||
        (a.facultyEmail || '').toLowerCase().includes(q)
      );
    }
    if (appStatusFilter !== 'ALL') {
      list = list.filter(a => (a.status || 'APPLIED').toUpperCase() === appStatusFilter);
    }
    return [...list].sort((a, b) => {
      const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      if (timeA !== timeB) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [applications, faculties, scopedDepartment, scopedFacultyEmails, searchQuery, appStatusFilter]);

  const scopedStudents = useMemo(() => {
    let list = students;
    if (scopedDepartment) {
      list = list.filter(s => isDepartmentMatch(s.department, scopedDepartment));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        (s.firstName || '').toLowerCase().includes(q) ||
        (s.lastName || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.department || '').toLowerCase().includes(q) ||
        (s.collegeName || '').toLowerCase().includes(q) ||
        (s.registrationNumber || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, scopedDepartment, searchQuery]);

  const selectedFacultyInternships = useMemo(() => {
    if (!selectedFaculty) return [];
    return internships.filter(i => i.facultyId === selectedFaculty.email);
  }, [internships, selectedFaculty]);

  const currentDeptAdminEmail = useMemo(() => {
    if (!scopedDepartment) return '';
    const admin = faculties.find(f => isDepartmentMatch(f.department, scopedDepartment) && f.role === 'ADMIN');
    return admin?.email || '';
  }, [faculties, scopedDepartment]);

  // Department grouping for super-admin analytics
  const departments = useMemo(() => {
    const map = new Map<string, { faculty: any[]; internships: any[]; applications: any[] }>();
    
    // Pre-seed official departments so all 3 core departments are always shown
    DEPARTMENTS.forEach(dept => {
      map.set(dept, { faculty: [], internships: [], applications: [] });
    });

    // Pre-seed departments created by super admin via Department Management (backend API)
    apiDepartments.forEach(dept => {
      if (dept?.name && !map.has(dept.name)) {
        map.set(dept.name, { faculty: [], internships: [], applications: [] });
      }
    });

    faculties.forEach(f => {
      let d = f.department || 'Unassigned';
      const official = DEPARTMENTS.find(dept => isDepartmentMatch(dept, d));
      if (official) d = official;
      if (!map.has(d)) map.set(d, { faculty: [], internships: [], applications: [] });
      map.get(d)!.faculty.push(f);
    });

    internships.forEach(i => {
      const owner = faculties.find(f => f.email === i.facultyId);
      let d = owner?.department || 'Unassigned';
      const official = DEPARTMENTS.find(dept => isDepartmentMatch(dept, d));
      if (official) d = official;
      if (!map.has(d)) map.set(d, { faculty: [], internships: [], applications: [] });
      map.get(d)!.internships.push(i);
    });

    applications.forEach(a => {
      const owner = faculties.find(f => f.email === a.facultyEmail);
      let d = owner?.department || 'Unassigned';
      const official = DEPARTMENTS.find(dept => isDepartmentMatch(dept, d));
      if (official) d = official;
      if (!map.has(d)) map.set(d, { faculty: [], internships: [], applications: [] });
      map.get(d)!.applications.push(a);
    });

    return Array.from(map.entries())
      .filter(([name, data]) => name !== 'Unassigned' || data.faculty.length > 0 || data.internships.length > 0)
      .map(([name, data]) => ({
        name,
        facultyCount: data.faculty.length,
        internshipCount: data.internships.length,
        applicationCount: data.applications.length,
        faculty: data.faculty,
        internships: data.internships
      }));
  }, [faculties, internships, applications, apiDepartments]);

  // Available domain list for domain selector dropdown
  const availableDomains = useMemo(() => {
    const set = new Set<string>(DEPARTMENTS);
    faculties.forEach(f => { if (f.department) set.add(f.department); });
    return Array.from(set);
  }, [faculties]);

  // Stats (unused)

  const fetchAllData = async () => {
    if (!adminEmail) { setLoading(false); return; }
    setRefreshing(true);
    try {
      const promises: Promise<any>[] = [
        api.get('/users/profile/all/students').catch(() => ({ data: [] })),
        api.get('/users/profile/all/faculty').catch(() => ({ data: [] })),
        api.get('/internships').catch(() => ({ data: [] })),
        api.get('/applications/all').catch(() => ({ data: [] })),
        api.get('/users/departments').catch(() => ({ data: [] }))
      ];

      // Only fetch faculty profile if not super admin
      if (!isSuperAdmin) {
        promises.push(
          api.get(`/users/profile/faculty?email=${adminEmail}`).catch(() => ({ data: null }))
        );
      }

      const res = await Promise.all(promises);
      setStudents(res[0].data || []);
      setFaculties(res[1].data || []);
      setInternships(res[2].data || []);
      setApplications(res[3].data || []);
      setApiDepartments(res[4]?.data || []);
      
      // Set admin profile only for department admins, not super admins
      if (!isSuperAdmin && res[5]?.data) {
        setAdminProfile(res[5].data);
      } else if (isSuperAdmin) {
        // Set default profile for super admin
        setAdminProfile({
          email: adminEmail,
          firstName: 'Super',
          lastName: 'Admin',
          department: 'All Departments',
          role: 'SUPER_ADMIN'
        });
      }
    } catch (error) {
      console.error('Admin data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [adminEmail]);

  // Fetch pending admins for super admin
  const fetchPendingAdmins = async () => {
    if (!isSuperAdmin) return;
    setLoadingPendingAdmins(true);
    try {
      const res = await api.get('/auth/admin/pending-admins');
      setPendingAdmins(res.data || []);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
    } finally {
      setLoadingPendingAdmins(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, [isSuperAdmin]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const openStudentModal = (s: any) => {
    setSelectedStudent(s);
  };

  useEffect(() => {
    if (!isSuperAdmin || !scopedDepartment) return;
    const next = currentDeptAdminEmail || (scopedFaculties[0]?.email || '');
    setDeptAdminCandidateEmail(next);
  }, [isSuperAdmin, scopedDepartment, currentDeptAdminEmail, scopedFaculties]);

  const approveAdmin = async (email: string) => {
    try {
      await api.post('/auth/admin/approve-admin', { email });
      setPendingAdmins(prev => prev.filter(admin => admin.email !== email));
      setFaculties(prev => prev.map(f => (f.email === email ? { ...f, role: 'ADMIN' } : f)));
      alert('Admin approved successfully');
    } catch (error: any) {
      const msg = error?.response?.data || 'Failed to approve admin';
      alert(msg);
    }
  };

  const rejectAdmin = async (email: string) => {
    try {
      await api.post('/auth/admin/reject-admin', { email });
      setPendingAdmins(prev => prev.filter(admin => admin.email !== email));
      setFaculties(prev => prev.map(f => (f.email === email ? { ...f, role: 'FACULTY' } : f)));
      alert('Admin rejected successfully');
    } catch (error: any) {
      const msg = error?.response?.data || 'Failed to reject admin';
      alert(msg);
    }
  };

  const clearAllAdmins = async () => {
    if (!confirm('Are you sure you want to delete all admin users except the Super Admin? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await api.delete('/auth/admin/clear-all-admins');
      alert(response.data);
      const res = await api.get('/auth/admin/pending-admins');
      setPendingAdmins(res.data || []);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data || 'Failed to clear admins';
      alert(msg);
    }
  };

  // setDepartmentAdmin helper
  const handleAssignDeptAdmin = async (deptName: string, facultyEmail: string) => {
    if (!isSuperAdmin) return;
    if (!deptName || !facultyEmail) {
      alert('Please select a department and a faculty member');
      return;
    }
    setDeptAdminUpdating(true);
    try {
      await api.put('/auth/admin/departments/admin', { department: deptName, email: facultyEmail });
      setFaculties(prev => prev.map(f => {
        if (f.department !== deptName) return f;
        if (f.email === facultyEmail) return { ...f, role: 'ADMIN' };
        if (f.role === 'ADMIN') return { ...f, role: 'FACULTY' };
        return f;
      }));
      alert(`🎉 Successfully assigned ${facultyEmail} as Department Admin for ${deptName}`);
    } catch (e: any) {
      const msg = e?.response?.data || 'Failed to update department admin';
      alert(msg);
    } finally {
      setDeptAdminUpdating(false);
    }
  };

  const handleRemoveDeptAdmin = async (deptName: string) => {
    if (!isSuperAdmin) return;
    if (!confirm(`Are you sure you want to remove the current Department Admin for ${deptName}?`)) return;
    setDeptAdminUpdating(true);
    try {
      await api.put('/auth/admin/departments/admin', { department: deptName, email: 'REMOVE' });
      setFaculties(prev => prev.map(f => {
        if (f.department === deptName && f.role === 'ADMIN') {
          return { ...f, role: 'FACULTY' };
        }
        return f;
      }));
      alert(`🎉 Successfully removed Department Admin for ${deptName}`);
    } catch (e: any) {
      const msg = e?.response?.data || 'Failed to remove department admin';
      alert(msg);
    } finally {
      setDeptAdminUpdating(false);
    }
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;
    setSavingAdminProfile(true);
    try {
      const payload = {
        email: adminEmail,
        firstName: adminForm.firstName || null,
        lastName: adminForm.lastName || null,
        department: isSuperAdmin ? (adminForm.department || null) : (adminProfile?.department || tokenDept || adminForm.department || null),
        designation: adminForm.designation || null,
        phone: adminForm.phone || null,
        bio: adminForm.bio || null,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'
      };
      const res = await api.put('/users/profile/faculty', payload);
      setAdminProfile(res.data || payload);
      setFaculties(prev => prev.map(f => (f.email === adminEmail ? { ...f, ...res.data } : f)));
      alert('🎉 Admin profile updated successfully!');
      setShowEditAdminProfileModal(false);
    } catch (err: any) {
      console.error('Failed to update admin profile:', err);
      alert(err?.response?.data?.message || 'Failed to update admin profile');
    } finally {
      setSavingAdminProfile(false);
    }
  };

  const handleClearApplicantsAndInternships = async () => {
    if (!window.confirm('⚠️ ARE YOU SURE?\n\nThis will permanently delete all applicants, internship applications, weekly reports, and internship listings from the database.\n\nAll user accounts (Students, Faculty, Admins) and profile data WILL BE KEPT intact.\n\nProceed with clearing data?')) {
      return;
    }
    try {
      await Promise.all([
        api.delete('/internships/clear-all').catch(() => {}),
        api.delete('/applications/clear-all').catch(() => {})
      ]);
      setApplications([]);
      setInternships([]);
      alert('✅ Database successfully cleared!\n\nAll applicant applications and internship postings have been wiped. User accounts and profile data remain intact.');
    } catch (err: any) {
      console.error('Failed to clear database data:', err);
      alert('Failed to clear database records: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    }
  };

  const handleSendOtpForChangePassword = async () => {
    const targetEmail = adminEmail || adminProfile?.email;
    if (!targetEmail) {
      setPasswordError('Admin email not found. Please log in again.');
      return;
    }
    setSendingOtp(true);
    setPasswordError('');
    setOtpSentMessage('');
    try {
      await api.post('/auth/send-otp', { email: targetEmail, purpose: 'forgot-password' });
      setOtpSentMessage(`OTP has been sent successfully to registered email (${targetEmail})`);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || err?.response?.data || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = adminEmail || adminProfile?.email;
    setPasswordError('');
    setPasswordSuccess('');

    if (!targetEmail) {
      setPasswordError('Admin email not found.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setChangingPassword(true);

    try {
      if (useOtpMode) {
        if (!passwordForm.otp.trim()) {
          setPasswordError('Please enter the 6-digit OTP received in your registered email.');
          setChangingPassword(false);
          return;
        }
        const res = await api.post('/auth/reset-password', {
          email: targetEmail,
          otp: passwordForm.otp.trim(),
          newPassword: passwordForm.newPassword.trim()
        });
        const msg = res.data?.message || 'Password reset successfully via OTP!';
        setPasswordSuccess(msg);
        alert('🎉 ' + msg);
        setShowChangePasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
        setUseOtpMode(false);
        setOtpSentMessage('');
      } else {
        if (!passwordForm.oldPassword) {
          setPasswordError('Please enter your old password.');
          setChangingPassword(false);
          return;
        }
        const res = await api.post('/auth/change-password', {
          email: targetEmail,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword.trim()
        });
        const msg = res.data?.message || 'Password changed successfully!';
        setPasswordSuccess(msg);
        alert('🎉 ' + msg);
        setShowChangePasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      const errMsg = err?.response?.data?.error || (typeof err?.response?.data === 'string' ? err?.response?.data : 'Failed to update password.');
      setPasswordError(errMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const scopeLabel = isSuperAdmin
    ? (selectedDept ? `Department: ${selectedDept}` : 'Global View — All Departments')
    : (adminProfile?.department ? `Department: ${adminProfile.department}` : 'My Department');

  const NavItem = ({ icon, label, badge, active, onClick }: { icon: React.ReactNode; label: string; badge?: string; active?: boolean; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
        active
          ? `${currentAccent.activeNav} text-white`
          : 'text-slate-200 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-white' : currentAccent.textAccent}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-900/90 text-slate-200 border border-white/10'}`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0b132b] text-white font-sans antialiased overflow-hidden relative admin-dot-canvas">
      <AdminDashboardStyles />
      <ParticlesBackground colorScheme="emerald" />
      {/* 0. EDIT ADMIN PROFILE MODAL */}
      {showEditAdminProfileModal && (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-[#070c1b]/80 backdrop-blur-md" onClick={() => setShowEditAdminProfileModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#132244]/95 backdrop-blur-2xl w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 text-white animate-in">
              <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 px-8 py-6 text-white flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Edit Admin Profile</h2>
                    <p className="text-xs text-emerald-100 font-medium">{adminEmail}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditAdminProfileModal(false)} className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdminProfile} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">First Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={adminForm.firstName}
                      onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                      placeholder="Admin First Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Last Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={adminForm.lastName}
                      onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                      placeholder="Admin Last Name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Department / Domain Scope</label>
                  {isSuperAdmin ? (
                    <select
                      className="input-field cursor-pointer"
                      value={adminForm.department}
                      onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                    >
                      <option className="bg-[#0b0f19] text-slate-100 font-medium" value="">All Departments (Global Scope)</option>
                      {availableDomains.map(d => (
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        disabled
                        value={adminForm.department || 'Assigned Department'}
                        className="input-field bg-slate-900/90 text-slate-300 font-semibold cursor-not-allowed border-slate-200"
                      />
                      <p className="text-[11px] text-slate-300 font-medium mt-1">
                        Department assignment is locked and managed by Super Admin.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Designation</label>
                    <input
                      type="text"
                      className="input-field"
                      value={adminForm.designation}
                      onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                      placeholder="Department Admin / Professor"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={adminForm.phone}
                      onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Bio / Notes</label>
                  <textarea
                    className="input-field min-h-[80px] py-3"
                    value={adminForm.bio}
                    onChange={(e) => setAdminForm({ ...adminForm, bio: e.target.value })}
                    placeholder="Department administration details..."
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAdminProfileModal(false);
                      setShowChangePasswordModal(true);
                      setUseOtpMode(false);
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    className="text-xs font-bold text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-500/20 border border-emerald-500/30 py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Change Password
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEditAdminProfileModal(false)}
                      className="btn-secondary py-2.5 px-5 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAdminProfile}
                      className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 !bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:!bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      <Save className="w-4 h-4" />
                      {savingAdminProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 0.1 CHANGE PASSWORD MODAL */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[85]">
          <div className="absolute inset-0 bg-[#070c1b]/80 backdrop-blur-md" onClick={() => setShowChangePasswordModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#132244]/95 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 text-white animate-in">
              <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 px-8 py-6 text-white flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white border border-white/10">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Change Admin Password</h2>
                    <p className="text-xs text-emerald-100 font-medium">Registered Email: <span className="font-bold text-white">{adminEmail || adminProfile?.email}</span></p>
                  </div>
                </div>
                <button onClick={() => setShowChangePasswordModal(false)} className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="p-8 space-y-5">
                {passwordError && (
                  <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-bold flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-bold flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {!useOtpMode ? (
                  /* Standard Mode: Old Password */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Current / Old Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setUseOtpMode(true);
                            setPasswordError('');
                            setOtpSentMessage('');
                          }}
                          className="text-[11px] font-black text-emerald-300 hover:text-emerald-300 hover:underline cursor-pointer"
                        >
                          Forgot Old Password?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
                        <input
                          type="password"
                          required
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          className="w-full bg-[#0d1730]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-slate-300 focus:border-emerald-500 outline-none transition"
                          placeholder="Enter your current password"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full bg-[#0d1730]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-slate-300 focus:border-emerald-500 outline-none transition"
                          placeholder="At least 6 characters"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Confirm New Password</label>
                      <div className="relative group">
                        <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full bg-[#0d1730]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-slate-300 focus:border-emerald-500 outline-none transition"
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Forgot Password / OTP Mode */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                          <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                          <span>Send OTP to registered email</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUseOtpMode(false);
                            setPasswordError('');
                          }}
                          className="text-[11px] font-black text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-emerald-300 font-medium">
                        Click below to receive a 6-digit OTP at <b>{adminEmail || adminProfile?.email}</b>
                      </p>

                      <button
                        type="button"
                        onClick={handleSendOtpForChangePassword}
                        disabled={sendingOtp}
                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs cursor-pointer"
                      >
                        {sendingOtp ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            Send OTP to Registered Email
                          </>
                        )}
                      </button>

                      {otpSentMessage && (
                        <p className="text-xs font-bold text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/40 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" /> {otpSentMessage}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Verification OTP</label>
                      <div className="relative group">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={passwordForm.otp}
                          onChange={(e) => setPasswordForm({ ...passwordForm, otp: e.target.value })}
                          className="w-full bg-[#0d1730]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold tracking-[0.3em] text-white focus:border-emerald-500 outline-none transition"
                          placeholder="000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full bg-[#0d1730]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-slate-300 focus:border-emerald-500 outline-none transition"
                          placeholder="At least 6 characters"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Confirm New Password</label>
                      <div className="relative group">
                        <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full bg-[#0d1730]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-slate-300 focus:border-emerald-500 outline-none transition"
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="btn-secondary py-2.5 px-5 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 !bg-gradient-to-r from-orange-500 to-amber-600 hover:!bg-gradient-to-r from-emerald-500 to-teal-600 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    {changingPassword ? 'Updating Password...' : (useOtpMode ? 'Reset Password via OTP' : 'Update Password')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 0.2 MANAGE DEPARTMENT ADMINS MODAL (SUPER ADMIN ONLY) */}
      {showManageDeptAdminsModal && isSuperAdmin && (
        <div className="fixed inset-0 z-[85]">
          <div className="absolute inset-0 bg-[#070c1b]/80 backdrop-blur-md" onClick={() => setShowManageDeptAdminsModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#132244]/95 backdrop-blur-2xl w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 text-white animate-in">
              <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 px-8 py-6 text-white flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white border border-white/10">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Manage Department Admins</h2>
                    <p className="text-xs text-emerald-100 font-medium">Add, Change, or Remove Department Admins for any department</p>
                  </div>
                </div>
                <button onClick={() => setShowManageDeptAdminsModal(false)} className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Select Target Department */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Select Department Domain</label>
                  <select
                    className="input-field cursor-pointer font-bold text-white bg-slate-900/90 border border-white/10"
                    value={targetDeptForAdminMgmt}
                    onChange={(e) => {
                      setTargetDeptForAdminMgmt(e.target.value);
                      setSelectedFacultyForDeptAdmin('');
                    }}
                  >
                    <option className="bg-[#0b0f19] text-slate-100 font-medium" value="">-- Choose a Department --</option>
                    {availableDomains.map(d => (
                      <option className="bg-[#0b0f19] text-slate-100 font-medium" key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {targetDeptForAdminMgmt ? (
                  <div className="space-y-6">
                    {/* Current Admin Card */}
                    {(() => {
                      const deptFaculty = faculties.filter(f => isDepartmentMatch(f.department, targetDeptForAdminMgmt));
                      const currentAdmin = deptFaculty.find(f => f.role === 'ADMIN');
                      return (
                        <div className="p-5 rounded-2xl bg-[#080f22]/80 border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Current Assigned Admin</p>
                              {currentAdmin ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-black text-white">
                                    {currentAdmin.firstName ? `${currentAdmin.firstName} ${currentAdmin.lastName || ''}` : currentAdmin.email}
                                  </span>
                                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Dept Admin
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm font-bold text-slate-300 mt-1">No Department Admin Assigned</p>
                              )}
                              {currentAdmin && (
                                <p className="text-xs text-slate-300 font-medium mt-0.5">{currentAdmin.email}</p>
                              )}
                            </div>

                            {currentAdmin && (
                              <button
                                type="button"
                                disabled={deptAdminUpdating}
                                onClick={() => handleRemoveDeptAdmin(targetDeptForAdminMgmt)}
                                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Admin
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Add / Change Admin Controls */}
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">
                        Appoint or Change Department Admin
                      </h4>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Select Faculty Member to Appoint</label>
                        <select
                          className="input-field cursor-pointer"
                          value={selectedFacultyForDeptAdmin}
                          onChange={(e) => setSelectedFacultyForDeptAdmin(e.target.value)}
                        >
                          <option className="bg-[#0b0f19] text-slate-100 font-medium" value="">-- Choose Faculty Member --</option>
                          {faculties
                            .filter(f => isDepartmentMatch(f.department, targetDeptForAdminMgmt))
                            .map(f => (
                              <option className="bg-[#0b0f19] text-slate-100 font-medium" key={f.email} value={f.email}>
                                {f.firstName ? `${f.firstName} ${f.lastName || ''}` : f.email} ({f.email}) {f.role === 'ADMIN' ? '★ Current Admin' : ''}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowManageDeptAdminsModal(false)}
                          className="btn-secondary py-2.5 px-5 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!selectedFacultyForDeptAdmin || deptAdminUpdating}
                          onClick={() => handleAssignDeptAdmin(targetDeptForAdminMgmt, selectedFacultyForDeptAdmin)}
                          className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Crown className="w-4 h-4" />
                          {deptAdminUpdating ? 'Updating...' : 'Assign / Change Admin'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-300 font-bold text-xs bg-[#080f22]/80 rounded-2xl border border-dashed border-slate-200">
                    Please select a department domain above to view and manage its admins.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. FACULTY DETAIL MODAL WITH PER-PROJECT PIE CHARTS & STUDENTS */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" onClick={() => setSelectedFaculty(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white backdrop-blur-2xl w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 text-white my-8">
              <div className={`px-8 py-6 flex items-start justify-between gap-4 ${selectedFaculty.role === 'ADMIN' ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-purple-50 to-indigo-50'}`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Faculty Workspace Report & Project Analytics</p>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {(selectedFaculty.firstName || '—')} {(selectedFaculty.lastName || '')}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedFaculty.role === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedFaculty.role === 'ADMIN' ? <Crown className="w-3 h-3" /> : null}
                      {selectedFaculty.role === 'ADMIN' ? 'Dept Admin' : (selectedFaculty.designation || 'Faculty')}
                    </span>
                    {selectedFaculty.department && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700">
                        <BuildingIcon className="w-3 h-3" /> {selectedFaculty.department}
                      </span>
                    )}
                    {selectedFaculty.email && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900/90 text-slate-200">
                        <Mail className="w-3 h-3" /> {selectedFaculty.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => exportToCSV(applications.filter(a => a.facultyEmail === selectedFaculty.email), `Faculty_${selectedFaculty.email}_Report`)}
                    className="px-3 py-2 bg-white border border-white/10 hover:bg-[#080f22]/80 rounded-2xl text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-4 h-4" /> Export Report CSV
                  </button>
                  <button onClick={() => setSelectedFaculty(null)} className="p-2 rounded-2xl bg-white/90 hover:bg-white border border-white/10 shadow-sm text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-purple-600" />
                  Faculty Projects & Student Pie Charts Report ({selectedFacultyInternships.length} Projects)
                </h3>

                {selectedFacultyInternships.length === 0 ? (
                  <div className="text-center py-12 text-slate-300 font-bold text-sm bg-[#080f22]/80 rounded-2xl border border-dashed border-slate-200">
                    No projects or internships posted by this faculty yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedFacultyInternships.map((i: any) => {
                      const projectApps = applications.filter(a => a.internshipId === i.id || a.internshipTitle === i.title);
                      return (
                        <div key={i.id} className="p-5 rounded-3xl bg-[#080f22]/80 border border-white/10 space-y-4">
                          {/* Project Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-white">{i.title}</h4>
                                <StatusChip status={i.status} />
                              </div>
                              <p className="text-xs font-bold text-slate-300 mt-1">
                                {i.location || 'Remote'} • Stipend: {i.stipend || 'Unpaid'} • Duration: {i.duration || 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => exportToCSV(projectApps, `Project_${i.title}_Report`)}
                              className="px-3 py-1.5 bg-white border border-white/10 hover:bg-slate-900/90 rounded-xl text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" /> Export Project Report (CSV)
                            </button>
                          </div>

                          {/* Pie Chart for this project */}
                          <ProjectStatusPieChart applications={projectApps} projectTitle={i.title} />

                          {/* Students List under this project */}
                          <div className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                              Students Enrolled / Applied in this Project ({projectApps.length})
                            </p>
                            {projectApps.length === 0 ? (
                              <p className="text-xs text-slate-300 font-medium py-2 bg-white rounded-xl px-3 border border-white/10">
                                No students applied to this project yet.
                              </p>
                            ) : (
                              <div className="bg-white rounded-2xl border border-white/10 overflow-hidden shadow-2xs">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-white/10 bg-[#080f22]/80">
                                      <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-300">Student Email</th>
                                      <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-300">Status</th>
                                      <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-300">Applied Date</th>
                                      <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-300 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {projectApps.map((app, appIdx) => {
                                      const studentObj = students.find(s => s.email === app.studentEmail);
                                      return (
                                        <tr key={appIdx} className="hover:bg-[#080f22]/80 transition">
                                          <td className="px-4 py-2.5 text-xs font-bold text-white">{app.studentEmail}</td>
                                          <td className="px-4 py-2.5"><StatusChip status={app.status} /></td>
                                          <td className="px-4 py-2.5 text-xs text-slate-300 font-medium">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</td>
                                          <td className="px-4 py-2.5 text-right">
                                            {studentObj && (
                                              <button
                                                onClick={() => openStudentModal(studentObj)}
                                                className="px-2.5 py-1 bg-purple-950/60 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition"
                                              >
                                                View Student Profile
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-[#070c1b]/80 backdrop-blur-md" onClick={() => setSelectedStudent(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#132244]/95 backdrop-blur-2xl w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 text-white">
              <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 px-8 py-6 text-white flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <UserAvatar user={selectedStudent} size="w-14 h-14" className="ring-white/40 shadow-xl" />
                  <div>
                    <h2 className="text-2xl font-black">{selectedStudent.firstName || '—'} {selectedStudent.lastName || ''}</h2>
                    <p className="text-xs text-emerald-100 font-medium">{selectedStudent.email}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-white/20 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-lg">
                      Student Profile
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#182a52]/80 border border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Department</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedStudent.department || 'Not specified'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#182a52]/80 border border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">College / Institution</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedStudent.collegeName || 'Not specified'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#182a52]/80 border border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Registration Number</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedStudent.registrationNumber || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#182a52]/80 border border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Phone</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedStudent.phone || 'N/A'}</p>
                  </div>
                </div>

                {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-2">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedStudent.skills) ? (
                        selectedStudent.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-emerald-950/400/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-400/30">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 bg-emerald-950/400/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-400/30">
                          {selectedStudent.skills}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-3">Student Application Submissions</h4>
                  {applications.filter(a => a.studentEmail === selectedStudent.email).length === 0 ? (
                    <p className="text-xs text-emerald-300/70 font-bold">No applications submitted yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {applications.filter(a => a.studentEmail === selectedStudent.email).map((app, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl border border-emerald-500/20 bg-[#182a52]/80 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-white">{app.internshipTitle}</p>
                            <p className="text-[10px] font-bold text-emerald-300/80">Faculty: {app.facultyEmail}</p>
                          </div>
                          <StatusChip status={app.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERNSHIP DETAIL MODAL */}
      {selectedInternship && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-[#070c1b]/80 backdrop-blur-md" onClick={() => setSelectedInternship(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#132244]/95 backdrop-blur-2xl w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 text-white">
              <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 px-8 py-6 text-white flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Internship Posting</p>
                  <h2 className="text-2xl font-black mt-1">{selectedInternship.title}</h2>
                  <p className="text-xs text-emerald-100 font-medium mt-1">Posted by {selectedInternship.facultyId}</p>
                </div>
                <button onClick={() => setSelectedInternship(null)} className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/40 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/70">Status</p>
                    <p className="text-xs font-black text-emerald-300 mt-1">{selectedInternship.status || 'OPEN'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/40 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/70">Stipend</p>
                    <p className="text-xs font-black text-emerald-300 mt-1">{selectedInternship.stipend || 'Unpaid'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/40 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/70">Mode</p>
                    <p className="text-xs font-black text-emerald-300 mt-1">{selectedInternship.mode || selectedInternship.internshipType || 'TBD'}</p>
                  </div>
                </div>

                {selectedInternship.description && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-300/80 mb-2">Description</h4>
                    <p className="text-xs font-medium text-slate-200 leading-relaxed bg-[#0d1730]/80 p-4 rounded-2xl border border-white/10">
                      {selectedInternship.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-300/80 mb-3">
                    Applicants ({applications.filter(a => a.internshipId === selectedInternship.id).length})
                  </h4>
                  <div className="divide-y divide-white/10 max-h-[220px] overflow-y-auto">
                    {applications.filter(a => a.internshipId === selectedInternship.id).map((app, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{app.studentEmail}</p>
                          <p className="text-[10px] text-slate-400">Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</p>
                        </div>
                        <StatusChip status={app.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 bg-[#080f22]/80 backdrop-blur-xs z-40 transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Left Sidebar Navigation (Collapsible drawer mode, hidden by default) */}
      <aside
        className={`w-64 bg-[#132244]/95 backdrop-blur-3xl border-r border-emerald-500/30 flex flex-col flex-shrink-0 h-screen overflow-y-auto fixed top-0 left-0 z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-emerald-500/30 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="px-2.5 py-1 bg-white rounded-xl shadow-md flex items-center shrink-0"><img src={mitLogo} alt="MIT Logo" className="h-7 object-contain" /></div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer transition" 
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-base font-extrabold text-white tracking-tight leading-none">
              InternSmart
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${currentAccent.badge} shrink-0`}>
              {isSuperAdmin ? <Crown className="w-3 h-3 text-emerald-300" /> : <ShieldCheck className="w-3 h-3 text-emerald-300" />}
              {isSuperAdmin ? 'Super Admin' : 'Dept Admin'}
            </span>
          </div>
        </div>

        <nav className="mt-4 px-4 space-y-1">
          {isSuperAdmin ? (
            <>
              <NavItem 
                icon={<Layers className="w-5 h-5" />} 
                label="All Departments" 
                badge={departments.length.toString()} 
                active={activeTab === 'departments'} 
                onClick={() => { setSelectedDept(null); setActiveTab('departments'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<BuildingIcon className="w-5 h-5" />} 
                label="Faculties & Workspaces" 
                badge={scopedFaculties.length.toString()} 
                active={activeTab === 'department'} 
                onClick={() => { setActiveTab('department'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<FolderKanban className="w-5 h-5" />} 
                label="All Internships" 
                badge={scopedInternships.length.toString()} 
                active={activeTab === 'internships'} 
                onClick={() => { setActiveTab('internships'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<Briefcase className="w-5 h-5" />} 
                label="All Applications" 
                badge={scopedApplications.length.toString()} 
                active={activeTab === 'applications'} 
                onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<PieChartIcon className="w-5 h-5" />} 
                label="Analytics & Graphs" 
                active={activeTab === 'analytics'} 
                onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<UserCheck className="w-5 h-5" />} 
                label="Admin Approval" 
                badge={pendingAdmins.length > 0 ? pendingAdmins.length.toString() : undefined} 
                active={activeTab === 'pending-approvals'} 
                onClick={() => { setActiveTab('pending-approvals'); setIsSidebarOpen(false); }} 
              />
            </>
          ) : (
            <>
              <NavItem 
                icon={<BuildingIcon className="w-5 h-5" />} 
                label={`${adminProfile?.department ? `${adminProfile.department.split(' ')[0]}` : 'Department'} Faculty`} 
                badge={scopedFaculties.length.toString()} 
                active={activeTab === 'department'} 
                onClick={() => { setActiveTab('department'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<FolderKanban className="w-5 h-5" />} 
                label="Department Roles" 
                badge={scopedInternships.length.toString()} 
                active={activeTab === 'internships'} 
                onClick={() => { setActiveTab('internships'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<Briefcase className="w-5 h-5" />} 
                label="Department Applicants" 
                badge={scopedApplications.length.toString()} 
                active={activeTab === 'applications'} 
                onClick={() => { setActiveTab('applications'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<PieChartIcon className="w-5 h-5" />} 
                label="Department Analytics" 
                active={activeTab === 'analytics'} 
                onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} 
              />
            </>
          )}
          
          <div className="pt-4 mt-4 border-t border-emerald-500/30 space-y-1">
            <NavItem 
              icon={<Edit3 className="w-5 h-5" />} 
              label="Edit Admin Profile" 
              onClick={() => { setShowEditAdminProfileModal(true); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<KeyRound className="w-5 h-5" />} 
              label="Change Password" 
              onClick={() => { 
                setShowChangePasswordModal(true); 
                setUseOtpMode(false);
                setPasswordError('');
                setPasswordSuccess('');
                setIsSidebarOpen(false); 
              }} 
            />
            
            {/* SUPER ADMIN SIDEBAR BUTTONS */}
            {isSuperAdmin && (
              <>
                <div className="border-t border-white/10 my-2"></div>
                <div className="px-4 py-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Super Admin</span>
                </div>
                <NavItem 
                  icon={<BuildingIcon className="w-5 h-5" />} 
                  label="Create Department" 
                  onClick={() => { 
                    setShowDepartmentModal(true); 
                    setIsSidebarOpen(false); 
                  }} 
                />
                <NavItem 
                  icon={<UserPlus className="w-5 h-5" />} 
                  label="Create Admin" 
                  onClick={() => { 
                    setShowAdminCreationModal(true); 
                    setIsSidebarOpen(false); 
                  }} 
                />
              </>
            )}
            
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 px-4 py-3.5 rounded-xl text-emerald-300 hover:bg-emerald-950/400/10 transition-all font-bold text-sm cursor-pointer">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-[64px] bg-[#0f1b38]/90 border-b border-emerald-500/30 px-6 sm:px-8 flex items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-xl border border-emerald-500/30 flex items-center justify-center text-emerald-200 bg-[#182a52]/80 backdrop-blur-xs cursor-pointer hover:bg-[#3d1d0a]/80 transition shrink-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="px-2.5 py-1 bg-white rounded-xl shadow-md flex items-center shrink-0 border border-white/40">
                <img src={mitLogo} alt="MIT Logo" className="h-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white leading-none">InternSmart</span>
                <span className={`text-[9px] font-extrabold ${currentAccent.headerTag} uppercase tracking-wider mt-0.5`}>Admin Portal</span>
              </div>
            </div>
            {isSuperAdmin && selectedDept && (
              <button
                onClick={() => {
                  setSelectedDept(null);
                  setActiveTab('departments');
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-950/80 border border-purple-800/60 text-emerald-300 rounded-full text-xs font-bold hover:bg-purple-900 transition"
              >
                ← Back to All Depts
              </button>
            )}
          </div>

          {/* Unified Global Search Bar */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-emerald-300 transition" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculties, students, internships, applications..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-8 py-2 text-xs font-medium text-slate-100 focus:bg-slate-900 focus:border-emerald-500 outline-none transition placeholder:text-slate-300"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Theme Switcher Palette (Super Admin & Department Admin) */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-white/10 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm">
              <span className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1 mr-1">
                <Settings className="w-3 h-3 text-emerald-400" /> Theme:
              </span>
              {(['emerald', 'cyan', 'purple', 'amber', 'rose'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  title={ACCENT_STYLES[t].name}
                  className={`w-5 h-5 rounded-full transition cursor-pointer shrink-0 ${
                    accentTheme === t ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: t === 'emerald' ? '#10b981' : t === 'cyan' ? '#06b6d4' : t === 'purple' ? '#a855f7' : t === 'amber' ? '#f59e0b' : '#f43f5e'
                  }}
                />
              ))}
            </div>

            {/* SUPER ADMIN DEPARTMENT FILTER DROPDOWN IN HEADER */}
            {isSuperAdmin && (
              <div className="hidden xl:flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/30 rounded-full px-3.5 py-1.5 text-xs font-bold text-emerald-300 transition shadow-sm">
                  <BuildingIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <select
                    value={selectedDept || 'ALL'}
                    onChange={(e) => setSelectedDept(e.target.value === 'ALL' ? null : e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-xs font-bold text-emerald-300 pr-1"
                  >
                    <option value="ALL" className="bg-[#0b0f19] text-slate-100 font-medium py-1">All Departments Scope</option>
                    {availableDomains.map((dept, idx) => (
                      <option key={idx} value={dept} className="bg-[#0b0f19] text-slate-100 font-medium py-1">{dept}</option>
                    ))}
                  </select>
                </div>
                
                {/* CREATE DEPARTMENT BUTTON */}
                <button
                  onClick={() => setShowDepartmentModal(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all hover:scale-105 active:scale-95"
                >
                  <BuildingIcon className="w-3.5 h-3.5" />
                  Create Department
                </button>
              </div>
            )}

            {/* MOBILE CREATE DEPARTMENT BUTTON */}
            {isSuperAdmin && (
              <button
                onClick={() => setShowDepartmentModal(true)}
                className="xl:hidden flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all hover:scale-105 active:scale-95"
              >
                <BuildingIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Dept</span>
              </button>
            )}

            {/* MANAGE DEPT ADMINS BUTTON FOR SUPER ADMIN */}
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setTargetDeptForAdminMgmt('');
                  setSelectedFacultyForDeptAdmin('');
                  setShowManageDeptAdminsModal(true);
                }}
                className="hidden lg:flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 rounded-full px-3.5 py-1.5 text-xs font-black transition cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-emerald-300" />
                <span>Manage Dept Admins</span>
              </button>
            )}

            <div 
              onClick={() => setShowEditAdminProfileModal(true)}
              className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-full pl-1 pr-3.5 py-1 shadow-sm cursor-pointer hover:bg-slate-800 transition"
              title="Click to edit profile"
            >
              <div className={`w-8 h-8 rounded-full ${isSuperAdmin ? 'bg-emerald-600 ring-emerald-500' : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 ring-emerald-500'} text-white flex items-center justify-center font-extrabold text-xs shadow-xs ring-2 ring-offset-2 ring-offset-slate-900 overflow-hidden shrink-0`}>
                {isSuperAdmin ? '★' : adminProfile?.firstName?.[0] || adminEmail?.[0] || 'A'}
              </div>
              <span className="text-xs font-extrabold text-slate-200 hidden sm:inline truncate max-w-[120px]">
                {isSuperAdmin ? 'Super Admin' : adminProfile?.firstName || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <div className="dashboard-content p-4 sm:p-6 md:p-10 space-y-8 animate-in">


          {isSuperAdmin && selectedDept && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-950/60 border border-amber-100 text-xs font-black text-emerald-300">
              <Crown className="w-4 h-4" />
              Drilling into department: <span className="text-white">{selectedDept}</span>
              <button onClick={() => setSelectedDept(null)} className="ml-auto px-3 py-1.5 rounded-lg bg-white border border-emerald-500/30 hover:bg-emerald-500/20 transition">
                Exit Department View
              </button>
            </div>
          )}

          <div className="dashboard-panel space-y-8">


            {/* DEPARTMENTS TAB */}
            {activeTab === 'departments' && isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">All Departments</h1>
                    <p className="text-slate-300 mt-0.5 text-xs">Global view of every department. Click a card to drill into its faculty, internships & applications.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => exportToCSV(departments, 'Departments_Summary')}
                      className="btn-secondary py-2 flex items-center gap-2 text-xs font-black"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departments.map((d, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedDept(d.name); setActiveTab('department'); }} 
                      className="card group !p-0 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="h-36 relative overflow-hidden">
                        <img 
                          src={getDeptImage(d.name)} 
                          alt={d.name} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.82]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        {isSuperAdmin && (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDepartmentModal(true);
                              }}
                              className="rounded-full border border-emerald-400/40 bg-slate-950/80 p-2 text-emerald-300 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500/15 hover:text-white"
                              title="Edit department"
                              aria-label={`Edit ${d.name}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDepartmentModal(true);
                              }}
                              className="rounded-full border border-red-400/40 bg-slate-950/80 p-2 text-red-300 shadow-lg shadow-red-900/20 transition hover:bg-red-500/15 hover:text-white"
                              title="Delete department"
                              aria-label={`Delete ${d.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-full text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                          {d.facultyCount} faculty
                        </div>
                      </div>
                      <div className="-mt-6 px-6 pb-6 relative">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 shadow-xl flex items-center justify-center mb-3 text-emerald-300">
                          <BuildingIcon className="w-7 h-7" />
                        </div>
                        <div className="mb-4">
                          <h3 className="text-base font-bold text-white tracking-tight leading-tight">{d.name}</h3>
                          {(() => {
                            const deptAdmin = d.faculty.find((f: any) => f.role === 'ADMIN');
                            return deptAdmin ? (
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                                <Crown className="w-3 h-3 text-emerald-400" /> Admin: {deptAdmin.firstName ? `${deptAdmin.firstName} ${deptAdmin.lastName || ''}` : deptAdmin.email.split('@')[0]}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                No Admin Assigned
                              </span>
                            );
                          })()}
                        </div>

                        {isSuperAdmin && (
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetDeptForAdminMgmt(d.name);
                                setSelectedFacultyForDeptAdmin('');
                                setShowManageDeptAdminsModal(true);
                              }}
                              className="w-full py-2 px-3 bg-emerald-950/60 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Crown className="w-3.5 h-3.5 text-emerald-400" />
                              Manage Dept Admin
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                          <MiniStat label="Faculty" value={d.facultyCount} color="purple" icon={<Users className="w-4 h-4" />} />
                          <MiniStat label="Roles" value={d.internshipCount} color="blue" icon={<FolderKanban className="w-4 h-4" />} />
                          <MiniStat label="Applied" value={d.applicationCount} color="emerald" icon={<Briefcase className="w-4 h-4" />} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FACULTIES & WORKSPACES HIERARCHICAL TAB */}
            {activeTab === 'department' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <BuildingIcon className="w-5 h-5 text-emerald-300" />
                      {isSuperAdmin && selectedDept ? selectedDept : (adminProfile?.department || 'Department')} Workspaces & Roster
                    </h1>
                    <p className="text-slate-300 mt-0.5 text-xs">
                      Faculty members and student roster for {scopedDepartment || 'this department'}
                    </p>
                  </div>
                  
                  {/* FILTER BUTTONS: ALL / FACULTIES / STUDENTS */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setDeptTabFilter('ALL')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        deptTabFilter === 'ALL'
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-200/60'
                      }`}
                    >
                      All ({scopedFaculties.length + scopedStudents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeptTabFilter('FACULTY')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        deptTabFilter === 'FACULTY'
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-200/60'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Faculties ({scopedFaculties.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeptTabFilter('STUDENTS')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        deptTabFilter === 'STUDENTS'
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-200/60'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Students ({scopedStudents.length})
                    </button>
                  </div>
                </div>

                {isSuperAdmin && scopedDepartment && (
                  <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30/80 bg-emerald-950/60/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-emerald-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Department Admin Management</p>
                      </div>
                      <p className="text-sm font-black text-white mt-1">
                        Current Admin: {currentDeptAdminEmail ? currentDeptAdminEmail : 'No Admin Assigned'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                      <select
                        value={deptAdminCandidateEmail}
                        onChange={(e) => setDeptAdminCandidateEmail(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-emerald-500/30 text-xs font-bold text-white outline-none cursor-pointer min-w-[240px]"
                      >
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="">-- Choose Faculty to Appoint --</option>
                        {scopedFaculties.map((f: any) => (
                          <option className="bg-[#0b0f19] text-slate-100 font-medium" key={f.email} value={f.email}>
                            {getDisplayFacultyName(f)} ({f.email}) {f.role === 'ADMIN' ? '★ Current Admin' : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={deptAdminUpdating || !deptAdminCandidateEmail || deptAdminCandidateEmail === currentDeptAdminEmail}
                        onClick={() => handleAssignDeptAdmin(scopedDepartment, deptAdminCandidateEmail)}
                        className={`btn-primary !py-2.5 !px-4 text-xs font-black flex items-center justify-center gap-1.5 !bg-emerald-600 hover:!bg-emerald-700 cursor-pointer ${
                          deptAdminUpdating || !deptAdminCandidateEmail || deptAdminCandidateEmail === currentDeptAdminEmail ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        Appoint / Change Admin
                      </button>
                      {currentDeptAdminEmail && (
                        <button
                          type="button"
                          disabled={deptAdminUpdating}
                          onClick={() => handleRemoveDeptAdmin(scopedDepartment)}
                          className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Admin
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="card flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* FACULTIES SECTION */}
                    {(deptTabFilter === 'ALL' || deptTabFilter === 'FACULTY') && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-300" />
                            <span className="text-sm font-bold text-white">Department Faculties ({scopedFaculties.length})</span>
                          </div>
                          <button 
                            onClick={() => exportToCSV(scopedFaculties, `${scopedDepartment || 'Dept'}_Faculty_List`)}
                            className="btn-secondary py-1 px-3 flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
                          >
                            <Download className="w-3.5 h-3.5" /> Export Faculty CSV
                          </button>
                        </div>

                        {scopedFaculties.length === 0 ? (
                          <div className="card flex flex-col items-center justify-center h-48 text-center space-y-3 text-slate-300">
                            <Users className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-bold text-slate-300">No faculty found in {scopedDepartment || 'this department'}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {scopedFaculties.map((f) => {
                              const facInternships = internships.filter(i => i.facultyId === f.email);
                              const facApplications = applications.filter(a => a.facultyEmail === f.email);
                              const selectedCount = facApplications.filter(a => a.status === 'SELECTED').length;

                              return (
                                <div 
                                  key={f.email} 
                                  onClick={() => openFacultyPage(f.email)}
                                  className="card hover:shadow-lg transition-all border border-white/10 p-5 space-y-4 cursor-pointer group hover:border-purple-300 flex flex-col justify-between"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <UserAvatar user={f} size="w-12 h-12" className={f.role === 'ADMIN' ? 'ring-emerald-400' : 'ring-emerald-500/30'} />
                                        <div className="min-w-0">
                                          <h4 className="text-base font-extrabold text-white group-hover:text-purple-700 transition truncate">
                                            {getDisplayFacultyName(f)}
                                          </h4>
                                          <p className="text-xs text-slate-300 font-medium truncate">
                                            {f.email}
                                          </p>
                                        </div>
                                      </div>

                                      {isSuperAdmin && f.department && (
                                        <button
                                          type="button"
                                          disabled={deptAdminUpdating}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (f.role === 'ADMIN') {
                                              handleRemoveDeptAdmin(f.department);
                                            } else {
                                              handleAssignDeptAdmin(f.department, f.email);
                                            }
                                          }}
                                          className={`p-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                                            f.role === 'ADMIN'
                                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-amber-200 border border-amber-300'
                                              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                                          } ${deptAdminUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                          title={f.role === 'ADMIN' ? 'Remove Admin Post' : `Make ${getDisplayFacultyName(f)} Dept Admin`}
                                        >
                                          <Crown className="w-4 h-4 text-emerald-400" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-1">
                                      {f.role === 'ADMIN' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/600/20 text-emerald-300 border border-emerald-500/40">
                                          <Crown className="w-3 h-3 text-emerald-300" /> {f.email === adminEmail ? 'You — Dept Admin' : 'Dept Admin'}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-200 border border-white/10">
                                          {f.email === adminEmail ? 'You — Faculty' : 'Faculty Member'}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1 text-xs font-black">
                                    <span className="px-2.5 py-1 bg-purple-950/60 text-purple-700 rounded-lg text-[11px]">
                                      {facInternships.length} Projects
                                    </span>
                                    <span className="px-2.5 py-1 bg-blue-950/60 text-blue-700 rounded-lg text-[11px]">
                                      {facApplications.length} Applicants
                                    </span>
                                    <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-700 rounded-lg text-[11px]">
                                      {selectedCount} Hired
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STUDENTS SECTION */}
                    {(deptTabFilter === 'ALL' || deptTabFilter === 'STUDENTS') && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-bold text-white">Department Students ({scopedStudents.length})</span>
                          </div>
                          <button
                            onClick={() => exportToCSV(scopedStudents, `${scopedDepartment || 'Dept'}_Students_Roster`)}
                            className="btn-secondary py-1 px-3 flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
                          >
                            <Download className="w-3.5 h-3.5" /> Export Students CSV
                          </button>
                        </div>

                        {scopedStudents.length === 0 ? (
                          <div className="card flex flex-col items-center justify-center h-48 text-center space-y-3 text-slate-300">
                            <GraduationCap className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-bold text-slate-300">No students registered in {scopedDepartment || 'this department'}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {scopedStudents.map((s, idx) => {
                              const studentApps = applications.filter(a => a.studentEmail === s.email);
                              const hiredCount = studentApps.filter(a => a.status === 'SELECTED').length;
                              return (
                                <div key={idx} className="card hover:shadow-md transition border border-white/10 p-5 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <UserAvatar user={s} size="w-11 h-11" className="ring-emerald-500/30" />
                                      <div className="min-w-0">
                                        <h4 className="text-sm font-extrabold text-white truncate">
                                          {s.firstName || '—'} {s.lastName || ''}
                                        </h4>
                                        <p className="text-xs text-slate-300 font-medium truncate">
                                          {s.email}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => openStudentModal(s)}
                                      className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-950/60 rounded-xl transition shrink-0"
                                      title="View Student Profile"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300">
                                    <span className="px-2.5 py-1 bg-slate-900/90 text-slate-200 rounded-lg text-[11px] truncate max-w-[140px]">
                                      {s.registrationNumber || s.collegeName || 'Student'}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="px-2 py-0.5 bg-blue-950/60 text-blue-700 rounded-md text-[11px] font-bold">
                                        {studentApps.length} Apps
                                      </span>
                                      {hiredCount > 0 && (
                                        <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-700 rounded-md text-[11px] font-bold">
                                          {hiredCount} Hired
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DEDICATED FACULTY WORKSPACE PAGE */}
            {activeTab === 'faculty-detail' && (() => {
              const currentFaculty = faculties.find(f => f.email === activeFacultyEmail) || selectedFaculty || scopedFaculties[0];
              if (!currentFaculty) return <div className="p-8 font-bold text-slate-300">Faculty not found.</div>;

              const facInternships = internships.filter(i => i.facultyId === currentFaculty.email);
              const facApplications = applications.filter(a => a.facultyEmail === currentFaculty.email);
              const selectedCount = facApplications.filter(a => a.status === 'SELECTED').length;
              const isMe = currentFaculty.email === adminEmail;
              const displayName = getDisplayFacultyName(currentFaculty);

              const openProjectsCount = facInternships.filter(i => (i.status || 'OPEN').toUpperCase() === 'OPEN').length;
              const closedProjectsCount = facInternships.filter(i => (i.status || 'OPEN').toUpperCase() === 'CLOSED').length;

              const displayedFacProjects = facInternships
                .filter(i => {
                  const st = (i.status || 'OPEN').toUpperCase();
                  if (facProjectStatusFilter === 'OPEN') return st === 'OPEN';
                  if (facProjectStatusFilter === 'CLOSED') return st === 'CLOSED';
                  return true;
                })
                .sort((a, b) => {
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  if (timeA !== timeB) return timeB - timeA;
                  return String(b.id || '').localeCompare(String(a.id || ''));
                });

              return (
                <div className="space-y-4 animate-in">
                  {/* Clean Faculty Workspace Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('department')}
                        className="px-3 py-1.5 bg-white border border-white/10 hover:bg-[#080f22]/80 text-slate-200 rounded-xl text-xs font-black transition shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-extrabold text-white tracking-tight">{displayName}</h1>
                          {currentFaculty.role === 'ADMIN' ? (
                            <span className="px-2.5 py-0.5 bg-emerald-950/600/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider rounded-full border border-emerald-500/40 flex items-center gap-1">
                              <Crown className="w-3 h-3 text-emerald-300" /> {isMe ? 'You — Dept Admin' : 'Dept Admin'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-slate-900/90 text-slate-200 font-bold text-[10px] uppercase tracking-wider rounded-full border border-white/10">
                              {isMe ? 'You — Faculty' : 'Faculty Member'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-300 mt-0.5">
                          {currentFaculty.department || 'Department N/A'} • {currentFaculty.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
                      <div className="flex items-center gap-2 text-xs font-black">
                        {/* FILTER DROPDOWN LIST */}
                        <div className="flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-slate-300" />
                          <select
                            value={facProjectStatusFilter}
                            onChange={(e) => setFacProjectStatusFilter(e.target.value as 'ALL' | 'OPEN' | 'CLOSED')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-white/10 text-[11px] font-bold text-slate-200 uppercase tracking-wider outline-none cursor-pointer hover:border-purple-300 transition shadow-2xs"
                          >
                            <option className="bg-[#0b0f19] text-slate-100 font-medium" value="ALL">All Projects ({facInternships.length})</option>
                            <option className="bg-[#0b0f19] text-slate-100 font-medium" value="OPEN">Open Projects ({openProjectsCount})</option>
                            <option className="bg-[#0b0f19] text-slate-100 font-medium" value="CLOSED">Closed Projects ({closedProjectsCount})</option>
                          </select>
                        </div>

                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
                          {facApplications.length} Applicants
                        </span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                          {selectedCount} Hired
                        </span>
                      </div>

                      <button
                        onClick={() => exportToCSV(facApplications, `Faculty_${currentFaculty.email}_Report`)}
                        className="btn-secondary py-1.5 px-3 text-xs font-black flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Projects Grid of Faculty */}
                  <div className="space-y-4 pt-1">

                    {displayedFacProjects.length === 0 ? (
                      <div className="card text-center py-14 text-slate-300 font-bold text-sm">
                        No {facProjectStatusFilter !== 'ALL' ? facProjectStatusFilter.toLowerCase() : ''} projects found for this faculty.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedFacProjects.map(i => {
                          const projectApps = applications.filter(a => a.internshipId === i.id || a.internshipTitle === i.title);
                          return (
                            <div 
                              key={i.id} 
                              onClick={() => openProjectPage(i.id)}
                              className="card !p-6 flex flex-col justify-between min-h-[230px] hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer group space-y-4 border border-white/10"
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-base font-extrabold text-white group-hover:text-purple-600 transition leading-snug">
                                    {i.title}
                                  </h4>
                                  <StatusChip status={i.status} />
                                </div>

                                <div className="space-y-1.5 text-xs font-bold text-slate-300 pt-1">
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span className="truncate">{i.location || 'Remote'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span>Stipend: {i.stipend || 'Unpaid'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span>Duration: {i.duration || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
                                <span className="px-2.5 py-1 bg-purple-950/60 text-purple-700 text-xs font-black rounded-lg shrink-0">
                                  {projectApps.length} Student{projectApps.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openProjectPage(i.id); }}
                                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 group-hover:bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-black flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Students →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* DEDICATED PROJECT DETAILS PAGE */}
            {activeTab === 'project-detail' && (() => {
              const currentProject = internships.find(i => i.id === activeProjectId) || selectedInternship || internships[0];
              if (!currentProject) return <div className="p-8 font-bold text-slate-300">Project not found.</div>;

              const fac = faculties.find(f => f.email === currentProject.facultyId);
              const facName = getDisplayFacultyName(fac);
              const projectApps = applications
                .filter(a => a.internshipId === currentProject.id || a.internshipTitle === currentProject.title)
                .sort((a, b) => {
                  const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                  const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                  if (timeA !== timeB) return timeB - timeA;
                  return String(b.id || '').localeCompare(String(a.id || ''));
                });

              return (
                <div className="space-y-6 animate-in">
                  {/* Clean Project Header Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab(activeFacultyEmail ? 'faculty-detail' : 'internships')}
                        className="px-3 py-2 bg-white border border-white/10 hover:bg-[#080f22]/80 text-slate-200 rounded-xl text-xs font-black transition shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl font-extrabold text-white tracking-tight">{currentProject.title}</h1>
                          <StatusChip status={currentProject.status} />
                        </div>
                        <p className="text-xs font-bold text-slate-300 mt-0.5">
                          Posted by {facName} • {currentProject.location || 'Remote'} • Stipend: {currentProject.stipend || 'Unpaid'} • Duration: {currentProject.duration || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
                      {/* VIEW MODE TOGGLE BUTTONS */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setProjectDetailView('STUDENTS')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            projectDetailView === 'STUDENTS'
                              ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-200/60'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          Students List ({projectApps.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectDetailView('GRAPH')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            projectDetailView === 'GRAPH'
                              ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white shadow-xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-200/60'
                          }`}
                        >
                          <PieChartIcon className="w-3.5 h-3.5" />
                          Graph View
                        </button>
                      </div>

                      <button
                        onClick={() => exportToCSV(projectApps, `Project_${currentProject.title}_Report`)}
                        className="btn-secondary py-1.5 px-3 text-xs font-black flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Export CSV
                      </button>
                    </div>
                  </div>

                  {/* SHOW STUDENTS AT TOP (DEFAULT) */}
                  {projectDetailView === 'STUDENTS' ? (
                    <div className="card space-y-4 animate-in">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          Applicants Roster ({projectApps.length})
                        </h3>
                      </div>

                      {projectApps.length === 0 ? (
                        <p className="text-xs text-slate-300 font-medium py-10 text-center bg-[#080f22]/80 rounded-2xl">
                          No candidates have applied to this project yet.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/10 bg-[#080f22]/80">
                                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-300">Student Email</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-300">Status</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-300">Applied Date</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-300 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {projectApps.map((app, appIdx) => {
                                const studentObj = students.find(s => s.email === app.studentEmail);
                                return (
                                  <tr key={appIdx} className="hover:bg-[#080f22]/80 transition">
                                    <td className="px-4 py-3 text-xs font-bold text-white">{app.studentEmail}</td>
                                    <td className="px-4 py-3"><StatusChip status={app.status} /></td>
                                    <td className="px-4 py-3 text-xs text-slate-300 font-medium">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                      {studentObj && (
                                        <button
                                          onClick={() => openStudentModal(studentObj)}
                                          className="px-3 py-1.5 bg-purple-950/60 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition"
                                        >
                                          View Student Profile
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* GRAPH VIEW */
                    <div className="card space-y-4 animate-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <PieChartIcon className="w-5 h-5 text-purple-600" />
                          Project Status Pie Chart & Candidate Analytics
                        </h3>
                        <button
                          type="button"
                          onClick={() => setProjectDetailView('STUDENTS')}
                          className="px-3.5 py-1.5 bg-blue-950/60 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                        >
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          Show Students List ({projectApps.length}) →
                        </button>
                      </div>
                      <ProjectStatusPieChart applications={projectApps} projectTitle={currentProject.title} />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* INTERNSHIPS TAB */}
            {activeTab === 'internships' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Internships</h1>
                    <p className="text-slate-300 mt-0.5 text-xs">{scopeLabel} — {scopedInternships.length} posting{scopedInternships.length !== 1 ? 's' : ''} published</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Department Filter for Super Admin */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                        <BuildingIcon className="w-3.5 h-3.5 text-purple-600" />
                        <select 
                          value={selectedDept || 'ALL'} 
                          onChange={(e) => setSelectedDept(e.target.value === 'ALL' ? null : e.target.value)}
                          className="bg-transparent outline-none cursor-pointer"
                        >
                          <option className="bg-[#0b0f19] text-slate-100 font-medium" value="ALL">All Departments</option>
                          {availableDomains.map((dept, idx) => (
                            <option className="bg-[#0b0f19] text-slate-100 font-medium" key={idx} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                      <Filter className="w-3.5 h-3.5 text-slate-300" />
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer"
                      >
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="ALL">All Statuses</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="OPEN">Open</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="CLOSED">Closed</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="bg-slate-900/90 p-1 rounded-2xl flex items-center border border-white/10">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition ${
                          viewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <TableIcon className="w-3.5 h-3.5" /> Cards
                      </button>
                      <button
                        onClick={() => setViewMode('graphs')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition ${
                          viewMode === 'graphs' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <PieChartIcon className="w-3.5 h-3.5" /> Graph View
                      </button>
                    </div>

                    <button 
                      onClick={() => exportToCSV(scopedInternships, 'Internships_List')}
                      className="btn-secondary py-2 flex items-center gap-2 text-xs font-black"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>

                {viewMode === 'graphs' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in">
                    <InternshipDistributionChart internships={scopedInternships} />
                    <FacultyPerformanceChart faculties={scopedFaculties} internships={scopedInternships} applications={scopedApplications} />
                  </div>
                ) : (
                  loading ? (
                    <div className="card flex justify-center items-center h-64">
                      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : scopedInternships.length === 0 ? (
                    <div className="card flex flex-col items-center justify-center h-80 text-center space-y-4 text-slate-300">
                      <FolderKanban className="w-20 h-20 opacity-10" />
                      <div>
                        <h3 className="text-xl font-black text-slate-200">No internships posted yet</h3>
                        <p className="text-sm font-medium mt-1 text-slate-300 max-w-sm">Once faculty posts internship openings, they'll show up here.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {scopedInternships.map((i, idx) => {
                        const fac = faculties.find(f => f.email === i.facultyId);
                        const appCount = applications.filter(a => a.internshipId === i.id).length;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => openProjectPage(i.id)}
                            className="card group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                <FolderKanban className="w-6 h-6" />
                              </div>
                              <StatusChip status={i.status} />
                            </div>
                            <h3 className="text-xl font-black text-white leading-tight mb-1">{i.title}</h3>
                            <div className="grid grid-cols-2 gap-2 mb-5">
                              <MiniPill icon={<MapPin className="w-3.5 h-3.5" />} label={i.location || 'TBD'} />
                              <MiniPill icon={<Clock className="w-3.5 h-3.5" />} label={i.duration || '—'} />
                              <MiniPill icon={<CreditCard className="w-3.5 h-3.5" />} label={i.stipend || 'Unpaid'} />
                              <MiniPill icon={<Briefcase className="w-3.5 h-3.5" />} label={i.mode || i.internshipType || '—'} />
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Posted By</p>
                                <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                                  {fac?.email || i.facultyId || 'Faculty'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Applicants</p>
                                <p className="text-lg font-black text-purple-700 flex items-center gap-1 justify-end">
                                  <Users className="w-4 h-4" /> {appCount}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Applications</h1>
                    <p className="text-slate-300 mt-0.5 text-xs">{scopeLabel} — {scopedApplications.length} application{scopedApplications.length !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Department Filter for Super Admin */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                        <BuildingIcon className="w-3.5 h-3.5 text-purple-600" />
                        <select 
                          value={selectedDept || 'ALL'} 
                          onChange={(e) => setSelectedDept(e.target.value === 'ALL' ? null : e.target.value)}
                          className="bg-transparent outline-none cursor-pointer"
                        >
                          <option className="bg-[#0b0f19] text-slate-100 font-medium" value="ALL">All Departments</option>
                          {availableDomains.map((dept, idx) => (
                            <option className="bg-[#0b0f19] text-slate-100 font-medium" key={idx} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                      <Filter className="w-3.5 h-3.5 text-slate-300" />
                      <select 
                        value={appStatusFilter} 
                        onChange={(e) => setAppStatusFilter(e.target.value)}
                        className="bg-transparent outline-none cursor-pointer"
                      >
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="ALL">All Statuses</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="APPLIED">Applied</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="SHORTLISTED">Shortlisted</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="INTERVIEW">Interview</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="SELECTED">Selected</option>
                        <option className="bg-[#0b0f19] text-slate-100 font-medium" value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="bg-slate-900/90 p-1 rounded-2xl flex items-center border border-white/10">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition ${
                          viewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <TableIcon className="w-3.5 h-3.5" /> Table
                      </button>
                      <button
                        onClick={() => setViewMode('graphs')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition ${
                          viewMode === 'graphs' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <PieChartIcon className="w-3.5 h-3.5" /> Funnel Graph
                      </button>
                    </div>

                    <button 
                      onClick={() => exportToCSV(scopedApplications, 'Applications_Report')}
                      className="btn-secondary py-2 flex items-center gap-2 text-xs font-black"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>

                {viewMode === 'graphs' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in">
                    <ApplicationPipelineDonutChart applications={scopedApplications} />
                    <ActivityTrendChart applications={scopedApplications} />
                  </div>
                ) : (
                  <div className="card !p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-white/10 bg-[#080f22]/80">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Student</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Internship</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Faculty</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Applied At</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Dept</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {loading ? (
                            <tr><td colSpan={7} className="py-10 text-center text-slate-300 px-6">Loading...</td></tr>
                          ) : scopedApplications.length === 0 ? (
                            <tr><td colSpan={7} className="py-12 text-center text-slate-300 font-medium px-6">No applications in scope yet.</td></tr>
                          ) : scopedApplications.map((a, i) => {
                            const fac = faculties.find(f => f.email === a.facultyEmail);
                            const studentObj = students.find(s => s.email === a.studentEmail);
                            const dept = fac?.department || (isSuperAdmin ? 'Unassigned' : (adminProfile?.department || '—'));
                            const sInitials = a.studentEmail?.substring(0, 2).toUpperCase() || 'ST';
                            return (
                              <tr key={i} className="hover:bg-[#080f22]/80">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">{sInitials}</div>
                                    <div>
                                      <button onClick={() => studentObj && openStudentModal(studentObj)} className="text-xs font-bold text-white hover:text-purple-600 text-left">
                                        {a.studentEmail?.split('@')[0]}
                                      </button>
                                      <p className="text-[10px] text-slate-300 truncate max-w-[200px]">{a.studentEmail}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-xs font-bold text-white truncate max-w-[240px]">{a.internshipTitle}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-xs font-bold text-white">
                                    {fac ? `${fac.firstName || ''} ${fac.lastName || ''}`.trim() || fac.email?.split('@')[0] : a.facultyEmail?.split('@')[0]}
                                  </p>
                                  <p className="text-[10px] text-slate-300 truncate max-w-[200px]">{a.facultyEmail}</p>
                                </td>
                                <td className="px-6 py-4"><StatusChip status={a.status} /></td>
                                <td className="px-6 py-4">
                                  <p className="text-[11px] font-bold text-slate-300 whitespace-nowrap">
                                    {a.appliedAt ? new Date(a.appliedAt).toLocaleString() : '—'}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700">
                                    <BuildingIcon className="w-3 h-3" /> {dept}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {studentObj && (
                                    <button 
                                      onClick={() => openStudentModal(studentObj)}
                                      className="p-1.5 text-slate-300 hover:text-purple-600 rounded-lg hover:bg-purple-950/60 transition"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GRAPHS & VISUAL ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Graphs & Visual Analytics</h1>
                  <p className="text-slate-300 mt-0.5 text-xs">{scopeLabel} — Interactive visual breakdown of all microservice data</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ApplicationPipelineDonutChart applications={scopedApplications} />
                  <DepartmentComparisonChart departments={departments} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FacultyPerformanceChart 
                    faculties={scopedFaculties} 
                    internships={scopedInternships} 
                    applications={scopedApplications} 
                  />
                  <InternshipDistributionChart internships={scopedInternships} />
                </div>

                <ActivityTrendChart applications={scopedApplications} />
              </div>
            )}

            {/* PENDING APPROVALS TAB */}
            {activeTab === 'pending-approvals' && isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Approval</h1>
                    <p className="text-slate-300 mt-0.5 text-xs">Review and approve department admin registrations</p>
                  </div>
                  <button
                    onClick={clearAllAdmins}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All Admins
                  </button>
                </div>
                <div className="card !p-0 overflow-hidden">
                  {loadingPendingAdmins ? (
                    <div className="py-12 text-center text-slate-300 font-medium">Loading pending admins...</div>
                  ) : pendingAdmins.length === 0 ? (
                    <div className="py-12 text-center text-slate-300 font-medium">No pending admin registrations</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {pendingAdmins.map((admin, index) => (
                        <div key={index} className="p-6 hover:bg-[#080f22]/80 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-emerald-500/30 text-emerald-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {admin.profilePhoto ? (
                                  <img src={getPhotoUrl(admin.profilePhoto)!} alt={admin.email} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                ) : (
                                  <UserCircle2 className="w-6 h-6 text-emerald-300" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-white">{admin.email}</h3>
                                <p className="text-sm text-slate-300 mt-1">Role: {admin.role}</p>
                                <p className="text-xs text-slate-300 mt-1">Status: <span className="font-bold text-emerald-400">Pending Approval</span></p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approveAdmin(admin.email)}
                                className="px-4 py-2 bg-emerald-950/600 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                              </button>
                              <button
                                onClick={() => rejectAdmin(admin.email)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                              >
                                <X className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
                  <p className="text-slate-300 mt-0.5 text-xs">
                    {isSuperAdmin ? 'Platform-level configuration.' : 'Department-level configuration.'}
                  </p>
                </div>
                {/* Super Admin Only Features */}
                {isSuperAdmin && (
                  <>
                    {/* Department Management Card */}
                    <div className="card">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                            <BuildingIcon className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white">Department Management</h3>
                            <p className="text-sm text-slate-300 mt-1">
                              Create, edit, and manage academic departments across the institution.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDepartmentModal(true)}
                          className="py-2.5 px-5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center gap-2 shrink-0 cursor-pointer transition active:scale-95"
                        >
                          <BuildingIcon className="w-4 h-4" /> Manage Departments
                        </button>
                      </div>
                    </div>

                    {/* Admin Creation Card */}
                    <div className="card">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                            <UserPlus className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white">Create Department Admin</h3>
                            <p className="text-sm text-slate-300 mt-1">
                              Create new admin accounts for specific departments with full privileges.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAdminCreationModal(true)}
                          className="py-2.5 px-5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center gap-2 shrink-0 cursor-pointer transition active:scale-95"
                        >
                          <UserPlus className="w-4 h-4" /> Create Admin
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Theme Selector Card (Super Admin & Department Admin) */}
                <div className="card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                        <Settings className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Dashboard Accent Theme</h3>
                        <p className="text-sm text-slate-300 mt-1">
                          Customize visual accent colors and glow themes ({isSuperAdmin ? 'Super Admin Portal' : 'Department Admin'}).
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'emerald', label: 'Cyber Emerald', color: 'bg-emerald-500 text-emerald-300' },
                        { id: 'cyan', label: 'Electric Cyan', color: 'bg-cyan-500 text-cyan-300' },
                        { id: 'purple', label: 'Royal Amethyst', color: 'bg-purple-500 text-purple-300' },
                        { id: 'amber', label: 'Gold Sunburst', color: 'bg-amber-500 text-amber-300' },
                        { id: 'rose', label: 'Crimson Ruby', color: 'bg-rose-500 text-rose-300' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id as any)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            accentTheme === t.id
                              ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-400'
                              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${t.color.split(' ')[0]}`} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                        <Edit3 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Admin Profile Settings</h3>
                        <p className="text-sm text-slate-300 mt-1">
                          Update your name, designation, phone number, and domain scope department.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEditAdminProfileModal(true)}
                      className="btn-primary py-2.5 px-5 text-xs font-black flex items-center gap-2 shrink-0 !bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:!bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                        <KeyRound className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Change Admin Password</h3>
                        <p className="text-sm text-slate-300 mt-1">
                          Update your password by entering your current old password. If you forgot your old password, you can request an OTP sent to your registered email address.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowChangePasswordModal(true);
                        setUseOtpMode(false);
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="btn-primary py-2.5 px-5 text-xs font-black flex items-center gap-2 shrink-0 !bg-emerald-600 hover:!bg-emerald-700 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" /> Change Password
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Security & Authentication</h3>
                      <p className="text-sm text-slate-300 mt-1">Password policy, 2FA and Google OAuth credentials.</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                        <Database className="w-6 h-6 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Database Management & Reset</h3>
                        <p className="text-sm text-slate-300 mt-1">
                          Wipe all applicant applications, weekly reports, and internship listings from the website and backend databases.
                          <strong className="text-rose-400 block mt-0.5">Note: All user accounts (Students, Faculty, Admins) and profile data will remain safely preserved.</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearApplicantsAndInternships}
                      className="py-2.5 px-5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-950/40 border border-rose-400/30 flex items-center gap-2 shrink-0 cursor-pointer transition active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Applicants &amp; Internships
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Default Super Admin Credentials</h3>
                      <div className="mt-4 rounded-2xl bg-[#080f22]/80 border border-white/10 p-5 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Email</span>
                          <span className="font-bold text-white">{SUPER_ADMIN_EMAIL}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Password</span>
                          <span className="font-bold text-white">Admin@Password123</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Role</span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700"><Crown className="w-3 h-3 text-emerald-600" /> Super Admin (Global)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standardized Admin & Super Admin Portal Footer */}
            <footer className="pt-8 pb-6 border-t border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl text-center space-y-3 mt-12 w-full">
              <div className="flex items-center justify-center gap-2.5">
                <div className="px-2.5 py-1 bg-white rounded-xl shadow-md flex items-center shrink-0 border border-white/40">
                  <img src={mitLogo} alt="MIT Logo" className="h-6 object-contain" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-white leading-tight">InternSmart</span>
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">
                    {isSuperAdmin ? 'MIT Super Admin Portal' : 'MIT Administrative Portal'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-slate-300 font-semibold flex-wrap">
                <a href="#" className="hover:text-emerald-700 transition">System Support</a>
                <a href="#" className="hover:text-emerald-700 transition">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-700 transition">Terms of Governance</a>
                <a href="#" className="hover:text-emerald-700 transition">IT Assistance Desk</a>
              </div>
              <div className="text-xs text-slate-300 font-medium">
                © {new Date().getFullYear()} Manipal Institute of Technology — InternSmart. All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DepartmentManagementModal 
        isOpen={showDepartmentModal} 
        onClose={() => setShowDepartmentModal(false)} 
      />
      
      {/* FLOATING ACTION BUTTON FOR SUPER ADMIN */}
      {isSuperAdmin && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          <button
            onClick={() => setShowAdminCreationModal(true)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            title="Create Admin"
          >
            <UserPlus className="w-6 h-6" />
            <span className="absolute right-full mr-3 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Create Admin
            </span>
          </button>
          <button
            onClick={() => setShowDepartmentModal(true)}
            className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            title="Create Department"
          >
            <BuildingIcon className="w-6 h-6" />
            <span className="absolute right-full mr-3 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Create Department
            </span>
          </button>
        </div>
      )}
      
      <AdminCreationModal 
        isOpen={showAdminCreationModal} 
        onClose={() => setShowAdminCreationModal(false)}
        onSuccess={() => {
          // Refresh admin list or other necessary data
          fetchPendingAdmins();
        }}
      />
    </div>
  );
};

const StatusChip = ({ status }: { status?: string }) => {
  const s = status?.toUpperCase() || 'UNKNOWN';
  const styles: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-slate-900/90 text-slate-300',
    APPLIED: 'bg-sky-100 text-sky-700',
    SHORTLISTED: 'bg-purple-100 text-purple-700',
    INTERVIEW: 'bg-orange-100 text-orange-700',
    SELECTED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    UNKNOWN: 'bg-slate-900/90 text-slate-300'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${styles[s] || styles.UNKNOWN}`}>
      {s === 'SELECTED' ? <CheckCircle2 className="w-3 h-3" /> : (s === 'REJECTED' || s === 'CLOSED' ? <AlertCircle className="w-3 h-3" /> : <Hash className="w-3 h-3" />)}
      {s}
    </span>
  );
};



const MiniStat = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) => {
  const map: Record<string, string> = {
    purple: 'bg-purple-950/60 text-purple-700',
    blue: 'bg-blue-950/60 text-blue-700',
    emerald: 'bg-emerald-950/60 text-emerald-700'
  };
  return (
    <div className="text-center py-2.5 rounded-xl bg-[#080f22]/80">
      <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center mb-1.5 ${map[color] || map.blue}`}>{icon}</div>
      <p className="text-lg font-black text-white leading-none">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">{label}</p>
    </div>
  );
};

const MiniPill = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080f22]/80 text-slate-300 text-[11px] font-bold truncate">
    <span className="text-slate-300">{icon}</span>
    <span className="truncate">{label}</span>
  </div>
);

export default AdminDashboard;
