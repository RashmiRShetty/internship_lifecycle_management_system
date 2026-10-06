import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../../services/api';
import { Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { InternshipCardsGrid } from './InternshipCardsGrid';
import { ApplicantsTable } from './ApplicantsTable';
import { BulkAcceptModal } from './BulkAcceptModal';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { IssueCertificateModal } from '../modals/IssueCertificateModal';
import { REAL_INTERNSHIPS, SAMPLE_APPLICATIONS } from '../../../constants/defaultInternships';
import { hydrateAiMatchesForApplications } from '../../../services/aiMatcher';
import { useGoogleMeet } from '../../../hooks/useGoogleMeet';

interface ApplicantsViewProps {
  onInspectMatch: (app: any) => void;
  onMessageStudent: (email: string) => void;
  onRequestRejectReason?: (callback: (reason: string) => void) => void;
}

export const ApplicantsView: React.FC<ApplicantsViewProps> = ({
  onInspectMatch,
  onMessageStudent,
  onRequestRejectReason,
}) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [postedInternships, setPostedInternships] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'END' | 'ALL'>('ACTIVE');
  const [matchMap, setMatchMap] = useState<Record<string, any>>({});
  const [aiLoadingMap, setAiLoadingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedAppIds, setSelectedAppIds] = useState<number[]>([]);

  // Modals state
  const [showBulkAcceptModal, setShowBulkAcceptModal] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState<number>(60);
  const [bulkRejectionReason, setBulkRejectionReason] = useState<string>(
    'Thank you for your application. We have decided to proceed with other candidates whose qualifications are more suitable for this role. We wish you all the best in your search!'
  );
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [meetingData, setMeetingData] = useState<{
    title: string;
    description: string;
    startTime: string;
    type?: 'ONLINE' | 'IN_PERSON';
    meetingLink?: string;
  }>({
    title: 'Interview session',
    description: '',
    startTime: '',
    type: 'ONLINE',
    meetingLink: '',
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [certApp, setCertApp] = useState<any | null>(null);
  const { createGoogleMeet } = useGoogleMeet();

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const facultyEmail = decoded?.sub ? String(decoded.sub).trim() : undefined;

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const cleanEmail = (facultyEmail || '').trim().toLowerCase();
      const [appsRes, matchesRes, internshipsRes] = await Promise.all([
        facultyEmail ? api.get(`/applications/faculty?email=${encodeURIComponent(facultyEmail)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        facultyEmail ? api.get(`/recommendations/faculty-applicants?email=${encodeURIComponent(facultyEmail)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        facultyEmail ? api.get(`/internships/faculty?email=${encodeURIComponent(facultyEmail)}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      let myApps = (appsRes.data || []).filter((a: any) =>
        String(a.facultyEmail || '').trim().toLowerCase() === cleanEmail
      );
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
          if (myInternships.length === 0) myInternships = REAL_INTERNSHIPS.slice(0, 2) as any[];
        }
      }

      const internshipMapById = new Map<number | string, any>();
      const internshipMapByTitle = new Map<string, any>();
      myInternships.forEach((i: any) => {
        if (i.id != null) internshipMapById.set(String(i.id), i);
        if (i.title) internshipMapByTitle.set(String(i.title).trim().toLowerCase(), i);
      });

      const uniqueStudentEmails: string[] = [...(new Set(
        myApps.map((a: any) => String(a.studentEmail || a.email || '').trim()).filter(Boolean)
      ) as Set<string>)];
      const studentProfileMap = new Map<string, any>();
      await Promise.all(
        uniqueStudentEmails.map(async (email: string) => {
          try {
            const res = await api.get(`/users/profile/student?email=${encodeURIComponent(email)}`).catch(() => ({ data: null }));
            if (res?.data) studentProfileMap.set(email.trim().toLowerCase(), res.data);
          } catch {}
        })
      );

      myApps = myApps.map((app: any) => {
        const internshipId = String(app.internshipId ?? '');
        const internshipTitle = String(app.internshipTitle || app.title || '').trim().toLowerCase();
        let internshipData: any = internshipMapById.get(internshipId) || internshipMapByTitle.get(internshipTitle);
        if (internshipData) {
          const merged: any = { ...app };
          ['description', 'internshipDescription', 'skillsRequired', 'requirements', 'skillsPreferred', 'preferredSkills',
           'eligibilityCriteria', 'eligibility', 'responsibilities', 'keyProjects', 'projects', 'mode', 'internshipType',
           'duration', 'stipend', 'location', 'status', 'isOpen', 'applicationDeadline', 'facultyId', 'facultyEmail',
           'department', 'requiredQualification', 'preferredQualification', 'openings'].forEach((f) => {
            if (internshipData[f] !== undefined && internshipData[f] !== null && internshipData[f] !== '') {
              merged[f] = internshipData[f];
            }
          });
          merged.openings = internshipData.openings ?? merged.openings ?? app.openings;
          merged.internshipDescription = internshipData.description || merged.internshipDescription || app.internshipDescription || '';
          merged.internshipSkillsRequired = internshipData.skillsRequired || merged.skillsRequired || app.skillsRequired || '';
          merged.internshipSkillsPreferred = internshipData.skillsPreferred || merged.skillsPreferred || app.skillsPreferred || [];
          merged.internshipEligibility = internshipData.eligibilityCriteria || merged.eligibilityCriteria || app.eligibilityCriteria || '';
          merged.postedInternship = internshipData;
          app = merged;
        }

        const sEmail = String(app.studentEmail || app.email || '').trim().toLowerCase();
        const studentData = studentProfileMap.get(sEmail);
        if (studentData) {
          const merged: any = { ...app };
          ['skills', 'technicalSkills', 'programmingLanguages', 'languages', 'projects', 'completedCourseworks',
           'coursework', 'certificates', 'certifications', 'bio', 'about', 'interestedDomain', 'domain',
           'experience', 'experienceSummary', 'experienceYears', 'yearsExperience', 'totalExperience',
           'cgpa', 'studentCgpa', 'semester', 'studentSemester', 'department', 'studying', 'course',
           'firstName', 'lastName', 'studentName', 'internships', 'pastInternships', 'internshipHistory',
           'workExperiences', 'interests', 'awards', 'volunteering', 'customSections'].forEach((f) => {
            if (studentData[f] !== undefined && studentData[f] !== null && studentData[f] !== '') {
              merged[f] = studentData[f];
            }
          });
          if (studentData.skills) merged.studentSkills = studentData.skills;
          if (studentData.cgpa != null) merged.studentCgpa = studentData.cgpa;
          if (studentData.semester != null) merged.studentSemester = studentData.semester;
          if (studentData.firstName || studentData.lastName) {
            merged.studentName = `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || app.studentName;
          }
          merged.fullStudentProfile = studentData;
          app = merged;
        }

        return app;
      });

      if (myApps.length === 0) {
        const facultyInternshipIds = new Set(myInternships.map((i: any) => i.id));
        const facultyInternshipEmails = new Set(myInternships.map((i: any) => String(i.facultyId || '').toLowerCase()));
        let sampleMatch = (SAMPLE_APPLICATIONS as any[]).filter((a) =>
          facultyInternshipIds.has(Number(a.internshipId)) ||
          facultyInternshipEmails.has(String(a.facultyEmail || '').toLowerCase())
        );
        if (sampleMatch.length === 0) {
          const firstIntern = myInternships[0];
          const secondIntern = myInternships[1] || myInternships[0];
          myApps = [
            {
              id: 501, internshipId: firstIntern?.id || 1,
              internshipTitle: firstIntern?.title || 'Full-Stack Web Development Intern',
              studentEmail: 'aditya.kulkarni@learner.manipal.edu',
              facultyEmail: firstIntern?.facultyId || facultyEmail || 'dr.sharma@manipal.edu',
              status: 'SHORTLISTED',
              appliedAt: '2026-09-05T10:20:00',
              studentName: 'Aditya Kulkarni',
              studentCgpa: 8.9,
              studentSkills: 'React, TypeScript, Node.js, SQL',
              course: 'B.Tech Computer Science',
              semester: 7,
              coverLetter: 'Passionate full-stack developer with 3+ web projects on GitHub including a React dashboard and REST API backend.',
              resumeUrl: '',
            },
            {
              id: 502, internshipId: firstIntern?.id || 1,
              internshipTitle: firstIntern?.title || 'Full-Stack Web Development Intern',
              studentEmail: 'sneha.rao@learner.manipal.edu',
              facultyEmail: firstIntern?.facultyId || facultyEmail || 'dr.sharma@manipal.edu',
              status: 'UNDER_REVIEW',
              appliedAt: '2026-09-06T14:05:00',
              studentName: 'Sneha Rao',
              studentCgpa: 8.2,
              studentSkills: 'React, JavaScript, CSS, Python',
              course: 'B.Tech Information Technology',
              semester: 7,
              coverLetter: 'Frontend enthusiast with design sensibility. Built a student club portal in React and worked as web designer for college fest.',
              resumeUrl: '',
            },
            {
              id: 503, internshipId: secondIntern?.id || 2,
              internshipTitle: secondIntern?.title || 'Machine Learning Research Intern',
              studentEmail: 'rohan.menon@learner.manipal.edu',
              facultyEmail: secondIntern?.facultyId || facultyEmail || 'dr.rao@manipal.edu',
              status: 'INTERVIEW',
              appliedAt: '2026-09-03T09:15:00',
              studentName: 'Rohan Menon',
              studentCgpa: 9.1,
              studentSkills: 'Python, PyTorch, TensorFlow, NLP',
              course: 'M.Tech Artificial Intelligence',
              semester: 3,
              coverLetter: 'ML researcher with 2 publications on sentiment analysis and image classification. Worked on a semester project building a recommendation engine.',
              resumeUrl: '',
            },
            {
              id: 504, internshipId: firstIntern?.id || 1,
              internshipTitle: firstIntern?.title || 'Full-Stack Web Development Intern',
              studentEmail: 'priya.shetty@learner.manipal.edu',
              facultyEmail: firstIntern?.facultyId || facultyEmail || 'dr.sharma@manipal.edu',
              status: 'SELECTED',
              appliedAt: '2026-08-30T11:45:00',
              studentName: 'Priya Shetty',
              studentCgpa: 8.7,
              studentSkills: 'React, Spring Boot, PostgreSQL, Docker',
              course: 'B.Tech Computer Science',
              semester: 8,
              coverLetter: 'Full-stack developer with both React and Spring Boot experience. Built a bookstore e-commerce site with payment integration for capstone project.',
              resumeUrl: '',
            },
            {
              id: 505, internshipId: secondIntern?.id || 2,
              internshipTitle: secondIntern?.title || 'Machine Learning Research Intern',
              studentEmail: 'nisha.patel@learner.manipal.edu',
              facultyEmail: secondIntern?.facultyId || facultyEmail || 'dr.rao@manipal.edu',
              status: 'APPLIED',
              appliedAt: '2026-09-08T16:30:00',
              studentName: 'Nisha Patel',
              studentCgpa: 8.4,
              studentSkills: 'Python, Pandas, Scikit-learn, SQL',
              course: 'B.Tech Data Science',
              semester: 6,
              coverLetter: 'Data science student with a strong foundation in statistics. Completed Kaggle competitions with top 20% rankings.',
              resumeUrl: '',
            },
            {
              id: 506, internshipId: firstIntern?.id || 1,
              internshipTitle: firstIntern?.title || 'Full-Stack Web Development Intern',
              studentEmail: 'vikram.jain@learner.manipal.edu',
              facultyEmail: firstIntern?.facultyId || facultyEmail || 'dr.sharma@manipal.edu',
              status: 'SHORTLISTED',
              appliedAt: '2026-09-07T08:50:00',
              studentName: 'Vikram Jain',
              studentCgpa: 8.0,
              studentSkills: 'Angular, TypeScript, Node.js, MongoDB',
              course: 'B.Tech Computer Science',
              semester: 7,
              coverLetter: 'Full-stack MEAN developer. Built a real-time chat application using Socket.IO and Angular during a summer bootcamp.',
              resumeUrl: '',
            },
          ];
        } else {
          myApps = sampleMatch;
        }
      }

      setApplications(myApps);
      setPostedInternships(myInternships);

      const matches = matchesRes.data || [];
      const map: Record<string, any> = {};
      matches.forEach((m: any) => {
        if (m.student?.email && m.internship?.id) {
          const key = `${m.student.email}_${m.internship.id}`.toLowerCase();
          map[key] = m;
        }
      });

      if (Object.keys(map).length > 0) {
        setMatchMap(map);
      } else {
        const hydratedMap = await hydrateAiMatchesForApplications(myApps, {}, (key, loading) => {
          setAiLoadingMap((prev) => ({ ...prev, [key]: loading }));
        }, true);
        setMatchMap(hydratedMap);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      const fallbackFacultyEmail = 'dr.sharma@manipal.edu';
      setPostedInternships((REAL_INTERNSHIPS as any[]).filter((i) => i.facultyId.toLowerCase() === fallbackFacultyEmail));
      setApplications(SAMPLE_APPLICATIONS.slice(0, 4) as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [facultyEmail]);

  const handleScheduleMeeting = async () => {
    if (!meetingData.title || !meetingData.startTime) {
      return alert('Please fill in title and start time');
    }
    if (meetingData.type === 'IN_PERSON' && !meetingData.meetingLink) {
      return alert('Please enter the interview location / venue address');
    }
    try {
      const isInPerson = meetingData.type === 'IN_PERSON';
      const googleMeet = isInPerson
        ? null
        : await createGoogleMeet({
            title: meetingData.title,
            description: meetingData.description,
            startTime: meetingData.startTime,
            organizerEmail: facultyEmail || '',
            attendeeEmails: [facultyEmail || '', selectedApp.studentEmail || selectedApp.email || ''],
          });
      const scheduledResponse = await api.post('/meetings/schedule', {
        ...meetingData,
        hostEmail: facultyEmail,
        participantEmail: selectedApp.studentEmail || selectedApp.email,
        type: isInPerson ? 'IN_PERSON' : 'ONLINE',
        meetingLink: googleMeet?.meetingLink || meetingData.meetingLink || '',
        googleCalendarEventId: googleMeet?.calendarEventId || '',
      });
      if (selectedApp && selectedApp.id) {
        await api.put(`/applications/${selectedApp.id}/status?status=INTERVIEW`).catch(() => {});
        setApplications((prev) =>
          prev.map((app) => (app.id === selectedApp.id ? { ...app, status: 'INTERVIEW' } : app))
        );
      }
      alert(isInPerson
        ? 'In-person interview scheduled successfully.'
        : `Interview scheduled successfully. Real Google Meet link: ${scheduledResponse.data?.meetingLink || googleMeet?.meetingLink}`);
      setShowScheduleModal(false);
      setMeetingData({ title: 'Interview session', description: '', startTime: '', type: 'ONLINE', meetingLink: '' });
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Failed to schedule interview');
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const targetApp = applications.find((app) => app.id === id);

    if (newStatus === 'INTERVIEW' && targetApp) {
      setSelectedApp(targetApp);
      setMeetingData({
        title: `Interview with ${targetApp.studentName || targetApp.studentEmail}`,
        description: `Discussion regarding ${targetApp.internshipTitle || 'Internship'} position`,
        startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        type: 'ONLINE',
        meetingLink: '',
      });
      setShowScheduleModal(true);
    }

    if (newStatus === 'REJECTED' && onRequestRejectReason) {
      onRequestRejectReason(async (reason: string) => {
        try {
          await api.put(
            `/applications/${id}/status?status=REJECTED&rejectionReason=${encodeURIComponent(
              reason
            )}`
          );
          setApplications(
            applications.map((app) =>
              app.id === id ? { ...app, status: 'REJECTED', rejectionReason: reason } : app
            )
          );
        } catch (error) {
          alert('Failed to update application status');
        }
      });
      return;
    }
    try {
      await api.put(`/applications/${id}/status?status=${newStatus}`);
      setApplications(
        applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      alert('Failed to update application status');
    }
  };

  const handleManualBulkAcceptSelected = async (autoRejectOthers = false) => {
    if (selectedAppIds.length === 0) return;
    try {
      setBulkProcessing(true);
      const acceptPromises = selectedAppIds.map((id) =>
        api.put(`/applications/${id}/status?status=SHORTLISTED`)
      );

      let rejectPromises: Promise<any>[] = [];
      let unselectedIds: number[] = [];

      if (autoRejectOthers && selectedRole) {
        const roleApps = applications.filter((app) => app.internshipTitle === selectedRole);
        const unselectedApps = roleApps.filter(
          (app) =>
            !selectedAppIds.includes(app.id) &&
            app.status !== 'SHORTLISTED' &&
            app.status !== 'SELECTED' &&
            app.status !== 'REJECTED'
        );
        unselectedIds = unselectedApps.map((a) => a.id);
        rejectPromises = unselectedApps.map((app) =>
          api.put(
            `/applications/${app.id}/status?status=REJECTED&rejectionReason=${encodeURIComponent(
              bulkRejectionReason
            )}`
          )
        );
      }

      await Promise.all([...acceptPromises, ...rejectPromises]);

      setApplications((prev) =>
        prev.map((app) => {
          if (selectedAppIds.includes(app.id)) return { ...app, status: 'SHORTLISTED' };
          if (unselectedIds.includes(app.id))
            return { ...app, status: 'REJECTED', rejectionReason: bulkRejectionReason };
          return app;
        })
      );

      alert(
        `Successfully shortlisted ${selectedAppIds.length} candidate(s)${
          autoRejectOthers ? ` and rejected ${unselectedIds.length} candidate(s)` : ''
        }!`
      );
      setSelectedAppIds([]);
    } catch (error) {
      alert('Failed to shortlist selected applicants.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const getBulkAcceptSplit = (threshold: number) => {
    const roleFilteredApps = applications.filter(
      (app) => selectedRole === null || app.internshipTitle === selectedRole
    );

    const toAccept = roleFilteredApps.filter((app) => {
      if (app.status === 'SHORTLISTED' || app.status === 'SELECTED') return false;
      const match = matchMap[`${app.studentEmail}_${app.internshipId}`];
      return match ? match.matchPercentage >= threshold : false;
    });

    const toReject = roleFilteredApps.filter((app) => {
      if (app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'REJECTED') return false;
      const match = matchMap[`${app.studentEmail}_${app.internshipId}`];
      return match ? match.matchPercentage < threshold : true;
    });

    return { toAccept, toReject };
  };

  const handleConfirmBulkAcceptByMatch = async () => {
    const { toAccept, toReject } = getBulkAcceptSplit(bulkThreshold);
    if (toAccept.length === 0 && toReject.length === 0) {
      alert(
        `No pending applicants found for "${
          selectedRole || 'All Roles'
        }" at AI Match threshold of ${bulkThreshold}%.`
      );
      return;
    }

    try {
      setBulkProcessing(true);
      const acceptPromises = toAccept.map((app) =>
        api.put(`/applications/${app.id}/status?status=SHORTLISTED`)
      );

      const rejectPromises = toReject.map((app) =>
        api.put(
          `/applications/${app.id}/status?status=REJECTED&rejectionReason=${encodeURIComponent(
            bulkRejectionReason
          )}`
        )
      );

      await Promise.all([...acceptPromises, ...rejectPromises]);

      const acceptIds = toAccept.map((a) => a.id);
      const rejectIds = toReject.map((a) => a.id);

      setApplications((prev) =>
        prev.map((app) => {
          if (acceptIds.includes(app.id)) return { ...app, status: 'SHORTLISTED' };
          if (rejectIds.includes(app.id))
            return { ...app, status: 'REJECTED', rejectionReason: bulkRejectionReason };
          return app;
        })
      );

      alert(
        `Bulk Action Complete for ${
          selectedRole || 'All Roles'
        }!\n• Shortlisted: ${toAccept.length} applicant(s) (AI Match ≥ ${bulkThreshold}%)\n• Rejected: ${toReject.length} applicant(s) (AI Match < ${bulkThreshold}%)`
      );
      setShowBulkAcceptModal(false);
    } catch (error) {
      alert('Failed to process bulk shortlisting & rejection.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Group applications by Internship Project / Role
  const applicationsByRole: Record<string, any[]> = {};
  applications.forEach((app) => {
    const role = app.internshipTitle || 'Other Postings';
    if (!applicationsByRole[role]) applicationsByRole[role] = [];
    applicationsByRole[role].push(app);
  });

  // Build a role list from both postedInternships and applications, sorted by newest first (LAST POSTED AT TOP)
  const roleSortMap = new Map<string, number>();

  // 1. Posted internships sorted by id / postedDate descending
  const sortedPosted = [...postedInternships].sort((a, b) => (b.id || 0) - (a.id || 0));
  sortedPosted.forEach((p, idx) => {
    if (p.title) {
      roleSortMap.set(p.title.trim(), 1000000 + (p.id || (sortedPosted.length - idx)));
    }
  });

  // 2. Any roles found in applications but not in postedInternships
  Object.keys(applicationsByRole).forEach((role) => {
    if (!roleSortMap.has(role.trim())) {
      const apps = applicationsByRole[role];
      const maxId = Math.max(...apps.map((a) => a.id || 0), 0);
      roleSortMap.set(role.trim(), maxId);
    }
  });

  const isRoleClosed = (roleName: string) => {
    const matched = postedInternships.find(
      (p) => (p.title || '').trim().toLowerCase() === roleName.trim().toLowerCase()
    );
    if (matched) {
      if (String(matched.status || '').toUpperCase() === 'CLOSED' || matched.isOpen === false) return true;
      if (matched.applicationDeadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(matched.applicationDeadline);
        if (typeof matched.applicationDeadline === 'string' && matched.applicationDeadline.includes('-')) {
          const parts = matched.applicationDeadline.split('T')[0].split('-');
          if (parts.length === 3) {
            deadlineDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            deadlineDate.setHours(23, 59, 59, 999);
          }
        }
        if (deadlineDate < today) return true;
      }
    }
    return false;
  };

  // Sort uniqueRoles by score descending (LAST POSTED AT TOP)
  const uniqueRoles = Array.from(roleSortMap.keys()).sort(
    (a, b) => (roleSortMap.get(b) || 0) - (roleSortMap.get(a) || 0)
  );

  const activeRoles = uniqueRoles.filter((r) => !isRoleClosed(r));
  const endedRoles = uniqueRoles.filter((r) => isRoleClosed(r));

  const filteredApps = applications.filter((app) => {
    if (selectedRole && selectedRole !== 'ALL') {
      return app.internshipTitle === selectedRole;
    }
    if (statusFilter === 'ACTIVE') {
      return !isRoleClosed(app.internshipTitle || '');
    }
    if (statusFilter === 'END') {
      return isRoleClosed(app.internshipTitle || '');
    }
    return true;
  });

  const displayRoleCount =
    statusFilter === 'ACTIVE'
      ? activeRoles.length
      : statusFilter === 'END'
      ? endedRoles.length
      : uniqueRoles.length;

  const { toAccept: eligibleAcceptList, toReject: eligibleRejectList } =
    getBulkAcceptSplit(bulkThreshold);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: 600 }}>
        Loading Applicants &amp; AI Recommendations...
      </div>
    );
  }

  // VIEW 1: Posted Internships Grid View (when no role is selected)
  if (!selectedRole) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Hero Action Header */}
        <div
          style={{
            background: '#081330',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              Posted Internships &amp; Role Breakdown
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '20px',
                  padding: '3px 12px',
                  fontSize: '12px',
                  fontWeight: 900,
                }}
              >
                {displayRoleCount} {statusFilter === 'ACTIVE' ? 'Active' : statusFilter === 'END' ? 'Ended' : 'Total'} Roles · {filteredApps.length} Applicants
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginTop: '4px' }}>
              Click any internship posting below to open its candidate applications on a dedicated page.
            </div>
          </div>

          {/* 3 Option Filter Tabs: ACTIVE, END, ALL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {(['ACTIVE', 'END', 'ALL'] as const).map((tab) => {
              const isActiveTab = statusFilter === tab;
              const count = tab === 'ACTIVE' ? activeRoles.length : tab === 'END' ? endedRoles.length : uniqueRoles.length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    background: isActiveTab ? '#3b82f6' : 'transparent',
                    color: isActiveTab ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab === 'ACTIVE' ? `🟢 Active (${count})` : tab === 'END' ? `🔴 Ended / Closed (${count})` : `All (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Internship Role Cards Grid */}
        <InternshipCardsGrid
          uniqueRoles={uniqueRoles}
          applicationsByRole={applicationsByRole}
          postedInternships={postedInternships}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Modals */}
        <BulkAcceptModal
          show={showBulkAcceptModal}
          onClose={() => setShowBulkAcceptModal(false)}
          selectedRole={selectedRole}
          bulkThreshold={bulkThreshold}
          setBulkThreshold={setBulkThreshold}
          bulkRejectionReason={bulkRejectionReason}
          setBulkRejectionReason={setBulkRejectionReason}
          bulkProcessing={bulkProcessing}
          eligibleAcceptCount={eligibleAcceptList.length}
          eligibleRejectCount={eligibleRejectList.length}
          onConfirm={handleConfirmBulkAcceptByMatch}
        />

        <ScheduleInterviewModal
          show={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          selectedApp={selectedApp}
          meetingData={meetingData}
          setMeetingData={setMeetingData}
          onSchedule={handleScheduleMeeting}
        />
      </div>
    );
  }

  // VIEW 2: Dedicated Applicants Page View (when an internship role is selected)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Navigation & Header Bar for Selected Internship */}
      <div
        style={{
          background: '#081330',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '12px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <button
            onClick={() => setSelectedRole(null)}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Back to All Posted Internships
          </button>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            Applicants for "{selectedRole === 'ALL' ? 'All Roles' : selectedRole}"
            <span
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                padding: '2px 10px',
                fontSize: '11px',
                fontWeight: 900,
              }}
            >
              {filteredApps.length} Applications
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
            Review candidate submissions, schedule interviews, and accept/reject applicants for this role.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {selectedAppIds.length > 0 && (
            <button
              onClick={() => handleManualBulkAcceptSelected(false)}
              style={{
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(21,128,61,0.25)',
              }}
            >
              <CheckCircle2 size={15} /> Shortlist Selected ({selectedAppIds.length})
            </button>
          )}

          <button
            onClick={() => setShowBulkAcceptModal(true)}
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
            }}
          >
            <Sparkles size={16} /> ⚡ AI Match Bulk Shortlist
          </button>
        </div>
      </div>

      {/* Applicants Main Table */}
      {filteredApps.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <Users size={40} style={{ color: '#94a3b8', margin: '0 auto 14px auto' }} />
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            No applications found for this role
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            When students apply for this internship posting, they will appear here.
          </div>
        </div>
      ) : (
        <ApplicantsTable
          applications={filteredApps}
          selectedAppIds={selectedAppIds}
          setSelectedAppIds={setSelectedAppIds}
          matchMap={matchMap}
          aiLoadingMap={aiLoadingMap}
          onInspectMatch={onInspectMatch}
          onScheduleInterview={(app) => {
            setSelectedApp(app);
            setMeetingData({
              title: `Interview with ${app.studentName || app.studentEmail}`,
              description: `Discussion regarding ${app.internshipTitle || 'Internship'} position`,
              startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
              type: 'ONLINE',
              meetingLink: '',
            });
            setShowScheduleModal(true);
          }}
          onMessageStudent={onMessageStudent}
          onStatusUpdate={handleStatusUpdate}
          onIssueCertificate={(app) => {
            setCertApp(app);
            setShowCertModal(true);
          }}
        />
      )}

      {/* Modals */}
      <BulkAcceptModal
        show={showBulkAcceptModal}
        onClose={() => setShowBulkAcceptModal(false)}
        selectedRole={selectedRole}
        bulkThreshold={bulkThreshold}
        setBulkThreshold={setBulkThreshold}
        bulkRejectionReason={bulkRejectionReason}
        setBulkRejectionReason={setBulkRejectionReason}
        bulkProcessing={bulkProcessing}
        eligibleAcceptCount={eligibleAcceptList.length}
        eligibleRejectCount={eligibleRejectList.length}
        onConfirm={handleConfirmBulkAcceptByMatch}
      />

      <ScheduleInterviewModal
        show={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedApp={selectedApp}
        meetingData={meetingData}
        setMeetingData={setMeetingData}
        onSchedule={handleScheduleMeeting}
      />

      <IssueCertificateModal
        show={showCertModal}
        onClose={() => setShowCertModal(false)}
        application={certApp}
        facultyEmail={facultyEmail || ''}
        onCertificateIssued={() => {
          fetchApplications();
        }}
      />
    </div>
  );
};
