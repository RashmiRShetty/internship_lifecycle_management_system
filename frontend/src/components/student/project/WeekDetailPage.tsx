import React from 'react';
import {
  ChevronLeft,
  FileText,
  AlertCircle,
  Upload,
  X,
  CheckCircle2,
  Clock,
  Info,
  History,
  Download,
  Trash2,
  Edit3,
} from 'lucide-react';
import { SecondaryButton, Modal, Pill, FormField } from '../ui';
import { downloadFileHelper, getReportData } from '../../../utils/fileStorage';

interface WeekDetailPageProps {
  selectedWeek: number;
  selectedApp: any;
  studentEmail?: string;
  reports: any[];
  onBackToWeeks: () => void;
  reportContent: string;
  setReportContent: (val: string) => void;
  selectedFiles: File[];
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  promptSubmitTask: () => void;
  showSubmitConfirmModal: boolean;
  setShowSubmitConfirmModal: (show: boolean) => void;
  executeSubmitReport: () => void;
  onDeleteSubmission?: (week: number) => void;
  submittingTask: boolean;
  weekRange: (startDate: string, week: number) => string;
}

export const WeekDetailPage: React.FC<WeekDetailPageProps> = ({
  selectedWeek,
  selectedApp,
  studentEmail: studentEmailProp,
  reports,
  onBackToWeeks,
  reportContent,
  setReportContent,
  selectedFiles,
  handleFileSelect,
  handleRemoveFile,
  selectedFile,
  setSelectedFile,
  promptSubmitTask,
  showSubmitConfirmModal,
  setShowSubmitConfirmModal,
  executeSubmitReport,
  onDeleteSubmission,
  submittingTask,
  weekRange,
}) => {
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  React.useEffect(() => {
    const handleUpdate = () => {
      setRefreshCounter((prev) => prev + 1);
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('student_report_reviewed', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('student_report_reviewed', handleUpdate);
    };
  }, []);

  let fallbackUserEmail = '';
  try {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      fallbackUserEmail = userObj.email || userObj.studentEmail || userObj.userEmail || '';
    }
  } catch (e) {}

  const rawStudentEmail = (
    studentEmailProp ||
    selectedApp?.studentEmail ||
    selectedApp?.email ||
    selectedApp?.applicantEmail ||
    selectedApp?.userEmail ||
    fallbackUserEmail ||
    ''
  ).trim();
  const cleanStudentEmail = rawStudentEmail.toLowerCase();

  const projId = selectedApp.projectId || selectedApp.id || 1;
  const appId = selectedApp.id || 1;

  // 1. Try finding taskData from localStorage using candidates and fallback scanning
  let savedTaskRaw: string | null = null;
  const taskKeyCandidates = [
    `task_data_${projId}_${cleanStudentEmail}_${selectedWeek}`,
    `task_data_${projId}_${rawStudentEmail}_${selectedWeek}`,
  ];

  for (const k of taskKeyCandidates) {
    const val = localStorage.getItem(k);
    if (val) {
      savedTaskRaw = val;
      break;
    }
  }

  if (!savedTaskRaw) {
    try {
      const allowedProjectTokens = [
        `_${projId}_`,
        ...(String(appId) !== String(projId) ? [`_${appId}_`] : []),
      ];
      void allowedProjectTokens;
    } catch (e) {}
  }

  const initialTaskData = savedTaskRaw ? JSON.parse(savedTaskRaw) : null;

  // 2. Try finding report from localStorage using candidates, global array, and key scanning
  let localReport: any = null;
  const reportKeyCandidates = [
    `student_submitted_reports_${cleanStudentEmail}`,
    `student_submitted_reports_${rawStudentEmail}`,
  ];

  for (const rk of reportKeyCandidates) {
    const raw = localStorage.getItem(rk);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        localReport = parsed.find(
          (r: any) => {
            const rAppId = r.applicationId ?? r.appId ?? r.projectId;
            const matchesApp =
              rAppId !== undefined &&
              (String(rAppId) === String(appId) || String(rAppId) === String(projId));
            return matchesApp && Number(r.weekNumber || r.taskNumber) === Number(selectedWeek);
          }
        );
        if (localReport) break;
      } catch (e) {}
    }
  }

  if (!localReport) {
    try {
      const globalRaw = localStorage.getItem('global_all_submitted_reports');
      if (globalRaw) {
        const globalList = JSON.parse(globalRaw);
        localReport = globalList.find(
          (r: any) => {
            const rAppId = r.applicationId ?? r.appId ?? r.projectId;
            const matchesApp =
              rAppId !== undefined &&
              (String(rAppId) === String(appId) || String(rAppId) === String(projId));
            return (
              matchesApp &&
              cleanStudentEmail &&
              (r.studentEmail || '').trim().toLowerCase() === cleanStudentEmail &&
              Number(r.weekNumber || r.taskNumber) === Number(selectedWeek)
            );
          }
        );
      }
    } catch (e) {}
  }

  if (!localReport) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('student_submitted_reports_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const found = arr.find((r: any) => {
                const rAppId = r.applicationId ?? r.appId ?? r.projectId;
                const matchesApp =
                  rAppId !== undefined &&
                  (String(rAppId) === String(appId) || String(rAppId) === String(projId));
                return matchesApp && Number(r.weekNumber || r.taskNumber) === Number(selectedWeek);
              });
              if (found) {
                localReport = found;
                break;
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  const propReport = (reports || []).find((r: any) => {
    const rAppId = r.applicationId ?? r.appId ?? r.projectId;
    const matchesApp =
      rAppId !== undefined &&
      (String(rAppId) === String(appId) || String(rAppId) === String(projId));
    return matchesApp && Number(r.weekNumber || r.taskNumber) === Number(selectedWeek);
  });

  // 3. Async IndexedDB backup state
  const [asyncTaskData, setAsyncTaskData] = React.useState<any>(null);
  const [asyncReport, setAsyncReport] = React.useState<any>(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchIdbFeedback = async () => {
      try {
        const t1 = await getReportData(`task_data_${projId}_${cleanStudentEmail}_${selectedWeek}`);
        const foundTask = t1;

        const rep1 = await getReportData(`student_submitted_reports_${cleanStudentEmail}`);
        const repGlobal = await getReportData('global_all_submitted_reports');
        let foundReport: any = null;

        if (Array.isArray(rep1)) {
          foundReport = rep1.find((r: any) => {
            const rAppId = r.applicationId ?? r.appId ?? r.projectId;
            const matchesApp =
              rAppId !== undefined &&
              (String(rAppId) === String(appId) || String(rAppId) === String(projId));
            return matchesApp && Number(r.weekNumber || r.taskNumber) === Number(selectedWeek);
          });
        }
        if (!foundReport && Array.isArray(repGlobal)) {
          foundReport = repGlobal.find(
            (r: any) => {
              const rAppId = r.applicationId ?? r.appId ?? r.projectId;
              const matchesApp =
                rAppId !== undefined &&
                (String(rAppId) === String(appId) || String(rAppId) === String(projId));
              return (
                matchesApp &&
                (r.studentEmail || '').trim().toLowerCase() === cleanStudentEmail &&
                Number(r.weekNumber || r.taskNumber) === Number(selectedWeek)
              );
            }
          );
        }

        if (isMounted) {
          if (foundTask) setAsyncTaskData(foundTask);
          if (foundReport) setAsyncReport(foundReport);
        }
      } catch (e) {}
    };
    fetchIdbFeedback();
    return () => { isMounted = false; };
  }, [cleanStudentEmail, selectedWeek, projId, appId, refreshCounter]);

  const effectiveTask = initialTaskData || asyncTaskData;
  const effectiveReport = localReport || asyncReport || propReport;
  const taskData = effectiveTask;
  const report = effectiveReport;

  const facultyFeedbackText =
    effectiveTask?.facultyFeedback ||
    effectiveReport?.facultyFeedback ||
    effectiveTask?.notes ||
    effectiveReport?.notes ||
    effectiveTask?.comments ||
    effectiveReport?.comments ||
    '';

  const approvedStatuses = ['ACCEPTED', 'APPROVED', 'APPROVED & REVIEWED', 'APPROVED_AND_REVIEWED', 'ACCEPT', 'PASSED', 'COMPLETED', 'REVIEWED'];
  const revisionStatuses = ['CHANGE_REQUESTED', 'NEEDS_REVISION', 'NEEDS REVISION', 'REVISION_REQUESTED', 'REJECTED', 'REVISE'];

  const isAccepted = Boolean(
    approvedStatuses.includes(String(effectiveTask?.reviewStatus || '').toUpperCase()) ||
    approvedStatuses.includes(String(effectiveReport?.status || '').toUpperCase()) ||
    approvedStatuses.includes(String(effectiveReport?.reviewStatus || '').toUpperCase())
  );

  const isChangeRequested = Boolean(
    revisionStatuses.includes(String(effectiveTask?.reviewStatus || '').toUpperCase()) ||
    revisionStatuses.includes(String(effectiveReport?.status || '').toUpperCase()) ||
    revisionStatuses.includes(String(effectiveReport?.reviewStatus || '').toUpperCase())
  );

  const isSubmitted =
    effectiveTask?.isSubmitted ||
    effectiveTask?.reviewStatus === 'SUBMITTED' ||
    effectiveReport?.status === 'SUBMITTED' ||
    isAccepted ||
    isChangeRequested ||
    Boolean(effectiveTask?.studentResponseText) ||
    Boolean(effectiveReport?.content) ||
    Boolean(effectiveTask?.studentFiles?.length) ||
    Boolean(effectiveReport?.fileNames?.length);

  const [activeTab, setActiveTab] = React.useState<'SUBMITTED' | 'INSTRUCTIONS' | 'FEEDBACK'>(
    isSubmitted || isAccepted || isChangeRequested ? 'INSTRUCTIONS' : 'SUBMITTED'
  );

  React.useEffect(() => {
    if (isSubmitted || isAccepted || isChangeRequested) {
      setActiveTab('INSTRUCTIONS');
    }
  }, [isSubmitted, isAccepted, isChangeRequested, selectedWeek]);

  const [showUpdateForm, setShowUpdateForm] = React.useState(!isSubmitted || isChangeRequested);

  const handleDownloadDeliverable = async (fileName: string, fileUrl?: string) => {
    const scopeKey = `${cleanStudentEmail}_task_${selectedWeek}`;
    await downloadFileHelper(fileName, fileUrl, scopeKey);
  };

  const sentFileNames: string[] = Array.from(
    new Set([
      ...(taskData?.studentFiles || []),
      ...(report?.fileNames || []),
      ...(taskData?.studentFilesData ? taskData.studentFilesData.map((f: any) => (typeof f === 'string' ? f : f.name)) : []),
      ...(report?.filesData ? report.filesData.map((f: any) => (typeof f === 'string' ? f : f.name)) : []),
    ])
  ).filter(Boolean);

  let rawHistory: any[] = taskData?.submissionHistory || report?.submissionHistory || [];

  if (rawHistory.length === 0 && (taskData?.studentResponseText || report?.content || sentFileNames.length > 0)) {
    rawHistory = [
      {
        id: 'v1',
        version: 1,
        submittedAt: report?.submittedAt || taskData?.submittedAt || new Date().toISOString(),
        content: taskData?.studentResponseText || report?.content || '',
        fileNames: sentFileNames,
        filesData: taskData?.studentFilesData || report?.filesData || [],
      },
    ];
  }

  const sortedHistory = [...rawHistory].reverse();

  return (
    <div className="w-full pt-1">
      {/* TOP NAVIGATION HEADER BAR */}
      <div className="bg-slate-900/80 p-4.5 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <SecondaryButton onClick={onBackToWeeks}>
            <ChevronLeft size={14} /> Back to tasks grid
          </SecondaryButton>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">
              Task {selectedWeek}: {taskData?.title || `Task ${selectedWeek}`}
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Window: {selectedApp.internshipStartDate ? weekRange(selectedApp.internshipStartDate, selectedWeek) : ''} · {selectedApp.internshipTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAccepted ? (
            <span className="px-3 py-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-black flex items-center gap-1">
              <CheckCircle2 size={13} /> Approved ✓
            </span>
          ) : isChangeRequested ? (
            <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black flex items-center gap-1">
              <AlertCircle size={13} /> Revision Required
            </span>
          ) : isSubmitted ? (
            <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black flex items-center gap-1">
              <Clock size={13} /> Under Review
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-950/80 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1">
              <Info size={13} /> Draft / Not Submitted
            </span>
          )}
        </div>
      </div>

      {/* HORIZONTAL TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-700/80 mb-6 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('SUBMITTED')}
          className={`px-5 py-2.5 font-black text-xs rounded-full transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'SUBMITTED'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FileText size={15} /> Submitted Work &amp; Form
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INSTRUCTIONS')}
          className={`px-5 py-2.5 font-black text-xs rounded-full transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'INSTRUCTIONS'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <History size={15} /> Task History
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FEEDBACK')}
          className={`px-5 py-2.5 font-black text-xs rounded-full transition flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
            activeTab === 'FEEDBACK'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>⚡</span> Faculty Feedback
          {isAccepted && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
          {isChangeRequested && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
        </button>
      </div>

      {/* TAB 1: SUBMITTED WORK & FORM */}
      {activeTab === 'SUBMITTED' && (
        <div className="space-y-6">
          {(isSubmitted || isAccepted || isChangeRequested || taskData?.studentResponseText || report?.content || sentFileNames.length > 0) && (
            <div className="bg-slate-900/70 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md overflow-hidden text-white">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-950/80 flex-wrap gap-3">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <FileText size={16} className="text-cyan-400" /> Submitted Work &amp; Deliverables
                </span>
                <div className="flex items-center gap-2">
                  {isAccepted ? (
                    <Pill color="indigo">Good / Accepted ✓</Pill>
                  ) : isChangeRequested ? (
                    <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black">
                      Revision Required ⚠️
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black">
                      Submitted - Under Review ⚡
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowUpdateForm((prev: boolean) => !prev)}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white rounded-full text-xs font-extrabold transition cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    {showUpdateForm ? 'Hide Form' : '✏️ Edit / Resubmit Task'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {(taskData?.studentResponseText || report?.content) && (
                  <div>
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1.5">Response Text Sent</div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/80 p-4 rounded-xl border border-slate-700 font-medium">
                      {taskData?.studentResponseText || report?.content}
                    </p>
                  </div>
                )}

                {sentFileNames.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1.5">
                      Latest Sent Deliverables ({sentFileNames.length} file{sentFileNames.length > 1 ? 's' : ''})
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {sentFileNames.map((fileName: string, i: number) => {
                        const fileUrl = taskData?.studentFilesData?.find((f: any) => f.name === fileName)?.url;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDownloadDeliverable(fileName, fileUrl)}
                            title="Click to Download Sent File"
                            className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-cyan-500/20 transition cursor-pointer shadow-xs"
                          >
                            📄 {fileName}
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold">
                              ⬇ Download
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUBMISSION HISTORY LOG & VERSIONS */}
                {sortedHistory.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-700/80">
                    <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        📜 Submission History ({sortedHistory.length} version{sortedHistory.length > 1 ? 's' : ''})
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold">Ordered newest to oldest</span>
                    </div>

                    <div className="space-y-3">
                      {sortedHistory.map((item: any, idx: number) => {
                        const isLatest = idx === 0;
                        const dateStr = item.submittedAt
                          ? new Date(item.submittedAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Earlier Submission';

                        return (
                          <div
                            key={item.id || idx}
                            className={`p-4 rounded-2xl border transition ${
                              isLatest ? 'bg-blue-950/40 border-cyan-500/40' : 'bg-slate-950/60 border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                                  isLatest ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  Submission #{item.version || (sortedHistory.length - idx)}
                                </span>
                                {isLatest && (
                                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                                    Current Active Version
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-slate-300">📅 {dateStr}</span>
                            </div>

                            {item.content && (
                              <div className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/80 p-3 rounded-xl border border-slate-700 mb-2 whitespace-pre-wrap">
                                {item.content}
                              </div>
                            )}

                            {item.fileNames && item.fileNames.length > 0 && (
                              <div className="flex gap-2 flex-wrap mt-2">
                                {item.fileNames.map((fn: string, fIdx: number) => {
                                  const fileUrl = item.filesData?.find((f: any) => f.name === fn)?.url;
                                  return (
                                    <button
                                      key={fIdx}
                                      type="button"
                                      onClick={() => handleDownloadDeliverable(fn, fileUrl)}
                                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:border-cyan-500/50 transition cursor-pointer shadow-xs"
                                    >
                                      📄 {fn} <span className="text-[10px] text-amber-300 font-extrabold">⬇ Download</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showUpdateForm && (
            <div className="bg-slate-900/70 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md p-6 text-white">
              <div>
                <div className="text-sm font-extrabold text-white mb-4 flex items-center justify-between">
                  <span>{isSubmitted ? '✏️ Update / Resubmit Task Work' : '📝 Submit Task Work & Files'}</span>
                  <span className="text-xs text-slate-300 font-semibold">Multiple file attachments supported</span>
                </div>

                <FormField label="Your Task Work & Response">
                  <textarea
                    className="w-full min-h-[180px] p-3.5 rounded-2xl border border-slate-700 bg-slate-950/80 text-sm leading-relaxed text-white outline-none transition resize-y focus:border-cyan-400 placeholder:text-slate-300"
                    placeholder="Describe your progress, completed code modules, challenges faced, and deliverables…"
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                  />
                </FormField>
                <div className="mt-4 mb-6">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wide block mb-1.5">
                    File Attachments (Multiple files supported: PDF, DOC, ZIP, SQL, Source Code, Images, Videos)
                  </label>

                  {selectedFiles.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileText size={18} className="text-cyan-400 shrink-0" />
                            <span className="text-xs font-bold text-white truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-300 font-semibold">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-slate-300 hover:text-rose-400 p-1 transition cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : selectedFile ? (
                    <div className="bg-slate-950/80 px-4 py-3.5 rounded-2xl border border-slate-700 flex items-center gap-3 mb-3">
                      <FileText size={20} className="text-cyan-400" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{selectedFile.name}</div>
                        <div className="text-xs text-slate-300 font-semibold">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="p-1 text-slate-300 hover:text-rose-400">
                        <X size={18} />
                      </button>
                    </div>
                  ) : null}

                  <label className="w-full py-6 px-4 border-2 border-dashed border-slate-700 rounded-2xl text-center cursor-pointer flex flex-col items-center gap-2 bg-slate-950/60 hover:border-cyan-400 hover:bg-cyan-950/20 transition">
                    <Upload size={26} className="text-cyan-400" />
                    <div className="text-sm font-bold text-white">Click to upload multiple files or drag and drop</div>
                    <div className="text-xs text-slate-300">All file types supported (PDF, DOCX, ZIP, Source Code, Media, etc.)</div>
                    <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                </div>

                <div className="flex gap-2.5 justify-end">
                  <SecondaryButton onClick={onBackToWeeks}>Cancel</SecondaryButton>
                  <button
                    type="button"
                    onClick={promptSubmitTask}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white font-extrabold text-xs rounded-full shadow-md shadow-cyan-500/20 transition cursor-pointer"
                  >
                    {isChangeRequested ? '⚡ Send Resubmitted Task to Faculty' : isSubmitted ? '⚡ Update & Resubmit Task Work' : '⚡ Send Task Completed to Faculty'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TASK HISTORY (EXPLAIN TASK & SHOW SUBMITTED TASK) */}
      {activeTab === 'INSTRUCTIONS' && (
        <div className="space-y-6">
          {/* 1. TASK EXPLANATION & INSTRUCTIONS */}
          <div className="bg-slate-900/70 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md p-6 text-white">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                📌 Task Explanation &amp; Objectives
              </span>
              {taskData?.dueDate && (
                <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30">
                  📅 Target Due Date: {taskData.dueDate}
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-white mb-2">
              Task {selectedWeek}: {taskData?.title || `Weekly Milestone Task ${selectedWeek}`}
            </h3>

            <div className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-wrap bg-slate-950/80 p-4 rounded-xl border border-slate-700">
              {taskData?.instructions ||
                `Complete the assigned objectives for Task ${selectedWeek} according to your internship syllabus. Make sure to upload all related project files, code, or documents prior to submitting.`}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Project Name</span>
                <span className="font-bold text-white">{selectedApp.internshipTitle}</span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Task Window</span>
                <span className="font-bold text-white">
                  {selectedApp.internshipStartDate ? weekRange(selectedApp.internshipStartDate, selectedWeek) : `Week ${selectedWeek}`}
                </span>
              </div>
            </div>
          </div>

          {/* 2. SUBMITTED TASK WORK & DELIVERABLES HISTORY */}
          <div className="bg-slate-900/70 rounded-3xl border border-slate-700/80 shadow-lg backdrop-blur-md p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 flex-wrap gap-3">
              <span className="text-sm font-black text-white flex items-center gap-2">
                📥 Submitted Task Deliverables &amp; Work Log
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {isAccepted ? (
                  <Pill color="indigo">Good / Accepted ✓</Pill>
                ) : isChangeRequested ? (
                  <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black">
                    Revision Required ⚠️
                  </span>
                ) : isSubmitted ? (
                  <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black">
                    Submitted - Under Review ⚡
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-950/80 text-slate-400 border border-slate-700 rounded-xl text-xs font-medium">
                    Not Submitted Yet
                  </span>
                )}

                {isSubmitted && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (taskData?.studentResponseText || report?.content) {
                          setReportContent(taskData?.studentResponseText || report?.content || '');
                        }
                        setActiveTab('SUBMITTED');
                        setShowUpdateForm(true);
                      }}
                      className="px-3 py-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 size={12} /> Edit Submission
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete your submission for Task ${selectedWeek}? This action cannot be undone.`)) {
                          if (onDeleteSubmission) onDeleteSubmission(selectedWeek);
                          setActiveTab('SUBMITTED');
                        }
                      }}
                      className="px-3 py-1 bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete Submission
                    </button>
                  </>
                )}
              </div>
            </div>

            {sortedHistory.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    📜 Real Student Submissions ({sortedHistory.length} version{sortedHistory.length > 1 ? 's' : ''})
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Ordered newest to oldest</span>
                </div>

                {sortedHistory.map((item: any, idx: number) => {
                  const isLatest = idx === 0;
                  const dateStr = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Submitted Work';

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-4 rounded-2xl border transition ${
                        isLatest ? 'bg-blue-950/40 border-cyan-500/40' : 'bg-slate-950/60 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                            isLatest ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                          }`}>
                            Submission #{item.version || (sortedHistory.length - idx)}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                              Current Active Version
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-300">📅 {dateStr}</span>
                      </div>

                      {item.content && (
                        <div className="mb-2">
                          <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Student Response Text</div>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>
                      )}

                      {item.fileNames && item.fileNames.length > 0 && (
                        <div className="mt-2">
                          <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Submitted Files ({item.fileNames.length})</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.fileNames.map((fn: string, fIdx: number) => {
                              const fObj = item.filesData?.find((f: any) => f.name === fn);
                              return (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => handleDownloadDeliverable(fn, fObj?.url)}
                                  className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                                >
                                  📄 {fn} <Download size={12} className="text-cyan-400" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-950/40 rounded-xl">
                No work or files have been submitted for Task {selectedWeek} yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY FEEDBACK */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-6">
          {(isAccepted || isChangeRequested || Boolean(facultyFeedbackText)) ? (
            <div className={`rounded-3xl border p-6 shadow-lg backdrop-blur-md ${
              isAccepted ? 'bg-blue-950/40 border-cyan-500/40' : isChangeRequested ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-900/70 border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5 text-white">
                  {isAccepted ? (
                    <span className="text-cyan-400 font-black flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Faculty Approved &amp; Accepted
                    </span>
                  ) : isChangeRequested ? (
                    <span className="text-amber-300 font-black flex items-center gap-1.5">
                      <AlertCircle size={16} /> Faculty Requested Changes / Revisions ⚠️
                    </span>
                  ) : (
                    <span className="text-slate-200 font-black flex items-center gap-1.5">
                      <Clock size={16} /> Faculty Review Notes
                    </span>
                  )}
                </span>
                {isAccepted && <Pill color="blue">Accepted ✓</Pill>}
                {isChangeRequested && <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-black">Needs Revision</span>}
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-semibold bg-slate-950/80 p-4 rounded-xl border border-slate-700 whitespace-pre-wrap">
                {facultyFeedbackText || (isAccepted ? 'Task deliverables reviewed and approved by supervisor.' : 'Faculty supervisor has requested updates to your task deliverables.')}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/70 rounded-3xl border border-slate-700/80 p-8 text-center shadow-lg backdrop-blur-md text-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                ⚡
              </div>
              <h4 className="text-sm font-extrabold text-white mb-1">No Faculty Feedback Yet</h4>
              <p className="text-xs text-slate-300 font-medium max-w-md mx-auto">
                Once you submit your work for Task {selectedWeek}, your faculty supervisor will evaluate your deliverables and post review notes or approval here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showSubmitConfirmModal && (
        <Modal onClose={() => setShowSubmitConfirmModal(false)} maxWidth="max-w-sm">
          <div className="p-6">
            <div className="text-base font-black text-white mb-2">Confirm Task Submission</div>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to submit this task report? Your faculty supervisor will be notified to review your updated task response.
            </p>
            <div className="flex justify-end gap-2">
              <SecondaryButton onClick={() => setShowSubmitConfirmModal(false)}>Cancel</SecondaryButton>
              <button
                type="button"
                onClick={executeSubmitReport}
                disabled={submittingTask}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white font-extrabold text-xs rounded-full shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-70"
              >
                {submittingTask ? 'Submitting...' : 'Yes, Submit Task'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WeekDetailPage;
