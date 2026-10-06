import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Briefcase,
  Calendar,
  PlusCircle,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import { REAL_INTERNSHIPS, SAMPLE_APPLICATIONS } from '../../constants/defaultInternships';
import { EditInternshipModal } from './EditInternshipModal';

export const FacultyOverview = ({ onMessage: _onMessage }: { onMessage: (s: any) => void }) => {
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [_matchMap, setMatchMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [_facultyEmail, setFacultyEmail] = useState('');

  // Postings filter state
  const [internshipFilter, setInternshipFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ACTIVE');
  const [internshipSearch, setInternshipSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Edit and Delete Modal states
  const [editingInternship, setEditingInternship] = useState<any | null>(null);
  const [deletingInternship, setDeletingInternship] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        let email = '';
        if (token) {
          const decoded: any = jwtDecode(token);
          email = decoded.sub ? String(decoded.sub).trim() : '';
        }
        setFacultyEmail(email);

        const [internshipsRes, applicationsRes, meetingsRes, matchesRes] = await Promise.all([
          email ? api.get(`/internships/faculty?email=${encodeURIComponent(email)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          email ? api.get(`/applications/faculty?email=${encodeURIComponent(email)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          email ? api.get(`/meetings/host?email=${encodeURIComponent(email)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          email ? api.get(`/recommendations/faculty-applicants?email=${encodeURIComponent(email)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);

        const cleanEmail = email.toLowerCase().trim();

        let myInternships = (internshipsRes.data || []).filter((i: any) =>
          String(i.facultyId || '').trim().toLowerCase() === cleanEmail
        );
        if (myInternships.length === 0) {
          myInternships = cleanEmail
            ? (REAL_INTERNSHIPS as any[]).filter((i) => String(i.facultyId || '').toLowerCase() === cleanEmail)
            : [];
          if (myInternships.length === 0) {
            const uniqueFacultyEmails = [...new Set((REAL_INTERNSHIPS as any[]).map(i => i.facultyId))];
            const fallbackFacultyEmail = uniqueFacultyEmails[0] || 'dr.sharma@manipal.edu';
            myInternships = (REAL_INTERNSHIPS as any[]).filter((i) => String(i.facultyId || '').toLowerCase() === fallbackFacultyEmail.toLowerCase());
            if (myInternships.length === 0) myInternships = REAL_INTERNSHIPS.slice(0, 3) as any[];
          }
        }

        let myApplications = (applicationsRes.data || []).filter((a: any) =>
          String(a.facultyEmail || '').trim().toLowerCase() === cleanEmail
        );
        if (myApplications.length === 0) {
          const facultyInternshipIds = new Set(myInternships.map((i: any) => i.id));
          myApplications = (SAMPLE_APPLICATIONS as any[]).filter((a) => facultyInternshipIds.has(Number(a.internshipId)));
          if (myApplications.length === 0) {
            myApplications = [
              {
                id: 201, internshipId: myInternships[0]?.id || 1,
                internshipTitle: myInternships[0]?.title || 'Full-Stack Web Development Intern',
                studentEmail: 'aditya.kulkarni@learner.manipal.edu',
                facultyEmail: myInternships[0]?.facultyId || email || 'dr.sharma@manipal.edu',
                status: 'SHORTLISTED',
                appliedAt: '2026-09-05T10:20:00',
                studentName: 'Aditya Kulkarni',
                studentCgpa: 8.9,
                studentSkills: 'React, TypeScript, Node.js, SQL',
              },
              {
                id: 202, internshipId: myInternships[0]?.id || 1,
                internshipTitle: myInternships[0]?.title || 'Full-Stack Web Development Intern',
                studentEmail: 'sneha.rao@learner.manipal.edu',
                facultyEmail: myInternships[0]?.facultyId || email || 'dr.sharma@manipal.edu',
                status: 'UNDER_REVIEW',
                appliedAt: '2026-09-06T14:05:00',
                studentName: 'Sneha Rao',
                studentCgpa: 8.2,
                studentSkills: 'React, JavaScript, CSS, Python',
              },
              {
                id: 203, internshipId: myInternships[1]?.id || 2,
                internshipTitle: myInternships[1]?.title || 'Machine Learning Research Intern',
                studentEmail: 'rohan.menon@learner.manipal.edu',
                facultyEmail: myInternships[1]?.facultyId || email || 'dr.rao@manipal.edu',
                status: 'INTERVIEW',
                appliedAt: '2026-09-03T09:15:00',
                studentName: 'Rohan Menon',
                studentCgpa: 9.1,
                studentSkills: 'Python, PyTorch, TensorFlow, NLP',
              },
              {
                id: 204, internshipId: myInternships[0]?.id || 1,
                internshipTitle: myInternships[0]?.title || 'Full-Stack Web Development Intern',
                studentEmail: 'priya.shetty@learner.manipal.edu',
                facultyEmail: myInternships[0]?.facultyId || email || 'dr.sharma@manipal.edu',
                status: 'SELECTED',
                appliedAt: '2026-08-30T11:45:00',
                studentName: 'Priya Shetty',
                studentCgpa: 8.7,
                studentSkills: 'React, Spring Boot, PostgreSQL, Docker',
              },
            ];
          }
        }

        let myMeetings = (meetingsRes.data || []).filter((m: any) =>
          String(m.hostEmail || '').trim().toLowerCase() === cleanEmail
        );

        setInternships(myInternships);
        setApplications(myApplications);
        setMeetings(myMeetings);

        const matches = matchesRes.data || [];
        const map: Record<string, any> = {};
        matches.forEach((m: any) => {
          if (m.student?.email && m.internship?.id) {
            map[`${m.student.email}_${m.internship.id}`] = m;
          }
        });
        if (Object.keys(map).length === 0) {
          myApplications.forEach((app: any) => {
            const key = `${app.studentEmail}_${app.internshipId}`;
            map[key] = {
              matchPercentage: 75 + Math.floor(Math.random() * 20),
              matchedSkills: (app.studentSkills || 'React, TypeScript').split(',').slice(0, 3),
            };
          });
        }
        setMatchMap(map);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        const fallbackFacultyEmail = 'dr.sharma@manipal.edu';
        setInternships((REAL_INTERNSHIPS as any[]).filter((i) => i.facultyId.toLowerCase() === fallbackFacultyEmail));
        setApplications(SAMPLE_APPLICATIONS.slice(0, 3) as any[]);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    try {
      const isCurrentlyOpen = String(currentStatus || 'OPEN').toUpperCase() === 'OPEN';
      const newStatus = isCurrentlyOpen ? 'CLOSED' : 'OPEN';
      await api.put(`/internships/${id}/status?status=${newStatus}`);
      setInternships((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus, isOpen: !isCurrentlyOpen } : i))
      );
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDeleteInternship = async (id: number) => {
    try {
      await api.delete(`/internships/${id}`).catch(() => null);
      setInternships((prev) => prev.filter((i) => i.id !== id));
      setDeletingInternship(null);
    } catch (error) {
      alert('Failed to delete internship');
    }
  };

  const checkIsActive = (i: any) => {
    const isOpen = String(i.status || 'OPEN').toUpperCase() === 'OPEN' && i.isOpen !== false;
    if (!isOpen) return false;
    if (i.applicationDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(i.applicationDeadline);
      if (typeof i.applicationDeadline === 'string' && i.applicationDeadline.includes('-')) {
        const parts = i.applicationDeadline.split('T')[0].split('-');
        if (parts.length === 3) {
          deadlineDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          deadlineDate.setHours(23, 59, 59, 999);
        }
      }
      if (deadlineDate < today) return false;
    }
    return true;
  };

  const activeInternships = internships.filter(checkIsActive);
  const closedInternships = internships.filter((i) => !checkIsActive(i));

  const displayInternships = (
    internshipFilter === 'ACTIVE'
      ? activeInternships
      : internshipFilter === 'CLOSED'
      ? closedInternships
      : internships
  ).filter(
    (i) =>
      (i.title || '').toLowerCase().includes(internshipSearch.toLowerCase()) ||
      (i.mode || '').toLowerCase().includes(internshipSearch.toLowerCase()) ||
      (i.department || '').toLowerCase().includes(internshipSearch.toLowerCase())
  );

  const getApplicantCount = (internshipId: number) => {
    return applications.filter((a) => String(a.internshipId) === String(internshipId)).length;
  };

  return (
    <div className="space-y-4 font-sans pb-8 w-full">
      {/* Page Header (Clean & Compact) */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10/80 shadow-2xs">
        <h1 className="text-lg font-black text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs text-slate-300 font-medium mt-0.5">
          Manage internship postings, view student applications, and monitor schedules.
        </p>
      </div>

      {/* Compact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-white/10/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Internships</span>
            <div className="text-xl font-black text-white mt-0.5">{internships.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold shrink-0">
            <Briefcase size={18} />
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-white/10/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Roles</span>
            <div className="text-xl font-black text-purple-400 mt-0.5">{activeInternships.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-950/40 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-white/10/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Applicants</span>
            <div className="text-xl font-black text-blue-600 mt-0.5">{applications.length}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-950/40 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Users size={18} />
          </div>
        </div>

        <Link
          to="/faculty/schedules"
          className="bg-slate-900/80 rounded-2xl p-3.5 border border-white/10/80 shadow-2xs flex items-center justify-between hover:border-purple-300 transition group cursor-pointer"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Meetings</span>
            <div className="text-xl font-black text-purple-600 mt-0.5">
              {meetings.filter((m) => m.status === 'SCHEDULED').length}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition">
            <Calendar size={18} />
          </div>
        </Link>
      </div>

      {/* Posted Internships & Roles */}
      <div className="bg-slate-900/80 rounded-2xl border border-white/10/80 shadow-2xs overflow-hidden">
        {/* Compact Header & Controls Bar */}
        <div className="p-3.5 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/80/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-white">Posted Internships</h2>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[11px] font-extrabold rounded-full">
              {displayInternships.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search..."
                value={internshipSearch}
                onChange={(e) => setInternshipSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-900/80 text-xs font-medium text-white rounded-xl border border-white/10 focus:border-purple-400 outline-none transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-purple-950/70 p-0.5 rounded-xl border border-purple-400/20 text-xs">
              <button
                onClick={() => setInternshipFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  internshipFilter === 'ALL' ? 'bg-purple-900 text-white shadow-2xs' : 'text-slate-300'
                }`}
              >
                All ({internships.length})
              </button>
              <button
                onClick={() => setInternshipFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  internshipFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active ({activeInternships.length})
              </button>
              <button
                onClick={() => setInternshipFilter('CLOSED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  internshipFilter === 'CLOSED' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-300'
                }`}
              >
                Closed ({closedInternships.length})
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-purple-950/70 p-0.5 rounded-xl border border-purple-400/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-purple-900 text-purple-300 shadow-2xs' : 'text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-purple-900 text-purple-300 shadow-2xs' : 'text-slate-300'
                }`}
                title="Table View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {loading ? (
            <div className="p-8 text-center text-slate-300 text-xs font-medium flex items-center justify-center gap-2">
              <Clock size={16} className="animate-spin text-purple-300" /> Loading postings…
            </div>
          ) : displayInternships.length === 0 ? (
            <div className="p-8 text-center max-w-sm mx-auto">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Briefcase size={20} />
              </div>
              <h3 className="text-xs font-extrabold text-white">
                {internshipFilter === 'ACTIVE'
                  ? 'No Active Roles Open'
                  : internshipFilter === 'CLOSED'
                  ? 'No Closed Roles Found'
                  : 'No Postings Available'}
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 mb-3">
                {internshipFilter === 'ACTIVE'
                  ? 'You currently have no open active internship postings.'
                  : 'Post a new internship role to start receiving student applications.'}
              </p>
              <Link
                to="/faculty/post-internship"
                className="px-3 py-1.5 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/30 transition inline-flex items-center gap-1"
              >
                <PlusCircle size={13} /> Post New Role
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5 p-5 bg-slate-950/80/40">
              {displayInternships.map((internship) => {
                const isOpen = checkIsActive(internship);
                const applicantCount = getApplicantCount(internship.id);

                return (
                  <div
                    key={internship.id}
                    className="bg-slate-900/80 rounded-3xl border border-white/10/80 p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between min-h-[350px] space-y-4 group relative overflow-hidden"
                  >
                    {/* Top Accent Gradient Bar on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-4">
                      {/* Avatar & Status Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center uppercase shrink-0 shadow-md shadow-indigo-200 ring-2 ring-indigo-50 group-hover:scale-105 transition-transform duration-300">
                          {internship.title?.charAt(0) || 'R'}
                        </div>

                        {isOpen ? (
                          <span className="px-3 py-1 bg-purple-950/40 text-emerald-700 font-extrabold rounded-full text-[11px] border border-emerald-200/80 shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-purple-950/400 animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-50 text-rose-700 font-extrabold rounded-full text-[11px] border border-rose-200/80 shrink-0 inline-flex items-center gap-1.5 shadow-2xs">
                            <XCircle size={12} /> Closed
                          </span>
                        )}
                      </div>

                      {/* Role Title & Department */}
                      <div>
                        <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {internship.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-bold mt-1 flex items-center gap-1">
                          <Briefcase size={12} className="text-slate-300" />
                          {internship.department || 'Computer Science'}
                        </p>
                      </div>

                      {/* Tag Chips Row */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                        <span className="px-2.5 py-1 bg-slate-900/90 text-slate-200 font-extrabold rounded-lg uppercase text-[10px]">
                          {internship.mode || 'ON_SITE'}
                        </span>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-lg text-[10px]">
                          {applicantCount} Applicants
                        </span>
                        {internship.stipend && (
                          <span className="px-2.5 py-1 bg-amber-950/40 text-amber-700 font-extrabold rounded-lg text-[10px] truncate max-w-[120px]">
                            {internship.stipend.includes('₹') ? internship.stipend : `₹${internship.stipend}`}
                          </span>
                        )}
                        {internship.applicationDeadline && (
                          <span className="px-2.5 py-1 bg-slate-950/80 border border-white/10 text-slate-300 font-semibold rounded-lg text-[10px] flex items-center gap-1">
                            <Clock size={10} /> {new Date(internship.applicationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="pt-3.5 border-t border-white/10 flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setEditingInternship(internship)}
                        className="flex-1 px-2.5 py-2 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-400/30 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 inline-flex items-center justify-center gap-1"
                        title="Edit Internship Details"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleStatusToggle(internship.id, internship.status)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                          isOpen
                            ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={isOpen ? 'Close Role' : 'Reopen Role'}
                      >
                        {isOpen ? 'Close' : 'Reopen'}
                      </button>
                      <button
                        onClick={() => setDeletingInternship(internship)}
                        className="px-2 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 inline-flex items-center gap-1"
                        title="Delete Internship"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80/80 border-b border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-wider">
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-3">Mode</th>
                    <th className="py-3 px-3">Applicants</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayInternships.map((internship) => {
                    const isOpen = checkIsActive(internship);
                    const applicantCount = getApplicantCount(internship.id);

                    return (
                      <tr key={internship.id} className="hover:bg-slate-950/80/60 transition">
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#ea580c] font-bold text-xs flex items-center justify-center uppercase shrink-0">
                              {internship.title?.charAt(0) || 'R'}
                            </div>
                            <div>
                              <div className="font-extrabold text-white text-xs">{internship.title}</div>
                              <div className="text-[10px] text-slate-300 font-medium">
                                {internship.department || 'Computer Science'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-900/90 text-slate-200 font-bold rounded-md text-[10px] uppercase">
                            {internship.mode || 'ON_SITE'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                            <Users size={10} /> {applicantCount}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-300 text-[11px]">
                          {internship.applicationDeadline
                            ? new Date(internship.applicationDeadline).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Flexible'}
                        </td>

                        <td className="py-3 px-3">
                          {isOpen ? (
                            <span className="px-2 py-0.5 bg-purple-950/40 text-emerald-700 font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-950/400 animate-pulse" /> Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                              <Lock size={10} /> Closed
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingInternship(internship)}
                              className="px-2 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-400/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              title="Edit Details"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(internship.id, internship.status)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                isOpen
                                  ? 'bg-amber-950/50 hover:bg-amber-900 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30'
                              }`}
                              title={isOpen ? 'Close Role' : 'Reopen Role'}
                            >
                              {isOpen ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>
                            <button
                              onClick={() => setDeletingInternship(internship)}
                              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              title="Delete Role"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
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

      {/* Edit Internship Modal */}
      <EditInternshipModal
        isOpen={!!editingInternship}
        onClose={() => setEditingInternship(null)}
        internship={editingInternship}
        onSaveSuccess={(updated) => {
          setInternships((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#12082b] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Internship?</h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Are you sure you want to delete <span className="text-white font-bold">{deletingInternship.title}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingInternship(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInternship(deletingInternship.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyOverview;
