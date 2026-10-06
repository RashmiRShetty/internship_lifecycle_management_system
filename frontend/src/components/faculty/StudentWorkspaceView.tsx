import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Briefcase,
  Zap,
  Edit3,
  ClipboardList,
  CheckSquare,
  Eye,
  FileText,
  Plus,
  X,
  Calendar,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { downloadFileHelper, getReportData, saveReportData } from '../../utils/fileStorage';
import { ViewResumeModal } from './ViewResumeModal';
import { IssueCertificateModal } from './modals/IssueCertificateModal';
import { getCertificateForStudent } from '../../services/certificateService';

interface StudentWorkspaceViewProps {
  activeProjectDetail: any;
  viewingStudentProfile: any;
  setViewingStudentProfile: (val: any) => void;
  studentMeetingsMap: Record<string, any[]>;
  studentReviewsMap: Record<string, any>;
  studentAcceptanceMap: Record<string, any>;
  studentFeedbackMap: Record<string, any>;
  setAnytimeTaskForm: (val: any) => void;
  setShowAssignTaskAnytimeModal: (val: boolean) => void;
  handleOpenSingleEditModal: (val: any) => void;
  setReviewForm?: (val: any) => void;
  setShowReviewModal?: (val: boolean) => void;
  setFeedbackForm?: (val: any) => void;
  setShowFeedbackModal?: (val: boolean) => void;
}

export const StudentWorkspaceView: React.FC<StudentWorkspaceViewProps> = ({
  activeProjectDetail,
  viewingStudentProfile,
  setViewingStudentProfile,
  studentMeetingsMap: _studentMeetingsMap,
  studentReviewsMap: _studentReviewsMap,
  studentAcceptanceMap,
  studentFeedbackMap: _studentFeedbackMap,
  setAnytimeTaskForm,
  setShowAssignTaskAnytimeModal,
  handleOpenSingleEditModal,
}) => {
  const navigate = useNavigate();
  const [showWorkspaceResumeModal, setShowWorkspaceResumeModal] = useState(false);
  const studentEmail = viewingStudentProfile.email || viewingStudentProfile.studentEmail;
  const studentName = viewingStudentProfile.name || studentEmail;
  const studentRole =
    viewingStudentProfile.role || viewingStudentProfile.task || 'Project Contributor';
  const studentTask =
    viewingStudentProfile.description ||
    (viewingStudentProfile.task !== studentRole
      ? viewingStudentProfile.task
      : 'Full Stack Module Implementation');
  const applicationId =
    viewingStudentProfile.applicationId ||
    viewingStudentProfile.appId ||
    viewingStudentProfile.id ||
    activeProjectDetail.applicationId ||
    activeProjectDetail.appId ||
    activeProjectDetail.id;
  const facultyToken = sessionStorage.getItem('token') || localStorage.getItem('token');
  let facultyEmail = '';
  try {
    facultyEmail = facultyToken ? String((jwtDecode(facultyToken) as any).sub || '') : '';
  } catch {}
  const certificateApplication = {
    ...viewingStudentProfile,
    id: applicationId,
    studentEmail,
    studentName,
    internshipTitle: activeProjectDetail.name || activeProjectDetail.title || studentRole,
  };
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateApproved, setCertificateApproved] = useState(
    () => !!getCertificateForStudent(studentEmail, applicationId)
  );

  // Calculate Report Periods dynamically based on project startDate, endDate & frequency!
  const freqDays =
    activeProjectDetail.frequencyDays ||
    (activeProjectDetail.frequencyType === 'DAILY'
      ? 1
      : activeProjectDetail.frequencyType === 'WEEKLY'
      ? 7
      : activeProjectDetail.frequencyType === 'FIFTEEN_DAYS'
      ? 15
      : activeProjectDetail.frequencyType === 'MONTHLY'
      ? 30
      : 7);

  const projStart = activeProjectDetail.startDate
    ? new Date(activeProjectDetail.startDate)
    : new Date();
  const projEnd = activeProjectDetail.endDate
    ? new Date(activeProjectDetail.endDate)
    : new Date(Date.now() + 30 * 86400000);

  // Dynamic period calculation algorithm based on project creation timeline
  const calculatedPeriods: Array<{
    periodNum: number;
    name: string;
    startDateStr: string;
    endDateStr: string;
    isCurrent: boolean;
  }> = [];
  let currStart = new Date(projStart);
  let pIndex = 1;

  while (currStart < projEnd) {
    let currEnd = new Date(currStart.getTime() + freqDays * 86400000);
    if (currEnd > projEnd) currEnd = new Date(projEnd);

    const sStr = currStart.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const eStr = currEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const name =
      activeProjectDetail.frequencyType === 'WEEKLY' ? `Week ${pIndex}` : `Report Period ${pIndex}`;

    const now = new Date();
    const isCurrent = now >= currStart && now <= currEnd;

    calculatedPeriods.push({
      periodNum: pIndex,
      name: `${name} (${sStr} - ${eStr})`,
      startDateStr: sStr,
      endDateStr: eStr,
      isCurrent,
    });

    currStart = new Date(currEnd.getTime() + 86400000);
    pIndex++;
  }

  const currentAcceptance = studentAcceptanceMap[studentEmail] || {
    status: 'PENDING',
    remarks: 'No faculty decision has been recorded for this project yet.',
    acceptedAt: '',
  };

  const [activeTaskPopupModal, setActiveTaskPopupModal] = useState<any>(null);
  const [taskPopupFeedback, setTaskPopupFeedback] = useState<string>('');
  const [taskFilterTab, setTaskFilterTab] = useState<'ACTIVE' | 'COMPLETED' | 'PENDING' | 'ALL'>('ACTIVE');
  const [showScopeModal, setShowScopeModal] = useState<boolean>(false);
  const [idbReports, setIdbReports] = useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchIdbReports = async () => {
      try {
        const rawEmail = (studentEmail || '').trim();
        const cleanEmail = rawEmail.toLowerCase();
        const rep1 = await getReportData(`student_submitted_reports_${cleanEmail}`);
        const rep2 = await getReportData(`student_submitted_reports_${rawEmail}`);
        const repGlobal = await getReportData('global_all_submitted_reports');

        const combined: any[] = [
          ...(Array.isArray(rep1) ? rep1 : []),
          ...(Array.isArray(rep2) ? rep2 : []),
          ...(Array.isArray(repGlobal) ? repGlobal : []),
        ];

        if (isMounted && combined.length > 0) {
          setIdbReports(combined);
        }
      } catch (e) {}
    };
    fetchIdbReports();
    return () => {
      isMounted = false;
    };
  }, [studentEmail]);

  const handleSavePopupDecision = async (decisionStatus: 'ACCEPTED' | 'CHANGE_REQUESTED') => {
    if (!activeTaskPopupModal) return;

    const periodNum = activeTaskPopupModal.periodNum;
    const projId = activeProjectDetail.id || 1;
    const appId =
      viewingStudentProfile.applicationId ||
      viewingStudentProfile.appId ||
      viewingStudentProfile.id ||
      activeProjectDetail.applicationId ||
      activeProjectDetail.appId;
    const rawEmail = (studentEmail || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const currentFeedback = taskPopupFeedback;

    // 1. IMMEDIATELY CLOSE THE FORM POPUP MODAL
    setActiveTaskPopupModal(null);
    setTaskPopupFeedback('');

    const feedbackText =
      currentFeedback.trim() ||
      (decisionStatus === 'ACCEPTED'
        ? 'Deliverables accepted and approved.'
        : 'Please revise task work and resubmit.');

    try {
      const reportsResponse = await api.get(
        `/applications/reports/application/${encodeURIComponent(String(appId || projId))}`
      );
      const report = (Array.isArray(reportsResponse.data) ? reportsResponse.data : []).find(
        (item: any) =>
          Number(item.weekNumber) === Number(periodNum) &&
          (item.studentEmail || '').trim().toLowerCase() === cleanEmail
      );

      if (report?.id) {
        const reviewPath = decisionStatus === 'ACCEPTED' ? 'review' : 'request-revision';
        await api.put(
          `/applications/reports/${report.id}/${reviewPath}`,
          null,
          { params: { feedback: feedbackText } }
        );
      }
    } catch (error) {
      console.warn('Backend report API sync warning (local storage will be updated):', error);
    }

    // Collect ALL matching task_data keys currently in localStorage
    const keysToSaveSet = new Set<string>([
      `task_data_${projId}_${rawEmail}_${periodNum}`,
      `task_data_${projId}_${cleanEmail}_${periodNum}`,
    ]);

    try {
      const allowedProjectTokens = [
        `_${projId}_`,
      ];
      void allowedProjectTokens;
    } catch (e) {}

    const keysToSave = Array.from(keysToSaveSet);

    // Update every matching task_data key
    keysToSave.forEach((k) => {
      const existingRaw = localStorage.getItem(k);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const updated = {
        ...existing,
        ...activeTaskPopupModal.taskData,
        taskNumber: periodNum,
        isSubmitted: true,
        reviewStatus: decisionStatus,
        facultyFeedback: feedbackText,
      };
      localStorage.setItem(k, JSON.stringify(updated));
      saveReportData(k, updated);
    });

    // Also update student_submitted_reports if present
    const reportKeys = [
      `student_submitted_reports_${rawEmail}`,
      `student_submitted_reports_${cleanEmail}`,
    ];

    reportKeys.forEach((rk) => {
      let reportsArr: any[] = [];
      const reportsRaw = localStorage.getItem(rk);
      if (reportsRaw) {
        try { reportsArr = JSON.parse(reportsRaw); } catch (e) {}
      }

      let found = false;
      const updatedReports = reportsArr.map((r: any) => {
        const rAppId = r.applicationId ?? r.appId ?? r.projectId;
        const matchesApp =
          rAppId !== undefined &&
          (String(rAppId) === String(appId) || String(rAppId) === String(projId));
        if (matchesApp && Number(r.weekNumber || r.taskNumber) === Number(periodNum)) {
          found = true;
          return {
            ...r,
            status: decisionStatus === 'ACCEPTED' ? 'APPROVED' : 'NEEDS_REVISION',
            reviewStatus: decisionStatus,
            facultyFeedback: feedbackText,
          };
        }
        return r;
      });

      if (!found) {
        updatedReports.push({
          applicationId: appId || projId,
          projectId: projId,
          weekNumber: periodNum,
          taskNumber: periodNum,
          studentEmail: cleanEmail,
          status: decisionStatus === 'ACCEPTED' ? 'APPROVED' : 'NEEDS_REVISION',
          reviewStatus: decisionStatus,
          facultyFeedback: feedbackText,
          content: activeTaskPopupModal.taskData.studentResponseText || '',
          fileNames: activeTaskPopupModal.taskData.studentFiles || [],
        });
      }

      localStorage.setItem(rk, JSON.stringify(updatedReports));
      saveReportData(rk, updatedReports);
    });

    // Also update global_all_submitted_reports in localStorage and IndexedDB
    try {
      const globalRaw = localStorage.getItem('global_all_submitted_reports');
      let globalList: any[] = globalRaw ? JSON.parse(globalRaw) : [];
      let foundGlobal = false;
      const updatedGlobal = globalList.map((r: any) => {
        const rAppId = r.applicationId ?? r.appId ?? r.projectId;
        const matchesApp =
          rAppId !== undefined &&
          (String(rAppId) === String(appId) || String(rAppId) === String(projId));
        if (
          matchesApp &&
          (r.studentEmail || '').trim().toLowerCase() === cleanEmail &&
          Number(r.weekNumber || r.taskNumber) === Number(periodNum)
        ) {
          foundGlobal = true;
          return {
            ...r,
            status: decisionStatus === 'ACCEPTED' ? 'APPROVED' : 'NEEDS_REVISION',
            reviewStatus: decisionStatus,
            facultyFeedback: feedbackText,
          };
        }
        return r;
      });

      if (!foundGlobal) {
        updatedGlobal.push({
          applicationId: appId || projId,
          projectId: projId,
          weekNumber: periodNum,
          taskNumber: periodNum,
          studentEmail: cleanEmail,
          status: decisionStatus === 'ACCEPTED' ? 'APPROVED' : 'NEEDS_REVISION',
          reviewStatus: decisionStatus,
          facultyFeedback: feedbackText,
          content: activeTaskPopupModal.taskData.studentResponseText || '',
          fileNames: activeTaskPopupModal.taskData.studentFiles || [],
        });
      }

      localStorage.setItem('global_all_submitted_reports', JSON.stringify(updatedGlobal));
      saveReportData('global_all_submitted_reports', updatedGlobal);
    } catch (e) {}

    // Synchronize local idbReports component state immediately
    setIdbReports((prev) => {
      const list = prev || [];
      return [
        {
          applicationId: appId || projId,
          projectId: projId,
          studentEmail: cleanEmail,
          weekNumber: periodNum,
          taskNumber: periodNum,
          status: decisionStatus === 'ACCEPTED' ? 'APPROVED' : 'NEEDS_REVISION',
          reviewStatus: decisionStatus,
          facultyFeedback: feedbackText,
        },
        ...list.filter(
          (r: any) => {
            const rAppId = r.applicationId ?? r.appId ?? r.projectId;
            const matchesApp =
              rAppId !== undefined &&
              (String(rAppId) === String(appId) || String(rAppId) === String(projId));
            return !(
              matchesApp &&
              (r.studentEmail || '').trim().toLowerCase() === cleanEmail &&
              Number(r.weekNumber || r.taskNumber) === Number(periodNum)
            );
          }
        ),
      ];
    });

    // 2. DISPATCH EMAIL & NOTIFICATION TO STUDENT
    const emailSubject =
      decisionStatus === 'ACCEPTED'
        ? `✓ Task ${periodNum} Approved & Accepted!`
        : `⚠️ Revision Requested for Task ${periodNum}`;

    const emailBody =
      decisionStatus === 'ACCEPTED'
        ? `Your Task ${periodNum} submission for "${activeProjectDetail.name || 'Project'}" has been APPROVED.\nFaculty Notes: "${feedbackText}"`
        : `Your Task ${periodNum} submission for "${activeProjectDetail.name || 'Project'}" requires revision.\nFaculty Notes: "${feedbackText}"`;

    const newNotification = {
      id: Date.now(),
      userEmail: cleanEmail,
      email: cleanEmail,
      studentEmail: cleanEmail,
      title: emailSubject,
      message: emailBody,
      timestamp: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      isRead: false,
      read: false,
      type: decisionStatus === 'ACCEPTED' ? 'TASK_ACCEPTED' : 'TASK_REVISION_REQUESTED',
    };

    // Save notification locally for student
    const notifKeys = [`user_notifications_${cleanEmail}`, `user_notifications_${rawEmail}`, 'user_notifications_all'];
    notifKeys.forEach((nk) => {
      try {
        const existingNotifsRaw = localStorage.getItem(nk);
        const existingNotifs = existingNotifsRaw ? JSON.parse(existingNotifsRaw) : [];
        localStorage.setItem(nk, JSON.stringify([newNotification, ...existingNotifs]));
      } catch (e) {}
    });

    // Trigger cross-window storage event for real-time notification update
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('notification-updated', { detail: newNotification }));
      window.dispatchEvent(new CustomEvent('student_report_reviewed', { detail: { periodNum, cleanEmail, feedbackText, decisionStatus } }));
    } catch (e) {}

    // Post to backend notification endpoints for email dispatch
    try {
      api.post('/notifications', {
        email: cleanEmail,
        userEmail: cleanEmail,
        title: emailSubject,
        message: emailBody,
        type: newNotification.type,
      }).catch(() => {});

      api.post('/notifications/send', {
        to: cleanEmail,
        email: cleanEmail,
        subject: emailSubject,
        body: emailBody,
        message: emailBody,
      }).catch(() => {});
    } catch (e) {}

    // 3. SHOW NON-BLOCKING CONFIRMATION TO FACULTY
    setTimeout(() => {
      alert(
        decisionStatus === 'ACCEPTED'
          ? `✓ Task ${periodNum} marked as Accepted! Email notification sent to ${studentName} (${cleanEmail}).`
          : `⚠️ Revision request & email notification sent to ${studentName} (${cleanEmail}) for Task ${periodNum}.`
      );
    }, 50);
  };

  const handlePreviewOrDownloadFile = async (fileName: string, fileUrl?: string, periodNum?: number) => {
    const pNum = periodNum || activeTaskPopupModal?.periodNum;
    const scopeKey = pNum ? `${studentEmail}_task_${pNum}` : undefined;
    await downloadFileHelper(fileName, fileUrl, scopeKey);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
      }}
    >
      {/* 1. COMPACT ELEGANT HEADER BAR */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Student & Project Details Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setViewingStudentProfile(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to Project
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '16px',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
                flexShrink: 0,
              }}
            >
              {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {studentName}
                </h1>
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Briefcase size={12} /> {studentRole}
                </span>
                <span
                  style={{
                    background: currentAcceptance.status === 'ACCEPTED' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: currentAcceptance.status === 'ACCEPTED' ? '#34d399' : '#fbbf24',
                    border:
                      currentAcceptance.status === 'ACCEPTED'
                        ? '1px solid rgba(52, 211, 153, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '2px 10px',
                    fontSize: '10px',
                    fontWeight: 900,
                  }}
                >
                  {currentAcceptance.status}
                </span>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  margin: '3px 0 0 0',
                  fontWeight: 500,
                }}
              >
                {studentEmail} • Project:{' '}
                <strong style={{ color: '#38bdf8' }}>"{activeProjectDetail.name}"</strong>
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* ⚡ Quick Instant Task Button */}
          <button
            onClick={() => {
              setAnytimeTaskForm({
                studentEmail: studentEmail,
                title: '',
                description: '',
                instructions: '',
                completionDays: '3',
                customDays: 3,
                dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                priority: 'HIGH',
                isQuickTask: true,
                taskType: 'QUICK_INSTANT_TASK',
                projectId: activeProjectDetail?.id || '',
              });
              setShowAssignTaskAnytimeModal(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Zap size={14} /> ⚡ Quick Instant Task
          </button>

          {/* 📅 Scheduled Meet Button */}
          <button
            type="button"
            onClick={() => navigate('/faculty/schedules')}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Calendar size={14} /> 📅 Scheduled Meet
          </button>

          {/* 📌 Assigned Task & Responsibilities Button */}
          <button
            type="button"
            onClick={() => setShowScopeModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ClipboardList size={13} style={{ color: '#38bdf8' }} /> 📌 Assigned Task &amp; Responsibilities
          </button>

          {/* 📝 Edit Role Button */}
          <button
            onClick={() => handleOpenSingleEditModal(viewingStudentProfile)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Edit3 size={13} /> Edit Role
          </button>

          {/* 📄 View Resume Button */}
          <button
            onClick={() => setShowWorkspaceResumeModal(true)}
            style={{
              background: 'rgba(56, 189, 248, 0.14)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="View candidate resume PDF or document"
          >
            <FileText size={13} style={{ color: '#38bdf8' }} /> View Resume ↗
          </button>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            disabled={certificateApproved}
            style={{
              background: certificateApproved ? 'rgba(52, 211, 153, 0.14)' : 'rgba(245, 158, 11, 0.15)',
              color: certificateApproved ? '#34d399' : '#fbbf24',
              border: `1px solid ${certificateApproved ? 'rgba(52, 211, 153, 0.35)' : 'rgba(245, 158, 11, 0.4)'}`,
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: certificateApproved ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={certificateApproved ? 'Certificate already approved' : 'Approve and issue the internship certificate'}
          >
            {certificateApproved ? <CheckCircle2 size={13} /> : <Award size={13} />}
            {certificateApproved ? 'Certificate Approved' : 'Approve Certificate'}
          </button>
        </div>
      </div>

      {/* 2. MAIN FULL-WIDTH DASHBOARD CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>

        {/* TASK GRID CARDS SECTION - FULL PAGE WIDTH */}
        <div
          style={{
            background: 'rgba(8, 19, 48, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckSquare size={18} style={{ color: '#38bdf8' }} /> Project Tasks Grid Cards
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0 0', fontWeight: 500 }}>
                Click any task card to view task given details &amp; student submitted work in a popup modal.
              </p>
            </div>
          </div>

          {/* PRE-PROCESS PERIODS FOR TASK FILTERS & TOP 3 BUTTONS */}
          {(() => {
            const periodsWithData = calculatedPeriods.map((period) => {
              const projId = activeProjectDetail.id || 1;
              const appId = activeProjectDetail.applicationId || activeProjectDetail.appId;
              const periodNum = period.periodNum;
              const rawStudentEmail = (studentEmail || '').trim();
              const cleanStudentEmail = rawStudentEmail.toLowerCase();

              // 1. Try retrieving saved task data using case-insensitive email keys and fallback scanning
              let savedTaskRaw: string | null = null;
              const taskKeyCandidates = [
                `task_data_${projId}_${rawStudentEmail}_${periodNum}`,
                `task_data_${projId}_${cleanStudentEmail}_${periodNum}`,
              ].filter(Boolean) as string[];

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
                  ];
                  void allowedProjectTokens;
                } catch (e) {}
              }

              let taskData = savedTaskRaw ? JSON.parse(savedTaskRaw) : null;

              // Sanity check stale task_data from prior corrupted sessions: if reviewStatus says
              // ACCEPTED/APPROVED but there is zero evidence of actual work inside this specific
              // task record (no student submission text, no files, no submission history entries),
              // treat it as NOT_ASSIGNED (prevents Task-1 auto-completed bleed across projects).
              if (taskData) {
                const hasAcceptedBakedIn =
                  taskData.reviewStatus === 'ACCEPTED' || taskData.reviewStatus === 'APPROVED & REVIEWED';
                const submissionEntries = Array.isArray(taskData.submissionHistory)
                  ? taskData.submissionHistory.length
                  : 0;
                const hasFacultyReviewEvidence = Boolean(
                  taskData.facultyFeedback && taskData.facultyFeedback.trim() !== ''
                );
                const hasStudentWorkEvidence = Boolean(
                  (taskData.studentResponseText && taskData.studentResponseText.trim() !== '') ||
                  (taskData.studentFiles && taskData.studentFiles.length > 0) ||
                  (taskData.studentFilesData && taskData.studentFilesData.length > 0) ||
                  submissionEntries > 0 ||
                  taskData.reviewStatus === 'SUBMITTED' ||
                  taskData.reviewStatus === 'CHANGE_REQUESTED' ||
                  taskData.reviewStatus === 'RESUBMITTED' ||
                  taskData.isSubmitted === true
                );
                if (hasAcceptedBakedIn && !hasStudentWorkEvidence && !hasFacultyReviewEvidence) {
                  taskData.isAssigned = false;
                  taskData.isSubmitted = false;
                  taskData.studentResponseText = '';
                  taskData.studentFiles = [];
                  taskData.studentFilesData = [];
                  taskData.submissionHistory = [];
                  taskData.reviewStatus = 'NOT_ASSIGNED';
                  taskData.facultyFeedback = '';
                }
              }

              // 2. Check student_submitted_reports_${studentEmail} with case-insensitive variants
              let reportsRaw =
                localStorage.getItem(`student_submitted_reports_${cleanStudentEmail}`) ||
                localStorage.getItem(`student_submitted_reports_${rawStudentEmail}`);

              if (!reportsRaw) {
                try {
                  for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('student_submitted_reports_')) {
                      if (cleanStudentEmail && k.toLowerCase().includes(cleanStudentEmail)) {
                        reportsRaw = localStorage.getItem(k);
                        if (reportsRaw) break;
                      }
                    }
                  }
                } catch (e) {}
              }

              let studentReport: any = null;
              if (reportsRaw) {
                try {
                  const reportsArr = JSON.parse(reportsRaw);
                  studentReport = reportsArr.find((r: any) => {
                    const rAppId = r.applicationId ?? r.appId ?? r.projectId;
                    const matchesApp =
                      rAppId !== undefined &&
                      (String(rAppId) === String(appId) || String(rAppId) === String(projId));
                    return matchesApp && Number(r.weekNumber || r.taskNumber) === Number(periodNum);
                  });
                } catch (e) {}
              }

              if (!studentReport) {
                try {
                  const globalRaw = localStorage.getItem('global_all_submitted_reports');
                  if (globalRaw) {
                    const globalList = JSON.parse(globalRaw);
                    studentReport = globalList.find((r: any) => {
                      const rAppId = r.applicationId ?? r.appId ?? r.projectId;
                      const matchesApp =
                        rAppId !== undefined &&
                        (String(rAppId) === String(appId) || String(rAppId) === String(projId));
                      return (
                        matchesApp &&
                        (r.studentEmail || '').trim().toLowerCase() === cleanStudentEmail &&
                        Number(r.weekNumber || r.taskNumber) === Number(periodNum)
                      );
                    });
                  }
                } catch (e) {}
              }

              if (!studentReport && idbReports.length > 0) {
                studentReport = idbReports.find((r: any) => {
                  const rAppId = r.applicationId ?? r.appId ?? r.projectId;
                  const matchesApp =
                    rAppId !== undefined &&
                    (String(rAppId) === String(appId) || String(rAppId) === String(projId));
                  return (
                    matchesApp &&
                    (r.studentEmail || '').trim().toLowerCase() === cleanStudentEmail &&
                    Number(r.weekNumber || r.taskNumber) === Number(periodNum)
                  );
                });
              }

              if (studentReport) {
                if (!taskData) {
                  taskData = {
                    taskNumber: periodNum,
                    title: `Task ${periodNum}`,
                    instructions: periodNum === 1 ? (studentTask || 'Assigned candidate task instructions') : `Task ${periodNum} details for ${studentName || 'the student'}.`,
                    dueDate: period.endDateStr,
                    isAssigned: true,
                    reviewStatus: 'SUBMITTED',
                  };
                }
                taskData.isSubmitted = true;
                if (studentReport.content || studentReport.studentResponseText) {
                  taskData.studentResponseText = studentReport.content || studentReport.studentResponseText;
                }
                if (studentReport.fileNames && studentReport.fileNames.length > 0) {
                  taskData.studentFiles = studentReport.fileNames;
                } else if (studentReport.filesData && studentReport.filesData.length > 0) {
                  taskData.studentFiles = studentReport.filesData.map((f: any) => f.name || f);
                } else if (studentReport.studentFiles && studentReport.studentFiles.length > 0) {
                  taskData.studentFiles = studentReport.studentFiles;
                }
                if (studentReport.filesData) {
                  taskData.studentFilesData = studentReport.filesData;
                }
                if (studentReport.submissionHistory) {
                  taskData.submissionHistory = studentReport.submissionHistory;
                }
                if (studentReport.facultyFeedback) {
                  taskData.facultyFeedback = studentReport.facultyFeedback;
                }
                const isAcceptedReport =
                  taskData?.reviewStatus === 'ACCEPTED' ||
                  taskData?.reviewStatus === 'APPROVED & REVIEWED' ||
                  studentReport?.status === 'APPROVED' ||
                  studentReport?.status === 'ACCEPTED' ||
                  studentReport?.reviewStatus === 'ACCEPTED';

                const isChangeRequestedReport =
                  taskData?.reviewStatus === 'CHANGE_REQUESTED' ||
                  studentReport?.status === 'NEEDS_REVISION' ||
                  studentReport?.status === 'CHANGE_REQUESTED' ||
                  studentReport?.reviewStatus === 'CHANGE_REQUESTED';

                if (isAcceptedReport) {
                  taskData.reviewStatus = 'ACCEPTED';
                } else if (isChangeRequestedReport) {
                  taskData.reviewStatus = 'CHANGE_REQUESTED';
                } else if (studentReport?.status === 'SUBMITTED' && taskData.reviewStatus !== 'ACCEPTED' && taskData.reviewStatus !== 'CHANGE_REQUESTED') {
                  taskData.reviewStatus = 'SUBMITTED';
                }
              }

              if (!taskData) {
                taskData = {
                  taskNumber: periodNum,
                  title: `Task ${periodNum}`,
                  instructions: periodNum === 1 ? (studentTask || `Task ${periodNum} details for ${studentName || 'the student'}.`) : `Task ${periodNum} details for ${studentName || 'the student'}.`,
                  dueDate: period.endDateStr,
                  isAssigned: false,
                  isSubmitted: false,
                  studentResponseText: '',
                  studentFiles: [],
                  studentFilesData: [],
                  reviewStatus: 'NOT_ASSIGNED',
                  facultyFeedback: '',
                };
              } else {
                if (taskData.title === 'Task 1' || taskData.title === 'Assigned Module Role' || taskData.title === 'Task 1 - Assigned Module Role') {
                  taskData.title = `Task ${periodNum}`;
                }
                if ((taskData.instructions || '').toLowerCase().includes('assigned candidate task instructions') && taskData.taskNumber !== periodNum) {
                  taskData.instructions = `Task ${periodNum} details for ${studentName || 'the student'}.`;
                }
                if (
                  taskData.studentResponseText ||
                  (taskData.studentFiles && taskData.studentFiles.length > 0) ||
                  (taskData.studentFilesData && taskData.studentFilesData.length > 0) ||
                  (taskData.submissionHistory && taskData.submissionHistory.length > 0) ||
                  taskData.reviewStatus === 'SUBMITTED' ||
                  taskData.reviewStatus === 'ACCEPTED' ||
                  taskData.reviewStatus === 'CHANGE_REQUESTED'
                ) {
                  taskData.isSubmitted = true;
                }

                if (!taskData.studentFiles) {
                  taskData.studentFiles = taskData.studentFilesData
                    ? taskData.studentFilesData.map((f: any) => (typeof f === 'string' ? f : f.name))
                    : [];
                }
              }

              const isGood = taskData.reviewStatus === 'ACCEPTED' || taskData.reviewStatus === 'APPROVED & REVIEWED';
              const isPending = !taskData.isAssigned || taskData.reviewStatus === 'NOT_ASSIGNED' || (!taskData.isSubmitted && taskData.reviewStatus !== 'ACCEPTED');
              const isActive = (taskData.isAssigned && !isGood) || taskData.reviewStatus === 'SUBMITTED' || taskData.reviewStatus === 'CHANGE_REQUESTED' || period.isCurrent;

              return { ...period, taskData, isGood, isPending, isActive };
            });

            const activeCount = periodsWithData.filter((p) => p.isActive).length;
            const completedCount = periodsWithData.filter((p) => p.isGood).length;
            const pendingCount = periodsWithData.filter((p) => p.isPending).length;
            const allCount = periodsWithData.length;

            const filteredPeriods = periodsWithData.filter((p) => {
              if (taskFilterTab === 'ACTIVE') return p.isActive;
              if (taskFilterTab === 'COMPLETED') return p.isGood;
              if (taskFilterTab === 'PENDING') return p.isPending;
              return true; // 'ALL'
            });

            return (
              <>
                {/* TOP 3 FILTER BUTTONS (ACTIVE, COMPLETED, PENDING) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setTaskFilterTab('ACTIVE')}
                    style={{
                      background: taskFilterTab === 'ACTIVE' ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: taskFilterTab === 'ACTIVE' ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: taskFilterTab === 'ACTIVE' ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none',
                    }}
                  >
                    ⚡ Active ({activeCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskFilterTab('COMPLETED')}
                    style={{
                      background: taskFilterTab === 'COMPLETED' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: taskFilterTab === 'COMPLETED' ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: taskFilterTab === 'COMPLETED' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                  >
                    ✓ Completed ({completedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskFilterTab('PENDING')}
                    style={{
                      background: taskFilterTab === 'PENDING' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: taskFilterTab === 'PENDING' ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: taskFilterTab === 'PENDING' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                    }}
                  >
                    ⏳ Pending ({pendingCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskFilterTab('ALL')}
                    style={{
                      background: taskFilterTab === 'ALL' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    All Tasks ({allCount})
                  </button>
                </div>

                {filteredPeriods.length === 0 ? (
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                    No {taskFilterTab.toLowerCase()} tasks found for this student.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {filteredPeriods.map((period) => {
                      const { taskData } = period;

              const isQuickTask = taskData.isQuickTask || taskData.priority === 'HIGH' || taskData.taskType === 'QUICK_INSTANT_TASK' || taskData.title?.includes('⚡');

              let badge = { label: 'No Task Given', bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: 'rgba(255, 255, 255, 0.15)' };
              if (taskData.reviewStatus === 'ACCEPTED') {
                badge = { label: 'Good / Accepted ✓', bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' };
              } else if (taskData.reviewStatus === 'CHANGE_REQUESTED') {
                badge = { label: 'Change Requested ⚠️', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
              } else if (taskData.isSubmitted || taskData.reviewStatus === 'SUBMITTED') {
                badge = { label: 'Submitted - Review ⚡', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
              } else if (taskData.isAssigned) {
                badge = isQuickTask
                  ? { label: '⚡ Quick Task Assigned', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' }
                  : { label: 'Task Given', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
              }

              return (
                <div
                  key={period.periodNum}
                  onClick={() => {
                    setActiveTaskPopupModal({ ...period, taskData });
                    setTaskPopupFeedback(taskData.facultyFeedback || '');
                  }}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: taskData.isSubmitted ? '2px solid #f59e0b' : period.isCurrent ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
                      Task {period.periodNum}
                    </span>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 900,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Window: {period.startDateStr} → {period.endDateStr}
                  </div>

                  {taskData.isAssigned ? (
                    <div style={{ background: 'rgba(5, 12, 30, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '10px 12px', fontSize: '12px' }}>
                      {isQuickTask && (
                        <span style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', display: 'inline-block' }}>
                          ⚡ QUICK / EXTRA TASK
                        </span>
                      )}
                      <div style={{ fontWeight: 800, color: '#ffffff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {taskData.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {taskData.instructions || 'Task instructions given.'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(5, 12, 30, 0.5)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>
                      + Click to Give Task {period.periodNum}
                    </div>
                  )}

                  {/* SUBMITTED WORK BANNER ON FACULTY TASK CARD */}
                  {taskData.isSubmitted && (
                    <div
                      style={{
                        background: 'rgba(52, 211, 153, 0.1)',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📥 Student Work Submitted
                        </span>
                        {taskData.studentFiles && taskData.studentFiles.length > 0 && (
                          <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '6px', fontWeight: 900 }}>
                            📄 {taskData.studentFiles.length} file{taskData.studentFiles.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {taskData.studentResponseText && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#cbd5e1',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.45,
                            marginTop: '2px',
                          }}
                        >
                          "{taskData.studentResponseText}"
                        </div>
                      )}
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px', textAlign: 'right' }}>
                        Click card to view details &amp; review ➔
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS ON CARD */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnytimeTaskForm({
                          studentEmail: studentEmail,
                          title: taskData.title || `Task ${period.periodNum}`,
                          description: taskData.instructions || '',
                          instructions: taskData.instructions || '',
                          completionDays: String(freqDays),
                          customDays: freqDays,
                          dueDate: taskData.dueDate || period.endDateStr,
                          priority: 'MEDIUM',
                          projectId: activeProjectDetail?.id || '',
                          taskNumber: period.periodNum,
                        });
                        setShowAssignTaskAnytimeModal(true);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={12} /> {taskData.isAssigned ? 'Edit Task' : 'Give Task'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskPopupModal({ ...period, taskData });
                        setTaskPopupFeedback(taskData.facultyFeedback || '');
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={12} style={{ color: '#38bdf8' }} /> View Details →
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

      {/* RICH FLOATING POPUP MODAL SHOWING ALL TASK GIVEN & SUBMITTED DELIVERABLES */}
      {activeTaskPopupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={() => setActiveTaskPopupModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#081330',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#ffffff',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckSquare size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      Task {activeTaskPopupModal.periodNum}: {activeTaskPopupModal.taskData.title || `Task ${activeTaskPopupModal.periodNum}`}
                    </h2>
                    {(activeTaskPopupModal.taskData.isQuickTask || activeTaskPopupModal.taskData.priority === 'HIGH' || activeTaskPopupModal.taskData.taskType === 'QUICK_INSTANT_TASK') && (
                      <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 900 }}>
                        ⚡ EXTRA TASK
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                    Window: <strong style={{ color: '#ffffff' }}>{activeTaskPopupModal.startDateStr} → {activeTaskPopupModal.endDateStr}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTaskPopupModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#cbd5e1',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* SECTION 1: TASK INSTRUCTIONS GIVEN BY FACULTY */}
            <div
              style={{
                background: '#050c1e',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📌 TASK INSTRUCTIONS (FACULTY)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const pNum = activeTaskPopupModal.periodNum;
                    const tData = activeTaskPopupModal.taskData;
                    setActiveTaskPopupModal(null);
                    setAnytimeTaskForm({
                      studentEmail: studentEmail,
                      title: tData.title || `Task ${pNum}`,
                      description: tData.instructions || '',
                      instructions: tData.instructions || '',
                      completionDays: String(freqDays),
                      customDays: freqDays,
                      dueDate: tData.dueDate || activeTaskPopupModal.endDateStr,
                      priority: 'MEDIUM',
                      projectId: activeProjectDetail?.id || '',
                      taskNumber: pNum,
                    });
                    setShowAssignTaskAnytimeModal(true);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={12} /> {activeTaskPopupModal.taskData.isAssigned ? 'Edit Instructions' : 'Add Instructions'}
                </button>
              </div>

              {activeTaskPopupModal.taskData.isAssigned ? (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                    {activeTaskPopupModal.taskData.title}
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {activeTaskPopupModal.taskData.instructions || 'No detailed instructions added.'}
                  </p>
                  {activeTaskPopupModal.taskData.dueDate && (
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, marginTop: '2px' }}>
                      📅 Target Due Date: {activeTaskPopupModal.taskData.dueDate}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '8px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                  No instructions assigned yet for Task {activeTaskPopupModal.periodNum}. Click <strong>"+ Add Instructions"</strong> above.
                </div>
              )}
            </div>

            {/* SECTION 2: WORK SUBMITTED BY STUDENT */}
            <div
              style={{
                background: '#050c1e',
                border: activeTaskPopupModal.taskData.isSubmitted ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📥 STUDENT SUBMISSION ({studentName})
                </span>
                <span
                  style={{
                    background: activeTaskPopupModal.taskData.isSubmitted ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    color: activeTaskPopupModal.taskData.isSubmitted ? '#34d399' : '#94a3b8',
                    border: activeTaskPopupModal.taskData.isSubmitted ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '2px 10px',
                    fontSize: '10px',
                    fontWeight: 900,
                  }}
                >
                  {activeTaskPopupModal.taskData.isSubmitted ? 'WORK RECEIVED ✓' : 'AWAITING SUBMISSION'}
                </span>
              </div>

              {activeTaskPopupModal.taskData.isSubmitted ? (
                <>
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#ffffff', lineHeight: 1.5 }}>
                    <strong style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Student Response &amp; Report:</strong>
                    <div style={{ color: '#cbd5e1', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                      {activeTaskPopupModal.taskData.studentResponseText || 'Student submitted task completion report.'}
                    </div>
                  </div>

                  {/* Submitted Deliverable Files */}
                  {activeTaskPopupModal.taskData.studentFiles && activeTaskPopupModal.taskData.studentFiles.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={13} style={{ color: '#38bdf8' }} /> ATTACHED DELIVERABLES ({activeTaskPopupModal.taskData.studentFiles.length}):
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {activeTaskPopupModal.taskData.studentFiles.map((fileItem: any, i: number) => {
                          const fileName = typeof fileItem === 'string' ? fileItem : fileItem.name;
                          const fileUrl = typeof fileItem === 'object' ? fileItem.url : activeTaskPopupModal.taskData.studentFilesData?.find((f: any) => f.name === fileName)?.url;

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handlePreviewOrDownloadFile(fileName, fileUrl)}
                              title="Click to Preview & Download File"
                              style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: 800,
                                color: '#38bdf8',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span>📄 {fileName}</span>
                              <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', borderRadius: '4px', padding: '1px 6px', fontWeight: 900 }}>
                                ⬇ Preview / Download
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontStyle: 'italic', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px' }}>
                  Student has not submitted completed work for Task {activeTaskPopupModal.periodNum} yet.
                </div>
              )}
            </div>

            {/* SECTION 3: FACULTY EVALUATION & DECISION CONTROLS */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FACULTY REVIEW NOTES &amp; REVISION FEEDBACK
              </label>

              {activeTaskPopupModal.taskData.facultyFeedback && (
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#38bdf8' }}>
                  <strong style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '3px' }}>Saved Faculty Feedback:</strong>
                  "{activeTaskPopupModal.taskData.facultyFeedback}"
                </div>
              )}

              <textarea
                rows={2}
                value={taskPopupFeedback}
                onChange={(e) => setTaskPopupFeedback(e.target.value)}
                placeholder="Enter review notes before accepting or requesting revision..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#050c1e',
                  color: '#ffffff',
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleSavePopupDecision('ACCEPTED')}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  ✓ Accept &amp; Approve Work
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePopupDecision('CHANGE_REQUESTED')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ⚠️ Request Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNED TASK & RESPONSIBILITIES FLOATING POPUP MODAL */}
      {showScopeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={() => setShowScopeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#081330',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              maxWidth: '540px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ClipboardList size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    Assigned Task &amp; Responsibilities
                  </h2>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
                    Candidate: <strong style={{ color: '#ffffff' }}>{studentName}</strong> ({studentEmail})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowScopeModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#cbd5e1',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: '#050c1e', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                Assigned Candidate Role
              </div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#38bdf8', marginBottom: '14px' }}>
                {studentRole}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                Primary Deliverables &amp; Instructions
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500, lineHeight: 1.5, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '12px' }}>
                {studentTask}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                Frequency: <strong style={{ color: '#38bdf8' }}>{activeProjectDetail.frequencyType || 'WEEKLY'} ({freqDays} Days)</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowScopeModal(false);
                  handleOpenSingleEditModal(viewingStudentProfile);
                }}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                }}
              >
                <Edit3 size={13} /> Edit Role &amp; Task
              </button>
            </div>
          </div>
        </div>
      )}

      <ViewResumeModal
        isOpen={showWorkspaceResumeModal}
        onClose={() => setShowWorkspaceResumeModal(false)}
        student={viewingStudentProfile}
      />
      <IssueCertificateModal
        show={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        application={certificateApplication}
        facultyEmail={facultyEmail}
        onCertificateIssued={() => setCertificateApproved(true)}
      />
    </div>
  );
};
