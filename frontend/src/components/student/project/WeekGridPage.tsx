import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Check,
  X,
  Target,
  Info,
  Briefcase,
  Award,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton, EmptyState, Pill } from '../ui';
import { downloadCertificatePDF, canStudentDownloadCertificate } from '../../../services/certificateService';

interface WeekGridPageProps {
  selectedApp: any;
  studentEmail?: string;
  onBackToProjects: () => void;
  onRequestMeeting?: () => void;
  onAcceptProject: (appId: number) => void;
  onRejectProject: (appId: number) => void;
  onSelectWeek: (weekNumber: number, reportContent?: string) => void;
  reports: any[];
  meetings?: any[];
  calcTotalWeeks: (app: any) => number;
  calcWeek: (startDate?: string) => number;
  weekRange: (startDate: string, week: number) => string;
  formatDateDisplay: (dateStr?: string) => string;
}

export const WeekGridPage: React.FC<WeekGridPageProps> = ({
  selectedApp,
  studentEmail: studentEmailProp,
  onBackToProjects,
  onRequestMeeting: _onRequestMeeting,
  onAcceptProject,
  onRejectProject,
  onSelectWeek,
  reports,
  meetings: _meetings,
  calcTotalWeeks,
  calcWeek,
  weekRange,
  formatDateDisplay,
}) => {
  const navigate = useNavigate();
  const [studentTaskFilter, setStudentTaskFilter] = React.useState<'ACTIVE' | 'COMPLETED' | 'PENDING' | 'ALL'>('ACTIVE');
  const [showProjectDetailsModal, setShowProjectDetailsModal] = React.useState(false);
  const totalWeeks = calcTotalWeeks(selectedApp);
  const rawCurrentWeek = calcWeek(selectedApp.internshipStartDate);
  const currentWeek = Math.min(rawCurrentWeek, totalWeeks);

  return (
    <div>
      {/* COMPACT TOP NAVIGATION BAR WITH PROJECT DETAILS & MEETING SCHEDULE BUTTONS */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap bg-slate-900/80 p-4 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <SecondaryButton onClick={onBackToProjects}>
            <ChevronLeft size={14} /> My projects
          </SecondaryButton>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight">{selectedApp.internshipTitle}</h1>
              {selectedApp.projectTitle && (
                <Pill color={selectedApp.projectAccepted ? 'green' : selectedApp.projectRejected ? 'red' : 'amber'}>
                  {selectedApp.projectAccepted ? 'Accepted' : selectedApp.projectRejected ? 'Rejected' : 'Pending acceptance'}
                </Pill>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Faculty: <span className="text-slate-300">{selectedApp.facultyEmail}</span></p>
          </div>
        </div>

        {/* ACTION BUTTONS AT TOP VISIBLE SIDE */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 📁 Project Details Button */}
          <button
            type="button"
            onClick={() => setShowProjectDetailsModal(true)}
            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Info size={15} className="text-cyan-400" /> Project Details
          </button>

          {/* 🏆 Download Certificate Button (Enabled only after faculty allowed) */}
          {(() => {
            const tok = sessionStorage.getItem('token') || localStorage.getItem('token');
            const dec: any = tok ? jwtDecode(tok) : null;
            const sEmail = dec?.sub || selectedApp.studentEmail || selectedApp.email || '';

            const { canDownload, cert, reason } = canStudentDownloadCertificate(sEmail, selectedApp.id, selectedApp);

            if (canDownload && cert) {
              return (
                <button
                  type="button"
                  onClick={() => downloadCertificatePDF(cert)}
                  className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Download Official MIT Internship Certificate (PDF)"
                >
                  <Award size={15} /> 🏆 Download Certificate (PDF)
                </button>
              );
            }

            return (
              <button
                type="button"
                disabled
                title={reason || 'Certificate will be enabled once internship is completed and authorized by faculty.'}
                className="px-4 py-2 bg-slate-950/80 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-75"
              >
                <Award size={15} /> 🔒 Download Certificate (Awaiting Faculty Approval)
              </button>
            );
          })()}

          {/* 📅 View Scheduled Meetings Button */}
          <button
            type="button"
            onClick={() => navigate('/student/meetings')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Calendar size={15} /> 📅 View Scheduled Meetings
          </button>
        </div>
      </div>

      {/* FACULTY-STYLE CENTERED POPUP MODAL OVERLAY */}
      {showProjectDetailsModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowProjectDetailsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-950/50 max-w-lg w-full p-6 flex flex-col gap-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white m-0">
                    {selectedApp.projectTitle || selectedApp.internshipTitle}
                  </h2>
                  <div className="text-xs text-slate-300 font-semibold mt-0.5">
                    Linked Internship: <strong className="text-cyan-400">{selectedApp.internshipTitle}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProjectDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {selectedApp.projectDescription ? (
              <div>
                <div className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider mb-1">
                  PROJECT DESCRIPTION
                </div>
                <p className="text-xs text-slate-300 m-0 leading-relaxed bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 font-medium">
                  {selectedApp.projectDescription}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-300 italic">
                No project description provided.
              </div>
            )}

            {(selectedApp.assignedRole || selectedApp.assignedTask) && (
              <div className="bg-blue-950/40 border border-cyan-500/30 rounded-xl p-3.5">
                <div className="text-[11px] font-black text-cyan-400 uppercase tracking-wider mb-1">
                  📌 ASSIGNED CANDIDATE ROLE &amp; RESPONSIBILITIES
                </div>
                <div className="text-xs font-black text-white">
                  Role: {selectedApp.assignedRole || 'Intern'}
                </div>
                {selectedApp.assignedTask && (
                  <div className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    Task: {selectedApp.assignedTask}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">Start Date</div>
                <div className="text-xs font-black text-white">{formatDateDisplay(selectedApp.internshipStartDate)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-300 uppercase mb-0.5">End Date</div>
                <div className="text-xs font-black text-white">{formatDateDisplay(selectedApp.internshipEndDate)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase mb-0.5">Duration</div>
                <div className="text-xs font-black text-cyan-400">{totalWeeks} {totalWeeks === 1 ? 'Week' : 'Weeks'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-700 pt-3 text-xs text-slate-300">
              <span>Faculty Supervisor:</span>
              <strong className="text-white">{selectedApp.facultyEmail}</strong>
            </div>

            {(!selectedApp.projectAccepted || selectedApp.projectRejected) && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                {!selectedApp.projectAccepted && (
                  <PrimaryButton
                    onClick={() => {
                      onAcceptProject(selectedApp.id);
                      setShowProjectDetailsModal(false);
                    }}
                  >
                    <Check size={14} className="mr-1 inline" /> Accept Project Title
                  </PrimaryButton>
                )}
                {!selectedApp.projectAccepted && !selectedApp.projectRejected && (
                  <button
                    type="button"
                    onClick={() => {
                      onRejectProject(selectedApp.id);
                      setShowProjectDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl cursor-pointer hover:bg-rose-500/20 transition"
                  >
                    <X size={14} className="inline mr-1" /> Reject Project Title
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedApp.projectTitle ? (
        <EmptyState icon={Clock} title="Awaiting project title" sub="Your faculty hasn't assigned a project title yet." />
      ) : (
        <div className="flex flex-col gap-6">
          {/* REPORT CARD PERIODS & TASKS GRID */}
          <div className="bg-slate-900/70 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-cyan-400" />
                <div>
                  <h2 className="text-base font-black text-white">Project Tasks Grid Cards</h2>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Click any task card to submit your progress report, upload deliverables, or view faculty feedback.
                  </p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 bg-cyan-500/15 text-cyan-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-cyan-500/30">
                <Calendar size={13} /> Current Period {currentWeek} of {totalWeeks}
              </div>
            </div>

            <div className="p-6">
              {/* TOP 3 FILTER BUTTONS FOR STUDENT (ACTIVE, COMPLETED, PENDING) */}
              {(() => {
                // Resolve exactly WHO this card belongs to. We intentionally do
                // NOT fall back to the currently logged-in user's stored email —
                // doing that meant every application with a missing
                // studentEmail silently rendered the logged-in user's own
                // tasks, which is the "always shows one fixed student" bug.
                const rawStudentEmail = (
                  studentEmailProp ||
                  selectedApp?.studentEmail ||
                  selectedApp?.email ||
                  selectedApp?.applicantEmail ||
                  selectedApp?.userEmail ||
                  ''
                ).trim();
                const cleanStudentEmail = rawStudentEmail.toLowerCase();

                // Use the application's own identifiers only. We intentionally
                // do NOT default to `1` — that default caused every
                // application missing an id/projectId to collide on the same
                // "project 1" localStorage keys and report matches, which is
                // the "always shows one fixed set of tasks" bug.
                const appId = selectedApp?.id;
                const projId = selectedApp?.projectId ?? appId;
                const hasValidIdentity = Boolean(cleanStudentEmail && appId != null);

                const studentWeeks = Array.from({ length: totalWeeks }, (_, k) => k + 1).map((week) => {
                  let taskData: any = null;

                  if (hasValidIdentity) {
                    const taskKeyCandidates = [
                      `task_data_${projId}_${cleanStudentEmail}_${week}`,
                      `task_data_${projId}_${rawStudentEmail}_${week}`,
                    ];

                    let savedTaskRaw: string | null = null;
                    for (const k of taskKeyCandidates) {
                      const val = localStorage.getItem(k);
                      if (val) {
                        savedTaskRaw = val;
                        break;
                      }
                    }

                    if (savedTaskRaw) {
                      try {
                        taskData = JSON.parse(savedTaskRaw);
                      } catch (e) {
                        taskData = null;
                      }
                    }
                  }

                  const matchesThisApp = (r: any) => {
                    const rAppId = r.applicationId ?? r.appId ?? r.projectId;
                    if (rAppId === undefined || appId == null) return false;
                    return String(rAppId) === String(appId) || (projId != null && String(rAppId) === String(projId));
                  };

                  let report = reports.find(
                    (r) => matchesThisApp(r) && Number(r.weekNumber || r.taskNumber) === Number(week)
                  );

                  if (!report && hasValidIdentity) {
                    const reportKeyCandidates = [
                      `student_submitted_reports_${cleanStudentEmail}`,
                      `student_submitted_reports_${rawStudentEmail}`,
                    ];
                    for (const rk of reportKeyCandidates) {
                      const raw = localStorage.getItem(rk);
                      if (raw) {
                        try {
                          const parsed = JSON.parse(raw);
                          report = parsed.find(
                            (r: any) => matchesThisApp(r) && Number(r.weekNumber || r.taskNumber) === Number(week)
                          );
                          if (report) break;
                        } catch (e) {}
                      }
                    }
                  }

                  if (!report && hasValidIdentity) {
                    try {
                      const globalRaw = localStorage.getItem('global_all_submitted_reports');
                      if (globalRaw) {
                        const globalList = JSON.parse(globalRaw);
                        report = globalList.find(
                          (r: any) =>
                            matchesThisApp(r) &&
                            (r.studentEmail || '').trim().toLowerCase() === cleanStudentEmail &&
                            Number(r.weekNumber || r.taskNumber) === Number(week)
                        );
                      }
                    } catch (e) {}
                  }

                  const isGood = Boolean(
                    (taskData && (taskData.reviewStatus === 'ACCEPTED' || taskData.reviewStatus === 'APPROVED & REVIEWED')) ||
                    (report && (report.status === 'APPROVED' || report.status === 'ACCEPTED' || report.reviewStatus === 'ACCEPTED'))
                  );
                  const isChangeReq = Boolean(
                    (taskData && taskData.reviewStatus === 'CHANGE_REQUESTED') ||
                    (report && (report.status === 'NEEDS_REVISION' || report.status === 'CHANGE_REQUESTED' || report.reviewStatus === 'CHANGE_REQUESTED'))
                  );
                  const isSubmitted = Boolean(
                    (taskData && (taskData.isSubmitted || taskData.reviewStatus === 'SUBMITTED')) ||
                    (report && (report.status === 'SUBMITTED' || report.status === 'SUBMITTED_FOR_REVIEW'))
                  );
                  const isTaskGiven = Boolean(taskData && (taskData.isAssigned || taskData.instructions));
                  const isQuickTask = Boolean(taskData && (taskData.isQuickTask || taskData.priority === 'HIGH' || taskData.taskType === 'QUICK_INSTANT_TASK'));

                  const isCompleted = isGood;
                  const isCurrentWeek = week === currentWeek;
                  const isActive = isCurrentWeek;
                  const isPending = !isCompleted && !isActive;

                  return { week, taskData, report, isGood, isChangeReq, isSubmitted, isTaskGiven, isQuickTask, isCompleted, isActive, isCurrentWeek, isPending };
                });

                const activeCount = studentWeeks.filter((w) => w.isActive).length;
                const completedCount = studentWeeks.filter((w) => w.isCompleted).length;
                const pendingCount = studentWeeks.filter((w) => w.isPending).length;
                const allCount = studentWeeks.length;

                const filteredWeeks = studentWeeks
                  .filter((w) => {
                    if (studentTaskFilter === 'ACTIVE') return w.isActive;
                    if (studentTaskFilter === 'COMPLETED') return w.isCompleted;
                    if (studentTaskFilter === 'PENDING') return w.isPending;
                    return true;
                  })
                  .sort((a, b) => {
                    if (studentTaskFilter === 'ACTIVE') {
                      return b.week - a.week;
                    }
                    return a.week - b.week;
                  });

                return (
                  <>
                    {/* FILTER BUTTON TABS */}
                    <div className="flex items-center gap-2.5 flex-wrap mb-5">
                      <button
                        type="button"
                        onClick={() => setStudentTaskFilter('ACTIVE')}
                        className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                          studentTaskFilter === 'ACTIVE'
                            ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        ⚡ Active ({activeCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentTaskFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                          studentTaskFilter === 'ALL'
                            ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        All Tasks ({allCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentTaskFilter('COMPLETED')}
                        className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                          studentTaskFilter === 'COMPLETED'
                            ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        ✓ Completed ({completedCount})
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentTaskFilter('PENDING')}
                        className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                          studentTaskFilter === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        ⏳ Pending ({pendingCount})
                      </button>
                    </div>

                    {/* CLEAN MINIMAL TASK GRID CARDS VIEW */}
                    {filteredWeeks.length === 0 ? (
                      <div className="p-10 text-center bg-slate-950/60 border border-dashed border-slate-700 rounded-2xl text-xs font-semibold text-slate-300">
                        No {studentTaskFilter.toLowerCase()} tasks found for this project.
                      </div>
                    ) : (
                      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {filteredWeeks.map(({ week, taskData, report, isGood, isChangeReq, isSubmitted, isTaskGiven, isQuickTask, isCompleted, isCurrentWeek }) => {
                          let badge = { label: 'No Task Given', bg: 'bg-slate-950/80', color: 'text-slate-300', border: 'border-slate-700' };
                          if (isGood) {
                            badge = { label: 'Accepted ✓', bg: 'bg-emerald-500/15', color: 'text-emerald-300', border: 'border-emerald-500/30' };
                          } else if (isChangeReq) {
                            badge = { label: 'Revision Required ⚠️', bg: 'bg-amber-500/15', color: 'text-amber-300', border: 'border-amber-500/30' };
                          } else if (isSubmitted) {
                            badge = { label: 'Submitted - Review ⚡', bg: 'bg-blue-500/15', color: 'text-blue-300', border: 'border-blue-500/30' };
                          } else if (isCompleted) {
                            badge = { label: 'Completed ✓', bg: 'bg-cyan-500/15', color: 'text-cyan-300', border: 'border-cyan-500/30' };
                          } else if (isCurrentWeek) {
                            badge = { label: '⚡ Active (Current Period)', bg: 'bg-cyan-500/15', color: 'text-cyan-300', border: 'border-cyan-500/30' };
                          } else if (isQuickTask) {
                            badge = { label: '⚡ URGENT / EXTRA TASK', bg: 'bg-amber-500/15', color: 'text-amber-300', border: 'border-amber-500/30' };
                          } else if (isTaskGiven) {
                            badge = { label: 'Task Assigned', bg: 'bg-cyan-500/15', color: 'text-cyan-300', border: 'border-cyan-500/30' };
                          } else if (week < currentWeek) {
                            badge = { label: 'Not Completed ⚠️', bg: 'bg-rose-500/10', color: 'text-rose-300', border: 'border-rose-500/30' };
                          }

                          return (
                            <div
                              key={week}
                              onClick={() => {
                                onSelectWeek(week, taskData?.studentResponseText || report?.content || '');
                              }}
                              className="bg-slate-900/70 border border-slate-700/80 hover:border-cyan-500/40 p-5 rounded-2xl text-left transition duration-300 relative flex flex-col justify-between gap-4 cursor-pointer shadow-lg hover:shadow-cyan-500/10 backdrop-blur-md"
                            >
                              {/* CARD HEADER ROW */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-base font-extrabold text-white">Task {week}</span>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${badge.bg} ${badge.color} ${badge.border}`}>
                                  {badge.label}
                                </span>
                              </div>

                              {/* DATE WINDOW */}
                              <div className="text-xs font-bold text-slate-300 flex items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-700/80">
                                <Calendar size={15} className="text-cyan-400 shrink-0" />
                                <span>Window: <strong className="text-white">{selectedApp.internshipStartDate ? weekRange(selectedApp.internshipStartDate, week) : `Period ${week}`}</strong></span>
                              </div>

                              {/* BIG BUTTON: VIEW DETAILS */}
                              <div className="border-t border-slate-700/80 pt-3 mt-1">
                                <button
                                  type="button"
                                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  View Details →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekGridPage;