import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  FolderKanban, 
  TrendingUp, 
  PieChart as PieChartIcon
} from 'lucide-react';

interface DepartmentData {
  name: string;
  facultyCount: number;
  internshipCount: number;
  applicationCount: number;
}

interface ApplicationData {
  status?: string;
  appliedAt?: string;
  studentEmail?: string;
  internshipTitle?: string;
  facultyEmail?: string;
}

interface InternshipData {
  id?: string;
  title?: string;
  mode?: string;
  internshipType?: string;
  stipend?: string;
  status?: string;
  facultyId?: string;
}

interface FacultyData {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
  role?: string;
}

// 1. DEPARTMENT COMPARISON GRAPH (Bar / Grouped)
export const DepartmentComparisonChart: React.FC<{ departments: DepartmentData[] }> = ({ departments }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!departments || departments.length === 0) {
    return (
      <div className="card text-center py-10 text-slate-400 font-bold text-sm">
        No department data available for chart visualization.
      </div>
    );
  }

  const maxVal = Math.max(
    1,
    ...departments.flatMap(d => [d.facultyCount, d.internshipCount, d.applicationCount])
  );

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Department Breakdown & Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Faculty, Openings & Applicants across all departments</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-indigo-500 inline-block" /> Faculty</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-purple-500 inline-block" /> Internships</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Applications</div>
        </div>
      </div>

      <div className="space-y-5 pt-2">
        {departments.map((dept, idx) => {
          const isHovered = hoveredIdx === idx;
          const facPct = (dept.facultyCount / maxVal) * 100;
          const intPct = (dept.internshipCount / maxVal) * 100;
          const appPct = (dept.applicationCount / maxVal) * 100;

          return (
            <div 
              key={dept.name} 
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-3.5 rounded-2xl border transition-all ${
                isHovered ? 'bg-purple-950/40 border-purple-800/80 shadow-lg' : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-200 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {dept.name}
                </span>
                <div className="flex items-center gap-3 text-[11px] font-black">
                  <span className="text-indigo-400">{dept.facultyCount} Faculty</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-400">{dept.internshipCount} Roles</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">{dept.applicationCount} Applicants</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {/* Faculty Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 w-16">Faculty</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(4, facPct)}%` }}
                    />
                  </div>
                </div>

                {/* Internships Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 w-16">Positions</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(4, intPct)}%` }}
                    />
                  </div>
                </div>

                {/* Applications Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 w-16">Applied</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(4, appPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. APPLICATION PIPELINE DONUT GRAPH
export const ApplicationPipelineDonutChart: React.FC<{ applications: ApplicationData[] }> = ({ applications }) => {
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  const total = applications.length;
  
  const statusCounts = {
    APPLIED: applications.filter(a => (a.status || 'APPLIED') === 'APPLIED').length,
    SHORTLISTED: applications.filter(a => a.status === 'SHORTLISTED').length,
    INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
    SELECTED: applications.filter(a => a.status === 'SELECTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  const statusConfig: Record<string, { label: string; color: string; hex: string }> = {
    APPLIED: { label: 'Applied', color: 'bg-sky-500 text-sky-300', hex: '#38bdf8' },
    SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500 text-purple-300', hex: '#c084fc' },
    INTERVIEW: { label: 'Interview', color: 'bg-amber-500 text-amber-300', hex: '#fbbf24' },
    SELECTED: { label: 'Selected', color: 'bg-emerald-500 text-emerald-300', hex: '#34d399' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-500 text-rose-300', hex: '#f87171' }
  };

  // SVG Donut slice calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices = Object.entries(statusCounts).map(([status, count]) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (percentage / 100) * circumference;
    return {
      status,
      count,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
      config: statusConfig[status]
    };
  });

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-400" />
            Application Funnel & Status Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time candidate conversion & hiring status distribution</p>
        </div>
        <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-black rounded-full">
          Total: {total} Applications
        </span>
      </div>

      {total === 0 ? (
        <div className="text-center py-12 text-slate-400 font-bold text-sm">
          No applications recorded yet to calculate status graph.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center py-4">
            <svg width="220" height="220" viewBox="0 0 200 200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="24"
              />
              {slices.map(slice => (
                <circle
                  key={slice.status}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={slice.config.hex}
                  strokeWidth={activeSlice === slice.status ? '30' : '24'}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveSlice(slice.status)}
                  onMouseLeave={() => setActiveSlice(null)}
                />
              ))}
            </svg>

            {/* Inner Donut Text */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              {activeSlice ? (
                <>
                  <span className="text-2xl font-black text-white">
                    {statusCounts[activeSlice as keyof typeof statusCounts]}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {statusConfig[activeSlice]?.label}
                  </span>
                  <span className="text-xs font-bold text-purple-400 mt-0.5">
                    {total > 0 ? Math.round((statusCounts[activeSlice as keyof typeof statusCounts] / total) * 100) : 0}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black text-white">{total}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applications</span>
                </>
              )}
            </div>
          </div>

          {/* Breakdown Legend Cards */}
          <div className="space-y-2.5">
            {slices.map(slice => (
              <div
                key={slice.status}
                onMouseEnter={() => setActiveSlice(slice.status)}
                onMouseLeave={() => setActiveSlice(null)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  activeSlice === slice.status
                    ? 'bg-purple-950/50 border-purple-800/80 shadow-md translate-x-1'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-3.5 h-3.5 rounded-lg shrink-0" 
                    style={{ backgroundColor: slice.config.hex }} 
                  />
                  <div>
                    <p className="text-xs font-black text-slate-200">{slice.config.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{slice.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">{slice.count}</span>
                  <span className="text-[10px] font-bold text-slate-400 block">candidates</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 3. FACULTY PERFORMANCE & POSTING CHART
export const FacultyPerformanceChart: React.FC<{
  faculties: FacultyData[];
  internships: InternshipData[];
  applications: ApplicationData[];
}> = ({ faculties, internships, applications }) => {
  const facultyStats = faculties.map(f => {
    const email = f.email;
    const name = `${f.firstName || ''} ${f.lastName || ''}`.trim() || email.split('@')[0];
    const facInternships = internships.filter(i => i.facultyId === email);
    const facApplications = applications.filter(a => a.facultyEmail === email);
    const hiredCount = facApplications.filter(a => a.status === 'SELECTED').length;

    return {
      email,
      name,
      department: f.department || 'General',
      designation: f.designation || 'Faculty',
      internshipsCount: facInternships.length,
      applicationsCount: facApplications.length,
      hiredCount
    };
  }).sort((a, b) => b.applicationsCount - a.applicationsCount).slice(0, 7);

  const maxVal = Math.max(1, ...facultyStats.map(f => f.applicationsCount));

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Faculty Engagement & Performance Graph
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Top faculty members ranked by internships posted & candidates received</p>
        </div>
        <span className="px-3 py-1 bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-black rounded-full">
          Top {facultyStats.length} Faculties
        </span>
      </div>

      {facultyStats.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-bold text-sm">
          No faculty data available.
        </div>
      ) : (
        <div className="space-y-4">
          {facultyStats.map((f, i) => {
            const appPct = (f.applicationsCount / maxVal) * 100;
            return (
              <div key={f.email} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-800/80 transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-300 flex items-center justify-center font-black text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-100">{f.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{f.designation} • {f.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="px-2 py-0.5 bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-black rounded-lg">
                      {f.internshipsCount} Roles
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-black rounded-lg">
                      {f.hiredCount} Hired
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, appPct)}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-300 whitespace-nowrap min-w-[70px] text-right">
                    {f.applicationsCount} Applicants
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 4. INTERNSHIP MODES & STIPEND DISTRIBUTION
export const InternshipDistributionChart: React.FC<{ internships: InternshipData[] }> = ({ internships }) => {
  const total = internships.length;

  const modes = {
    Remote: internships.filter(i => (i.mode || i.internshipType || '').toUpperCase().includes('REMOTE')).length,
    'On-Site': internships.filter(i => (i.mode || i.internshipType || '').toUpperCase().includes('SITE') || (i.mode || i.internshipType || '').toUpperCase().includes('OFFICE')).length,
    Hybrid: internships.filter(i => (i.mode || i.internshipType || '').toUpperCase().includes('HYBRID')).length,
    Other: internships.filter(i => {
      const m = (i.mode || i.internshipType || '').toUpperCase();
      return !m.includes('REMOTE') && !m.includes('SITE') && !m.includes('OFFICE') && !m.includes('HYBRID');
    }).length
  };

  const stipendStatus = {
    Paid: internships.filter(i => i.stipend && !i.stipend.toLowerCase().includes('unpaid') && i.stipend !== '0' && i.stipend !== 'N/A').length,
    Unpaid: internships.filter(i => !i.stipend || i.stipend.toLowerCase().includes('unpaid') || i.stipend === '0').length
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            Internship Work Mode & Compensation Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Workplace setup distribution & stipend models</p>
        </div>
        <span className="px-3 py-1 bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-black rounded-full">
          {total} Active Internships
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Mode Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Workplace Format</p>
          {Object.entries(modes).map(([mode, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={mode} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>{mode}</span>
                  <span className="text-purple-400 font-black">{count} ({pct}%)</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stipend Model Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Compensation Structure</p>
          {Object.entries(stipendStatus).map(([stipendType, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const color = stipendType === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500';
            return (
              <div key={stipendType} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>{stipendType} Internship</span>
                  <span className={`${stipendType === 'Paid' ? 'text-emerald-400' : 'text-amber-400'} font-black`}>
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${color} rounded-full transition-all duration-500`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 5. ACTIVITY TREND TIMELINE GRAPH
export const ActivityTrendChart: React.FC<{ applications: ApplicationData[] }> = ({ applications }) => {
  // Group applications by date/month
  const dateMap = new Map<string, number>();

  applications.forEach(a => {
    if (!a.appliedAt) return;
    const dateStr = new Date(a.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  });

  const timelineData = Array.from(dateMap.entries()).slice(-10);
  const maxCount = Math.max(1, ...timelineData.map(t => t[1]));

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Application Submission Activity Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Timeline of incoming student application traffic</p>
        </div>
        <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-black rounded-full">
          Recent Activity
        </span>
      </div>

      {timelineData.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-bold text-sm">
          No timestamped activity recorded yet.
        </div>
      ) : (
        <div className="pt-4">
          <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-800 pb-2 px-2">
            {timelineData.map(([date, count]) => {
              const heightPct = (count / maxCount) * 100;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-black text-purple-400 opacity-0 group-hover:opacity-100 transition">
                    {count}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-32">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300"
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[48px] text-center">
                    {date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// 6. PER-PROJECT STATUS PIE CHART (For Faculty Project Cards & Reports)
export const ProjectStatusPieChart: React.FC<{ applications: ApplicationData[]; projectTitle?: string }> = ({ applications, projectTitle }) => {
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  const total = applications.length;

  const statusCounts = {
    APPLIED: applications.filter(a => (a.status || 'APPLIED') === 'APPLIED').length,
    SHORTLISTED: applications.filter(a => a.status === 'SHORTLISTED').length,
    INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
    SELECTED: applications.filter(a => a.status === 'SELECTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  const statusConfig: Record<string, { label: string; color: string; hex: string }> = {
    APPLIED: { label: 'Applied', color: 'bg-sky-500 text-sky-300', hex: '#38bdf8' },
    SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500 text-purple-300', hex: '#c084fc' },
    INTERVIEW: { label: 'Interview', color: 'bg-amber-500 text-amber-300', hex: '#fbbf24' },
    SELECTED: { label: 'Selected', color: 'bg-emerald-500 text-emerald-300', hex: '#34d399' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-500 text-rose-300', hex: '#f87171' }
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices = Object.entries(statusCounts).map(([status, count]) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (percentage / 100) * circumference;
    return {
      status,
      count,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
      config: statusConfig[status]
    };
  });

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-100 flex items-center gap-1.5">
          <PieChartIcon className="w-3.5 h-3.5 text-purple-400" />
          {projectTitle ? `Pie Chart: ${projectTitle}` : 'Project Applicant Distribution'}
        </span>
        <span className="text-[10px] font-black bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2 py-0.5 rounded-md">
          {total} Student{total !== 1 ? 's' : ''}
        </span>
      </div>

      {total === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400 font-bold bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
          No applicants yet for pie chart
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#1e293b" strokeWidth="16" />
              {slices.map(slice => (
                <circle
                  key={slice.status}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={slice.config.hex}
                  strokeWidth={activeSlice === slice.status ? '20' : '16'}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveSlice(slice.status)}
                  onMouseLeave={() => setActiveSlice(null)}
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg font-black text-white">{total}</span>
              <span className="text-[8px] font-black uppercase text-slate-400">Students</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-1">
            {slices.map(slice => (
              <div 
                key={slice.status}
                onMouseEnter={() => setActiveSlice(slice.status)}
                onMouseLeave={() => setActiveSlice(null)}
                className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  activeSlice === slice.status ? 'bg-purple-950/80 border border-purple-800/60 text-purple-200 font-black' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.config.hex }} />
                  <span>{slice.config.label}</span>
                </div>
                <span>{slice.count} ({slice.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
