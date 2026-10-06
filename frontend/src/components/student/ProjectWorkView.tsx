import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SAMPLE_APPLICATIONS } from '../../constants/defaultInternships';
import { Spinner } from './ui';
import ProjectListPage from './project/ProjectListPage';
import WeekGridPage from './project/WeekGridPage';
import WeekDetailPage from './project/WeekDetailPage';
import RequestMeetingModal from './modals/RequestMeetingModal';
import { saveFileContent, saveReportData, getReportData } from '../../utils/fileStorage';

export const ProjectWorkView = ({ studentEmail }: { studentEmail: string }) => {
  const [activeApps, setActiveApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Form states
  const [reportContent, setReportContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: '', description: '', startTime: '' });
  const [submittingMeeting, setSubmittingMeeting] = useState(false);

  // Submission confirmation state
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);

  useEffect(() => {
    fetchActiveApps();
  }, [studentEmail]);

  const syncProjectDetailsForStudent = (app: any) => {
    if (!app) return app;
    const facultyEmail = app.facultyEmail;
    const sEmail = studentEmail || app.studentEmail || app.email;

    let facultyProjects: any[] = [];
    if (facultyEmail) {
      const savedProjectsKey = `faculty_projects_v2_${facultyEmail}`;
      const savedProjectsRaw = localStorage.getItem(savedProjectsKey);
      if (savedProjectsRaw) {
        try {
          facultyProjects = JSON.parse(savedProjectsRaw);
        } catch (e) {}
      }
    }

    if (facultyProjects.length === 0) {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('faculty_projects_v2_'));
      for (const key of keys) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) {
            facultyProjects = [...facultyProjects, ...parsed];
          }
        } catch (e) {}
      }
    }

    const appInternshipId = app.internshipId ?? app.internship?.id;
    const appProjectId = app.projectId ?? app.id;
    const appFacultyEmail = (facultyEmail || '').trim().toLowerCase();
    const appInternshipTitle = (app.internshipTitle || '').trim().toLowerCase();
    const appProjectTitle = (app.projectTitle || '').trim().toLowerCase();

    const candidateProjects = facultyProjects.filter((proj: any) => {
      const projId = proj.id ?? proj.projectId;
      const projInternshipId = proj.internshipId ?? proj.internship?.id;
      const projFacultyEmail = (proj.facultyEmail || '').trim().toLowerCase();
      const projInternshipTitle = (proj.internshipTitle || '').trim().toLowerCase();
      const projName = (proj.name || '').trim().toLowerCase();

      const sameProjectId = appProjectId != null && projId != null && String(projId) === String(appProjectId);
      const sameInternshipId = appInternshipId != null && projInternshipId != null && String(projInternshipId) === String(appInternshipId);
      const sameFaculty = Boolean(appFacultyEmail && projFacultyEmail && projFacultyEmail === appFacultyEmail);
      const sameTitle = Boolean(
        appInternshipTitle &&
        (projInternshipTitle === appInternshipTitle || projName === appProjectTitle || projName === appInternshipTitle)
      );

      if (sameProjectId || sameInternshipId) return true;
      if (sameFaculty && sameTitle) return true;
      return false;
    });

    const matchedProject =
      candidateProjects.find((proj: any) => {
        const assigneeEmails = (proj.assignedApplicants || []).map((a: any) => (a.studentEmail || a.email || '').trim().toLowerCase());
        const isStudentAssigned = assigneeEmails.includes((sEmail || '').trim().toLowerCase());
        const isExactProjectLink =
          (appProjectId != null && (proj.id ?? proj.projectId) != null && String(proj.id ?? proj.projectId) === String(appProjectId)) ||
          (appInternshipId != null && (proj.internshipId ?? proj.internship?.id) != null && String(proj.internshipId ?? proj.internship?.id) === String(appInternshipId));

        if (isExactProjectLink && isStudentAssigned) return true;
        if (isStudentAssigned) return true;
        return false;
      }) ||
      candidateProjects.find((proj: any) => {
        const projInternshipTitle = (proj.internshipTitle || '').trim().toLowerCase();
        const projName = (proj.name || '').trim().toLowerCase();
        return (
          Boolean(appInternshipTitle) &&
          (projInternshipTitle === appInternshipTitle || projName === appInternshipTitle || projName === appProjectTitle)
        );
      }) ||
      candidateProjects[0];

    if (matchedProject) {
      const assignedItem = matchedProject.assignedApplicants?.find(
        (a: any) => (a.studentEmail || a.email || '').toLowerCase() === (sEmail || '').toLowerCase()
      );

      return {
        ...app,
        projectId: matchedProject.id,
        projectTitle: matchedProject.name || matchedProject.projectTitle || app.internshipTitle,
        projectDescription: matchedProject.description || app.projectDescription || 'Faculty assigned project responsibilities',
        internshipStartDate: matchedProject.startDate || app.internshipStartDate || new Date().toISOString().split('T')[0],
        internshipEndDate: matchedProject.endDate || app.internshipEndDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        projectAccepted: app.projectAccepted === true,
        projectRejected: Boolean(app.projectRejected),
        assignedRole: assignedItem?.role || 'Intern',
        assignedTask: assignedItem?.task || assignedItem?.description || '',
      };
    }

    return {
      ...app,
      projectTitle: null,
      projectDescription: app.projectDescription || 'Faculty assigned project responsibilities',
      internshipStartDate: app.internshipStartDate || new Date().toISOString().split('T')[0],
      internshipEndDate: app.internshipEndDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      projectAccepted: app.projectAccepted === true,
      projectRejected: Boolean(app.projectRejected),
    };
  };

  const fetchActiveApps = async () => {
    try {
      const res = await api.get(`/applications/student?email=${studentEmail}`);
      let rawApps = Array.isArray(res.data) ? res.data : [];

      if (rawApps.length === 0) {
        const emailMatch = SAMPLE_APPLICATIONS.filter(
          (a: any) => (a.studentEmail || '').trim().toLowerCase() === (studentEmail || '').trim().toLowerCase()
        );
        rawApps = emailMatch.length > 0 ? emailMatch : SAMPLE_APPLICATIONS;
      }

      const activeStatusSet = new Set(['SELECTED', 'ACCEPTED', 'HIRED', 'OFFER_ACCEPTED', 'ACTIVE']);
      const apps = rawApps
        .filter((a: any) => {
          const status = String(a.status || '').trim().toUpperCase();
          return activeStatusSet.has(status) || a.projectAccepted === true || a.projectRejected === false;
        })
        .map((a: any) => syncProjectDetailsForStudent(a));

      setActiveApps(apps);
      if (apps.length === 1) {
        setSelectedApp(apps[0]);
        fetchReports(apps[0].id);
        fetchMeetings(apps[0].facultyEmail);
      }
    } catch (e) {
      console.error('Error fetching student applications:', e);
      const fallback = SAMPLE_APPLICATIONS.filter((a: any) => {
        const email = (a.studentEmail || '').trim().toLowerCase();
        return email === (studentEmail || '').trim().toLowerCase() || !!studentEmail === false;
      });
      const apps = (fallback.length > 0 ? fallback : SAMPLE_APPLICATIONS)
        .filter((a: any) => {
          const status = String(a.status || '').trim().toUpperCase();
          return ['SELECTED', 'ACCEPTED', 'HIRED', 'OFFER_ACCEPTED', 'ACTIVE'].includes(status) || a.projectAccepted === true;
        })
        .map((a: any) => syncProjectDetailsForStudent(a));
      setActiveApps(apps);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (appId: number) => {
    try {
      const response = await api.get(`/applications/reports/student/all?email=${encodeURIComponent(studentEmail)}`);
      const backendReports = Array.isArray(response.data)
        ? response.data.filter((r: any) => !r.applicationId || Number(r.applicationId) === Number(appId))
        : [];
      if (backendReports.length > 0) {
        setReports(backendReports);
        return;
      }
    } catch (e) {
      console.warn('Could not load reports from the application service:', e);
    }

    let localReports: any[] = [];
    const savedReportsRaw =
      localStorage.getItem(`student_submitted_reports_${studentEmail}`) ||
      localStorage.getItem(`student_submitted_reports_${studentEmail.toLowerCase()}`);

    if (savedReportsRaw) {
      try {
        localReports = JSON.parse(savedReportsRaw);
      } catch (err) {}
    }

    if (localReports.length === 0) {
      try {
        const idbData =
          (await getReportData(`student_submitted_reports_${studentEmail.toLowerCase()}`)) ||
          (await getReportData(`student_submitted_reports_${studentEmail}`));

        if (idbData && Array.isArray(idbData) && idbData.length > 0) {
          localReports = idbData;
        } else {
          const globalData =
            (await getReportData('global_all_submitted_reports')) ||
            localStorage.getItem('global_all_submitted_reports');
          if (globalData) {
            const parsedGlobal = typeof globalData === 'string' ? JSON.parse(globalData) : globalData;
            if (Array.isArray(parsedGlobal)) {
              localReports = parsedGlobal.filter(
                (r: any) =>
                  (r.studentEmail || '').trim().toLowerCase() === (studentEmail || '').trim().toLowerCase()
              );
            }
          }
        }
      } catch (e) {}
    }

    const filtered = localReports.filter((r: any) => r.applicationId && r.applicationId === appId);
    setReports(filtered);
  };

  const fetchMeetings = async (facultyEmail: string) => {
    try {
      const res = await api.get(`/meetings/participant?email=${studentEmail}`);
      setMeetings(res.data ? res.data.filter((m: any) => m.hostEmail === facultyEmail) : []);
    } catch (e) {
      console.warn('Error fetching meetings:', e);
      setMeetings([]);
    }
  };

  const handleAccept = async (appId: number) => {
    try {
      await api.put(`/applications/${appId}/accept-project`);
      fetchActiveApps();
      if (selectedApp?.id === appId) {
        setSelectedApp((prev: any) => ({ ...prev, projectAccepted: true, projectRejected: false }));
      }
    } catch (e) {
      alert('Failed to accept project');
    }
  };

  const handleReject = async (appId: number) => {
    try {
      await api.put(`/applications/${appId}/reject-project`);
      fetchActiveApps();
      if (selectedApp?.id === appId) {
        setSelectedApp((prev: any) => ({ ...prev, projectAccepted: false, projectRejected: true }));
      }
    } catch (e) {
      alert('Failed to reject project');
    }
  };

  const safeLocalStorageSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e: any) {
      console.warn(`localStorage quota exceeded for key "${key}", attempting automatic cleanup:`, e);
      try {
        const removeEmbeddedData = (item: any): any => {
          if (typeof item === 'string') {
            return /^data:[^,]*;base64,/i.test(item) ? '' : item;
          }
          if (Array.isArray(item)) return item.map(removeEmbeddedData);
          if (item && typeof item === 'object') {
            return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, removeEmbeddedData(v)]));
          }
          return item;
        };

        const storedKeys = Object.keys(localStorage);
        for (const storedKey of storedKeys) {
          if (storedKey.startsWith('file_data_')) {
            localStorage.removeItem(storedKey);
            continue;
          }
          if (
            !storedKey.startsWith('task_data_') &&
            !storedKey.startsWith('student_submitted_reports_') &&
            !storedKey.startsWith('report_') &&
            storedKey !== 'global_all_submitted_reports'
          ) continue;

          try {
            const storedValue = localStorage.getItem(storedKey);
            if (storedValue) {
              localStorage.setItem(storedKey, JSON.stringify(removeEmbeddedData(JSON.parse(storedValue))));
            }
          } catch {}
        }
        localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.warn(`Could not save key "${key}" to localStorage due to browser storage quota limits:`, err);
        return false;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const maxFileSize = 25 * 1024 * 1024;
      const validFiles = newFiles.filter((file) => file.size <= maxFileSize);
      const oversizedFiles = newFiles.filter((file) => file.size > maxFileSize);

      if (oversizedFiles.length > 0) {
        alert(`Files must be 25 MB or smaller: ${oversizedFiles.map((file) => file.name).join(', ')}`);
      }
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        if (!selectedFile) setSelectedFile(validFiles[0]);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setSelectedFile(null);
      else setSelectedFile(updated[0]);
      return updated;
    });
  };

  const promptSubmitTask = () => {
    if (!reportContent.trim() && selectedFiles.length === 0 && !selectedFile) {
      return alert('Please write a report or attach at least one file before submitting.');
    }
    setShowSubmitConfirmModal(true);
  };

  const executeSubmitReport = async () => {
    if (!selectedApp || selectedWeek === null) return;
    setSubmittingTask(true);
    try {
      const filesToUpload = selectedFiles.length > 0 ? selectedFiles : selectedFile ? [selectedFile] : [];
      const fileNames = filesToUpload.map((f: File) => f.name);

      const studentFilesData = await Promise.all(
        filesToUpload.map((file) => {
          return new Promise<{ name: string; type: string; url: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const urlStr = (e.target?.result as string) || '';
              if (urlStr) {
                await saveFileContent(file.name, urlStr, `${studentEmail}_task_${selectedWeek}`);
                await saveFileContent(file.name, urlStr, `${studentEmail.toLowerCase()}_task_${selectedWeek}`);
              }
              resolve({
                name: file.name,
                type: file.type || 'application/octet-stream',
                url: urlStr,
              });
            };
            reader.onerror = () => {
              resolve({
                name: file.name,
                type: file.type || 'application/octet-stream',
                url: '',
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      const lightweightFilesData = studentFilesData.map(({ name, type }) => ({ name, type, url: '' }));

      const taskKeyProj = `task_data_${selectedApp.projectId || selectedApp.id || 1}_${studentEmail}_${selectedWeek}`;
      const existingRaw = localStorage.getItem(taskKeyProj);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const prevHistory: any[] = existing.submissionHistory || [];
      const newHistoryEntry = {
        id: Date.now().toString(),
        version: prevHistory.length + 1,
        submittedAt: new Date().toISOString(),
        content: reportContent,
        fileNames: fileNames,
        filesData: lightweightFilesData,
      };
      const updatedHistory = [...prevHistory, newHistoryEntry];

      const updatedTask = {
        ...existing,
        taskNumber: selectedWeek,
        isSubmitted: true,
        studentResponseText: reportContent,
        studentFiles: fileNames,
        studentFilesData: lightweightFilesData,
        reviewStatus: 'SUBMITTED',
        submissionHistory: updatedHistory,
      };

      safeLocalStorageSet(taskKeyProj, JSON.stringify(updatedTask));
      await saveReportData(taskKeyProj, updatedTask);

      const newReport = {
        id: Date.now(),
        applicationId: selectedApp.id,
        weekNumber: selectedWeek,
        content: reportContent,
        studentEmail: studentEmail,
        status: 'SUBMITTED',
        fileNames: fileNames,
        filesData: lightweightFilesData,
        submittedAt: new Date().toISOString(),
        submissionHistory: updatedHistory,
      };

      const reportForm = new FormData();
      reportForm.append('applicationId', String(selectedApp.id));
      reportForm.append('studentEmail', studentEmail);
      reportForm.append('facultyEmail', selectedApp.facultyEmail || '');
      reportForm.append('weekNumber', String(selectedWeek));
      reportForm.append('content', reportContent);
      if (filesToUpload[0]) reportForm.append('file', filesToUpload[0]);

      const backendReportResponse = await api.post('/applications/reports', reportForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const backendReport = backendReportResponse.data;
      if (backendReport?.id) {
        newReport.id = backendReport.id;
        newReport.status = backendReport.status || newReport.status;
      }

      const savedReportsRaw = localStorage.getItem(`student_submitted_reports_${studentEmail}`);
      let currentReports: any[] = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];
      currentReports = [newReport, ...currentReports.filter((r) => r.weekNumber !== selectedWeek)];

      // Strip heavy base64 url from reports array before saving to localStorage to prevent quota overflow
      const lightweightReports = currentReports.map((r: any) => ({
        ...r,
        filesData: r.filesData?.map((f: any) => ({ name: f.name, type: f.type })),
      }));

      safeLocalStorageSet(`student_submitted_reports_${studentEmail}`, JSON.stringify(lightweightReports));
      safeLocalStorageSet(`student_submitted_reports_${studentEmail.toLowerCase()}`, JSON.stringify(lightweightReports));
      await saveReportData(`student_submitted_reports_${studentEmail}`, lightweightReports);
      await saveReportData(`student_submitted_reports_${studentEmail.toLowerCase()}`, lightweightReports);

      // Save to master global_all_submitted_reports array for permanent cross-session storage
      try {
        const globalRaw = localStorage.getItem('global_all_submitted_reports');
        let globalList: any[] = globalRaw ? JSON.parse(globalRaw) : [];
        globalList = [
          newReport,
          ...globalList.filter(
            (r: any) =>
              !(
                (r.studentEmail || '').toLowerCase() === studentEmail.toLowerCase() &&
                Number(r.weekNumber || r.taskNumber) === Number(selectedWeek)
              )
          ),
        ];
        const lightweightGlobal = globalList.map((r: any) => ({
          ...r,
          filesData: r.filesData?.map((f: any) => ({ name: f.name, type: f.type })),
        }));
        safeLocalStorageSet('global_all_submitted_reports', JSON.stringify(lightweightGlobal));
        await saveReportData('global_all_submitted_reports', lightweightGlobal);
      } catch (e) {}

      setReports(currentReports);

      alert(`Task ${selectedWeek} report submitted successfully!`);
      setShowSubmitConfirmModal(false);
      setSelectedFile(null);
      setSelectedFiles([]);
      setReportContent('');
    } catch (e: any) {
      console.error('Error submitting report:', e);
      alert('Failed to submit report: ' + (e.message || 'Unknown error'));
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleDeleteSubmission = async (weekNumber: number) => {
    if (!selectedApp) return;
    const cleanEmail = (studentEmail || '').trim().toLowerCase();
    const rawEmail = (studentEmail || '').trim();

    // 1. Scan and remove ALL task_data_* keys in localStorage ending with _weekNumber
    const keysToRemoveSet = new Set<string>([
      `task_data_${selectedApp.projectId || selectedApp.id || 1}_${studentEmail}_${weekNumber}`,
      `task_data_${selectedApp.projectId || selectedApp.id || 1}_${cleanEmail}_${weekNumber}`,
    ]);

    try {
      const allowedProjectTokens = [
        `_${selectedApp.projectId || selectedApp.id || 1}_`,
      ];
      void allowedProjectTokens;
    } catch (e) {}

    Array.from(keysToRemoveSet).forEach((k) => {
      localStorage.removeItem(k);
      saveReportData(k, null);
    });

    // 2. Remove from student_submitted_reports keys
    const reportKeyCandidates = [
      `student_submitted_reports_${studentEmail}`,
      `student_submitted_reports_${cleanEmail}`,
      `student_submitted_reports_${rawEmail}`,
    ];

    reportKeyCandidates.forEach((rk) => {
      const raw = localStorage.getItem(rk);
      if (raw) {
        try {
          const arr: any[] = JSON.parse(raw);
          const delAppId = selectedApp.id;
          const delProjId = selectedApp.projectId ?? selectedApp.id;
          const updated = arr.filter((r: any) => {
            const rAppId = r.applicationId ?? r.appId ?? r.projectId;
            const matchesApp =
              rAppId !== undefined &&
              (String(rAppId) === String(delAppId) || String(rAppId) === String(delProjId));
            return !(matchesApp && Number(r.weekNumber || r.taskNumber) === Number(weekNumber));
          });
          safeLocalStorageSet(rk, JSON.stringify(updated));
          saveReportData(rk, updated);
        } catch (e) {}
      }
    });

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('student_submitted_reports_')) {
          if (cleanEmail && k.toLowerCase().includes(cleanEmail)) {
            const raw = localStorage.getItem(k);
            if (raw) {
              try {
                const arr: any[] = JSON.parse(raw);
                const delAppId = selectedApp.id;
                const delProjId = selectedApp.projectId ?? selectedApp.id;
                const updated = arr.filter((r: any) => {
                  const rAppId = r.applicationId ?? r.appId ?? r.projectId;
                  const matchesApp =
                    rAppId !== undefined &&
                    (String(rAppId) === String(delAppId) || String(rAppId) === String(delProjId));
                  return !(matchesApp && Number(r.weekNumber || r.taskNumber) === Number(weekNumber));
                });
                safeLocalStorageSet(k, JSON.stringify(updated));
                saveReportData(k, updated);
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {}

    // 3. Remove from global_all_submitted_reports
    try {
      const globalRaw = localStorage.getItem('global_all_submitted_reports');
      if (globalRaw) {
        const globalList: any[] = JSON.parse(globalRaw);
        const delAppId = selectedApp.id;
        const delProjId = selectedApp.projectId ?? selectedApp.id;
        const updatedGlobal = globalList.filter(
          (r: any) => {
            const rAppId = r.applicationId ?? r.appId ?? r.projectId;
            const matchesApp =
              rAppId !== undefined &&
              (String(rAppId) === String(delAppId) || String(rAppId) === String(delProjId));
            return !(
              matchesApp &&
              cleanEmail &&
              (r.studentEmail || '').trim().toLowerCase() === cleanEmail &&
              Number(r.weekNumber || r.taskNumber) === Number(weekNumber)
            );
          }
        );
        safeLocalStorageSet('global_all_submitted_reports', JSON.stringify(updatedGlobal));
        saveReportData('global_all_submitted_reports', updatedGlobal);
      }
    } catch (e) {}

    setReports((prev) => {
      const delAppId = selectedApp.id;
      const delProjId = selectedApp.projectId ?? selectedApp.id;
      return prev.filter((r: any) => {
        const rAppId = r.applicationId ?? r.appId ?? r.projectId;
        const matchesApp =
          rAppId !== undefined &&
          (String(rAppId) === String(delAppId) || String(rAppId) === String(delProjId));
        return !(matchesApp && Number(r.weekNumber || r.taskNumber) === Number(weekNumber));
      });
    });
    setReportContent('');
    setSelectedFiles([]);
    setSelectedFile(null);

    // 4. Dispatch storage and report reviewed events to force real-time re-render
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('student_report_reviewed', { detail: { periodNum: weekNumber, cleanEmail } }));
    } catch (e) {}

    alert(`Submission for Task ${weekNumber} has been deleted.`);
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.startTime || !selectedApp) return;

    setSubmittingMeeting(true);
    try {
      await api.post('/meetings/request', {
        hostEmail: selectedApp.facultyEmail,
        participantEmail: studentEmail,
        title: meetingForm.title,
        description: meetingForm.description,
        startTime: meetingForm.startTime,
      });

      alert('Meeting request sent to faculty supervisor!');
      setShowMeetingModal(false);
      setMeetingForm({ title: '', description: '', startTime: '' });
      fetchMeetings(selectedApp.facultyEmail);
    } catch (e: any) {
      console.error('Error requesting meeting:', e);
      alert('Failed to request meeting');
    } finally {
      setSubmittingMeeting(false);
    }
  };

  const calcWeek = (startDateStr?: string) => {
    if (!startDateStr) return 1;
    const start = new Date(startDateStr);
    const today = new Date();
    const diffTime = today.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  const parseDurationWeeks = (durationStr?: string) => {
    if (!durationStr) return 0;
    const str = String(durationStr).toLowerCase();
    const weekMatch = str.match(/(\d+)\s*week/);
    if (weekMatch) return parseInt(weekMatch[1], 10);
    const monthMatch = str.match(/(\d+)\s*month/);
    if (monthMatch) return parseInt(monthMatch[1], 10) * 4;
    const numMatch = str.match(/^(\d+)$/);
    if (numMatch) return parseInt(numMatch[1], 10);
    return 0;
  };

  const parseLocalDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = parseLocalDate(dateStr);
    if (!d || isNaN(d.getTime())) return 'N/A';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const calcTotalWeeks = (app: any) => {
    if (app?.internshipStartDate && app?.internshipEndDate) {
      const s = parseLocalDate(app.internshipStartDate);
      const e = parseLocalDate(app.internshipEndDate);
      if (s && e) {
        const diffMs = e.getTime() - s.getTime();
        if (diffMs > 0) {
          const diffDays = Math.ceil(diffMs / 86400000);
          const w = Math.ceil(diffDays / 7);
          if (w > 0) return w;
        }
      }
    }
    if (app?.duration) {
      const parsedW = parseDurationWeeks(app.duration);
      if (parsedW > 0) return parsedW;
    }
    if (reports && reports.length > 0) {
      const maxW = Math.max(...reports.map((r: any) => r.weekNumber || 1));
      if (maxW > 0) return maxW;
    }
    return 8;
  };

  const fmtDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;

  const weekRange = (startStr: string, week: number) => {
    const s = new Date(startStr);
    const ws = new Date(s);
    ws.setDate(s.getDate() + (week - 1) * 7);
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    return `${fmtDate(ws)} – ${fmtDate(we)}`;
  };

  if (loading) return <Spinner />;

  return (
    <>
      {!selectedApp ? (
        <ProjectListPage
          activeApps={activeApps}
          onSelectApp={(app) => {
            const synced = syncProjectDetailsForStudent(app);
            setSelectedApp(synced);
            fetchReports(app.id);
            fetchMeetings(app.facultyEmail);
          }}
          onAcceptProject={handleAccept}
          onRejectProject={handleReject}
        />
      ) : (
        <>
          <WeekGridPage
            selectedApp={selectedApp}
            studentEmail={studentEmail}
            onBackToProjects={() => setSelectedApp(null)}
            onRequestMeeting={() => setShowMeetingModal(true)}
            onAcceptProject={handleAccept}
            onRejectProject={handleReject}
            onSelectWeek={(week, content) => {
              setSelectedWeek(week);
              setReportContent(content || '');
            }}
            reports={reports}
            meetings={meetings}
            calcTotalWeeks={calcTotalWeeks}
            calcWeek={calcWeek}
            weekRange={weekRange}
            formatDateDisplay={formatDateDisplay}
          />

          {selectedWeek !== null && (
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
              onClick={() => {
                setSelectedWeek(null);
                setSelectedFile(null);
                setSelectedFiles([]);
                setReportContent('');
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#081330',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                  maxWidth: '920px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '24px',
                  color: '#ffffff',
                }}
              >
                <WeekDetailPage
                  selectedWeek={selectedWeek}
                  selectedApp={selectedApp}
                  studentEmail={studentEmail}
                  reports={reports}
                  onBackToWeeks={() => {
                    setSelectedWeek(null);
                    setSelectedFile(null);
                    setSelectedFiles([]);
                    setReportContent('');
                  }}
                  reportContent={reportContent}
                  setReportContent={setReportContent}
                  selectedFiles={selectedFiles}
                  handleFileSelect={handleFileSelect}
                  handleRemoveFile={handleRemoveFile}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  promptSubmitTask={promptSubmitTask}
                  showSubmitConfirmModal={showSubmitConfirmModal}
                  setShowSubmitConfirmModal={setShowSubmitConfirmModal}
                  executeSubmitReport={executeSubmitReport}
                  onDeleteSubmission={handleDeleteSubmission}
                  submittingTask={submittingTask}
                  weekRange={weekRange}
                />
              </div>
            </div>
          )}
        </>
      )}

      <RequestMeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSubmit={handleMeetingSubmit}
        form={meetingForm}
        setForm={setMeetingForm}
        facultyEmail={selectedApp?.facultyEmail}
        submitting={submittingMeeting}
      />
    </>
  );
};

export default ProjectWorkView;
