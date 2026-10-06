import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Award,
  CheckCircle2,
  Briefcase,
  ChevronDown,
  Code2,
  Calendar,
  Terminal,
  Cpu,
  Database,
  Palette,
  ShieldCheck,
  Smartphone,
  Brain,
  Cloud,
  Server,
  Zap,
  Search,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Spinner, EmptyState } from './ui';
import { toTitleCase } from '../../utils/matchHelpers';

export const getSkillIcon = (skill: string) => {
  const s = skill.toLowerCase().trim();
  if (s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('frontend') || s.includes('js') || s.includes('javascript') || s.includes('typescript')) {
    return <Code2 size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('python') || s.includes('backend') || s.includes('java') || s.includes('c++') || s.includes('go') || s.includes('rust')) {
    return <Terminal size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('node') || s.includes('express') || s.includes('api') || s.includes('server')) {
    return <Server size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('sql') || s.includes('mongo') || s.includes('postgres') || s.includes('database') || s.includes('db')) {
    return <Database size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('design') || s.includes('figma') || s.includes('ui') || s.includes('ux') || s.includes('adobe') || s.includes('css') || s.includes('tailwind')) {
    return <Palette size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('ai') || s.includes('ml') || s.includes('machine learning') || s.includes('data science') || s.includes('analytics')) {
    return <Brain size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('security') || s.includes('cyber') || s.includes('auth')) {
    return <ShieldCheck size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('cloud') || s.includes('aws') || s.includes('docker') || s.includes('kubernetes') || s.includes('devops')) {
    return <Cloud size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('mobile') || s.includes('android') || s.includes('flutter') || s.includes('ios') || s.includes('react native')) {
    return <Smartphone size={12} className="text-cyan-400 shrink-0" />;
  }
  if (s.includes('hardware') || s.includes('embedded') || s.includes('iot') || s.includes('electronics')) {
    return <Cpu size={12} className="text-cyan-400 shrink-0" />;
  }
  return <Zap size={12} className="text-cyan-400 shrink-0" />;
};

export const getInternshipHeaderIcon = (title: string, category?: string) => {
  const t = (title + ' ' + (category || '')).toLowerCase();
  if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('creative')) {
    return <Palette size={18} />;
  }
  if (t.includes('ai') || t.includes('ml') || t.includes('learning') || t.includes('data science') || t.includes('intelligence')) {
    return <Brain size={18} />;
  }
  if (t.includes('security') || t.includes('cyber') || t.includes('defense') || t.includes('crypto')) {
    return <ShieldCheck size={18} />;
  }
  if (t.includes('mobile') || t.includes('android') || t.includes('app') || t.includes('ios') || t.includes('flutter')) {
    return <Smartphone size={18} />;
  }
  if (t.includes('cloud') || t.includes('devops') || t.includes('backend') || t.includes('server') || t.includes('api')) {
    return <Server size={18} />;
  }
  if (t.includes('hardware') || t.includes('embedded') || t.includes('iot') || t.includes('vlsi')) {
    return <Cpu size={18} />;
  }
  if (t.includes('data') || t.includes('analyst') || t.includes('database') || t.includes('sql')) {
    return <Database size={18} />;
  }
  if (t.includes('web') || t.includes('fullstack') || t.includes('full stack') || t.includes('frontend') || t.includes('software') || t.includes('developer')) {
    return <Code2 size={18} />;
  }
  return <Briefcase size={18} />;
};

interface BrowseInternshipsProps {
  internships: any[];
  loading: boolean;
  handleApply: (internship: any) => void;
  applying: number | null;
  applications: any[];
  onSelectInternship: (internship: any) => void;
}

export const BrowseInternships: React.FC<BrowseInternshipsProps> = ({
  internships,
  loading,
  handleApply,
  applying,
  applications,
  onSelectInternship,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState({
    role: '',
    workMode: '',
    duration: '',
  });

  const getSkillTags = (internship: any): string[] => {
    if (Array.isArray(internship.requiredSkills) && internship.requiredSkills.length > 0) {
      return internship.requiredSkills;
    }
    if (typeof internship.requiredSkills === 'string' && internship.requiredSkills.trim()) {
      return internship.requiredSkills.split(',').map((s: string) => s.trim());
    }
    let raw = internship.skillsRequired || internship.skills || '';
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return ['React', 'TypeScript', 'Tailwind'];
  };

  const filtered = internships.filter((i: any) => {
    const q = searchTerm.toLowerCase();
    const skillsText = getSkillTags(i).join(' ').toLowerCase();
    const titleMatch = (i.title || '').toLowerCase().includes(q);
    const deptMatch = (i.department || '').toLowerCase().includes(q);
    const companyMatch = (i.facultyId || '').toLowerCase().includes(q);
    const matchesSearch = !searchTerm || titleMatch || deptMatch || companyMatch || skillsText.includes(q);
    const roleMatch = !filters.role || (i.title || '').toLowerCase().includes(filters.role.toLowerCase()) || (i.department || '').toLowerCase().includes(filters.role.toLowerCase());
    const modeMatch = !filters.workMode || (i.mode || '').toLowerCase().includes(filters.workMode.toLowerCase());
    return matchesSearch && roleMatch && modeMatch;
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5 pb-12 w-full font-sans text-slate-100">
      {/* Sleek & Compact Search and Filters Bar (Faculty Portal Color Palette) */}
      <div className="bg-[#09122a]/90 rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-800/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Compact Search Input */}
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
            <input
              type="text"
              placeholder="Search roles, skills, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#050c1e]/90 border border-slate-700/60 text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition shadow-inner"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Compact Department / Role Filter Dropdown */}
          <div className="relative w-full sm:w-44">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full pl-3 pr-7 py-2 rounded-xl bg-[#050c1e]/90 border border-slate-700/60 text-white text-xs font-semibold focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition appearance-none cursor-pointer shadow-inner"
            >
              <option value="" className="bg-[#09122a] text-white font-medium">All Departments</option>
              <option value="Computer Science" className="bg-[#09122a] text-white font-medium">Computer Science</option>
              <option value="Civil" className="bg-[#09122a] text-white font-medium">Civil Engineering</option>
              <option value="Mechanical" className="bg-[#09122a] text-white font-medium">Mechanical Engineering</option>
              <option value="Electronics" className="bg-[#09122a] text-white font-medium">Electronics / Embedded</option>
              <option value="AI" className="bg-[#09122a] text-white font-medium">AI & Machine Learning</option>
              <option value="Full-Stack" className="bg-[#09122a] text-white font-medium">Full-Stack & Web</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
          </div>

          {/* Compact Work Mode Filter Dropdown */}
          <div className="relative w-full sm:w-36">
            <select
              value={filters.workMode}
              onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
              className="w-full pl-3 pr-7 py-2 rounded-xl bg-[#050c1e]/90 border border-slate-700/60 text-white text-xs font-semibold focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition appearance-none cursor-pointer shadow-inner"
            >
              <option value="" className="bg-[#09122a] text-white font-medium">All Work Modes</option>
              <option value="remote" className="bg-[#09122a] text-white font-medium">Remote</option>
              <option value="onsite" className="bg-[#09122a] text-white font-medium">On-site</option>
              <option value="hybrid" className="bg-[#09122a] text-white font-medium">Hybrid</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center bg-[#050c1e]/90 p-0.5 rounded-xl border border-slate-700/60 shrink-0 self-end sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1 cursor-pointer ${viewLayout === 'grid' ? 'bg-slate-700 text-white shadow-sm border border-slate-600' : 'text-slate-400 hover:text-white'}`}
              title="Grid View (Default)"
            >
              <LayoutGrid size={13} />
              <span className="text-[10px] hidden lg:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1 cursor-pointer ${viewLayout === 'list' ? 'bg-slate-700 text-white shadow-sm border border-slate-600' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List size={13} />
              <span className="text-[10px] hidden lg:inline">List</span>
            </button>
          </div>

          {(filters.role || filters.workMode || searchTerm) && (
            <button
              className="text-sky-400 hover:text-sky-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition shrink-0 pl-1"
              onClick={() => { setSearchTerm(''); setFilters({ role: '', workMode: '', duration: '' }); }}
            >
              <SlidersHorizontal size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Internship Openings Content */}
      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No internships match your filters" sub="Try adjusting your search or filters to explore more openings." />
      ) : viewLayout === 'grid' ? (
        /* GRID VIEW (Default) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((i: any) => {
            const isApplied = applications.some((a: any) => a.internshipId === i.id);
            const isClosed = (() => {
              if (i.status === 'CLOSED') return true;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (i.applicationDeadline && new Date(i.applicationDeadline) < today) return true;
              if (i.startDate && new Date(i.startDate) <= today) return true;
              return false;
            })();

            return (
              <div
                key={i.id}
                className="group bg-[#09122a]/88 rounded-3xl border border-slate-800/80 p-5 shadow-xl hover:border-slate-600 hover:shadow-2xl hover:bg-[#0d1a3a] backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden space-y-4 hover:-translate-y-1.5"
                onClick={() => onSelectInternship(i)}
              >
                {/* Accent Top Highlight Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 via-sky-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-3.5">
                  {/* Top Row: Icon/Company & Match % Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 text-sky-400 border border-slate-700 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        {i.title?.[0]?.toUpperCase() || 'I'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-white group-hover:text-sky-300 transition-colors tracking-tight leading-snug truncate">
                          {toTitleCase(i.title)}
                        </h3>
                        <p className="text-xs text-slate-300 font-bold truncate mt-0.5">
                          {i.facultyId ? i.facultyId.split('@')[0] + ' Inc.' : 'TechSolutions Inc.'}
                        </p>
                      </div>
                    </div>

                    {/* Faculty-only match scoring is intentionally hidden from students */}
                  </div>

                  {/* Metadata Chips: Duration, Stipend, Mode */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 font-bold flex items-center gap-1 shrink-0">
                      <Calendar size={11} className="text-slate-400" /> {i.duration || '6 mos'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black flex items-center gap-1 shrink-0">
                      <Award size={11} className="text-amber-400" /> {i.stipend ? (i.stipend.includes('₹') ? i.stipend : `₹${i.stipend}`) : '₹10,000 / mo'}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 font-bold flex items-center gap-1 shrink-0">
                      <Briefcase size={11} className="text-slate-400" /> {i.mode || 'Remote'}
                    </span>
                  </div>

                  {/* Required Skill Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {getSkillTags(i).slice(0, 4).map((t: string) => (
                      <span key={t} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-800/70 text-slate-200 border border-slate-700/60 inline-flex items-center gap-1">
                        {getSkillIcon(t)}
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Status & Action Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-auto">
                  {isApplied ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Applied
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-300 truncate max-w-[120px]">
                      {i.location || 'Remote'}
                    </span>
                  )}

                  <button
                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 ${
                      isApplied
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 cursor-default'
                        : isClosed
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                        : applying === i.id
                        ? 'bg-amber-500 text-white opacity-70 cursor-wait'
                        : 'bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white shadow-md'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isApplied) onSelectInternship(i);
                      else if (!isClosed) handleApply(i);
                    }}
                    disabled={isClosed || applying === i.id}
                  >
                    {isApplied ? 'View Details' : isClosed ? 'Closed' : applying === i.id ? 'Applying…' : 'Apply Here'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-5">
          {filtered.map((i: any) => {
            const isApplied = applications.some((a: any) => a.internshipId === i.id);
            const isClosed = (() => {
              if (i.status === 'CLOSED') return true;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (i.applicationDeadline && new Date(i.applicationDeadline) < today) return true;
              if (i.startDate && new Date(i.startDate) <= today) return true;
              return false;
            })();

            return (
              <div
                key={i.id}
                className="group bg-[#081330]/95 rounded-2xl border border-slate-700/80 border-l-4 border-l-sky-500/80 p-5 sm:p-5.5 shadow-xl hover:border-slate-500 hover:border-l-sky-400 hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)] hover:bg-[#0c1c44] backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden hover:-translate-y-0.5"
                onClick={() => onSelectInternship(i)}
              >
                {/* Subtle top hover glow bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-5 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/90 text-sky-400 border border-slate-700/80 font-black text-base flex items-center justify-center shrink-0 shadow-md">
                      {i.title?.[0]?.toUpperCase() || 'I'}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black text-white group-hover:text-sky-300 transition-colors tracking-tight leading-snug truncate">
                          {toTitleCase(i.title)}
                        </h2>
                        {isApplied && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                            <CheckCircle2 size={10} /> Applied
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-bold truncate">
                        {i.facultyId ? i.facultyId.split('@')[0] + ' Inc.' : 'TechSolutions Inc.'}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex items-center justify-start md:justify-center gap-2 flex-wrap text-xs font-semibold">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-200 font-bold flex items-center gap-1.5 shrink-0 shadow-xs hover:bg-slate-700 transition">
                      <Calendar size={13} className="text-sky-400" /> {i.duration || '6 months'}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Award size={13} className="text-amber-400" /> {i.stipend ? (i.stipend.includes('₹') ? i.stipend : `₹${i.stipend} / mo`) : '₹10,000 / mo'}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-200 font-bold flex items-center gap-1.5 shrink-0 shadow-xs hover:bg-slate-700 transition">
                      <Briefcase size={13} className="text-sky-400" /> {i.location || 'Udupi'} ({i.mode || 'Remote'})
                    </span>
                  </div>

                  <div className="md:col-span-2 flex justify-start md:justify-end">
                    {/* Faculty-only match scoring is intentionally hidden from students */}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap pt-3.5 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0 hidden sm:inline">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getSkillTags(i).map((t: string) => (
                        <span key={t} className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/70 inline-flex items-center gap-1.5 shadow-xs hover:bg-slate-700 transition transform hover:scale-[1.02]">
                          {getSkillIcon(t)}
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all duration-200 shadow-xs cursor-pointer shrink-0 ml-auto flex items-center gap-1.5 active:scale-95 ${
                      isApplied
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 cursor-default'
                        : isClosed
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                        : applying === i.id
                        ? 'bg-amber-500 text-white opacity-70 cursor-wait'
                        : 'bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white shadow-md'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isApplied) onSelectInternship(i);
                      else if (!isClosed) handleApply(i);
                    }}
                    disabled={isClosed || applying === i.id}
                  >
                    {isApplied ? 'View Details' : isClosed ? 'Closed' : applying === i.id ? 'Applying…' : 'Apply Here'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reference Footer */}
      <footer className="pt-8 pb-4 text-center space-y-3 border-t border-slate-700 mt-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg font-black text-white tracking-tight">InternSmart</span>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-slate-300 font-semibold flex-wrap">
          <a href="#" className="hover:text-white transition">Support</a>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Contact Us</a>
        </div>
        <div className="text-xs text-slate-300 font-medium">
          © {new Date().getFullYear()} InternSmart. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BrowseInternships;
