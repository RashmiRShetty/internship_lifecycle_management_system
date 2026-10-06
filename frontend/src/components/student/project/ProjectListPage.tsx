import React from 'react';
import { Target, Check, X, ChevronRight } from 'lucide-react';
import { SectionHead, EmptyState, Pill } from '../ui';

interface ProjectListPageProps {
  activeApps: any[];
  onSelectApp: (app: any) => void;
  onAcceptProject: (appId: number) => void;
  onRejectProject: (appId: number) => void;
}

export const isProjectActive = (item: any): boolean => {
  if (!item) return false;
  if (item.isCompleted === true || item.status === 'COMPLETED' || item.status === 'CLOSED') {
    return false;
  }
  const endDateStr = item.internshipEndDate || item.endDate || item.internship?.endDate;
  if (endDateStr) {
    const endDate = new Date(endDateStr);
    if (!isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
      if (new Date() > endDate) {
        return false;
      }
    }
  }
  return true;
};

export const ProjectListPage: React.FC<ProjectListPageProps> = ({
  activeApps,
  onSelectApp,
  onAcceptProject,
  onRejectProject,
}) => {
  const [filter, setFilter] = React.useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  const filteredApps = activeApps.filter((a) => {
    const active = isProjectActive(a);
    if (filter === 'ACTIVE') return active;
    if (filter === 'COMPLETED') return !active;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <SectionHead title="My projects" sub="Select a project to submit weekly reports." />
        <div className="bg-[#0a1e4e]/90 p-1.5 rounded-2xl flex gap-1 border border-sky-500/30 backdrop-blur-md shadow-lg">
          {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {filteredApps.length === 0 ? (
        <EmptyState icon={Target} title={`No ${filter.toLowerCase()} projects`} sub="You'll appear here once selected for an active internship." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredApps.map((a: any) => {
            const isAccepted = a.projectAccepted === true;
            const isRejected = a.projectRejected === true;
            const isPending = a.projectTitle && !isAccepted && !isRejected;
            const activeStatus = isProjectActive(a);
            const endDateVal = a.internshipEndDate || a.endDate || a.internship?.endDate;

            return (
              <div
                key={a.id}
                className="bg-[#0a1e4e]/85 border border-sky-500/30 hover:border-cyan-500/40 rounded-3xl p-5 shadow-lg shadow-blue-950/40 hover:shadow-cyan-500/10 transition duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md"
                onClick={() => onSelectApp(a)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wide">Project</span>
                    <div className="flex items-center gap-1.5">
                      {!activeStatus && (
                        <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                          Ended
                        </span>
                      )}
                      <Pill color={isAccepted ? 'green' : isRejected ? 'red' : isPending ? 'amber' : 'slate'}>
                        {isAccepted ? 'Accepted' : isRejected ? 'Rejected' : isPending ? 'Pending Acceptance' : 'Awaiting Title'}
                      </Pill>
                    </div>
                  </div>

                  <div className="text-base font-extrabold text-white mb-1">{a.internshipTitle}</div>
                  {a.projectTitle && (
                    <div className="text-xs text-slate-300 font-medium mb-1">
                      <strong className="text-cyan-400">Project: </strong>{a.projectTitle}
                    </div>
                  )}
                  <div className="text-xs text-slate-300 font-medium mb-1">
                    <strong className="text-cyan-400">Faculty: </strong>{a.facultyEmail}
                  </div>
                  {endDateVal && (
                    <div className="text-[11px] font-semibold text-slate-300 mt-3 flex items-center justify-between bg-[#06163d]/90 p-2.5 rounded-xl border border-sky-500/30">
                      <span>End Date: <strong className="text-white">{new Date(endDateVal).toLocaleDateString()}</strong></span>
                      <span className={`text-[10px] font-bold ${activeStatus ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {activeStatus ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-sky-500/25 flex items-center justify-between gap-2">
                  {isPending ? (
                    <div className="flex flex-col items-center justify-center w-full gap-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">Action</span>
                      <div className="flex items-center justify-center gap-3 w-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcceptProject(a.id);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white text-sm font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer min-w-[120px]"
                        >
                          <Check size={15} /> Accept
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectProject(a.id);
                          }}
                          className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer min-w-[120px]"
                        >
                          <X size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  ) : isRejected ? (
                    <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-rose-400 font-medium">Project Rejected</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptProject(a.id);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md shadow-cyan-500/20"
                      >
                        <Check size={13} /> Accept
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wide">Current active task</span>
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {a.assignedTask || a.assignedRole || 'Project work in progress'}
                        </span>
                      </div>
                      <ChevronRight size={15} className="text-cyan-400 flex-shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
