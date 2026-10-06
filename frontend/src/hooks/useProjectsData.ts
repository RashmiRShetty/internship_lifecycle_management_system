import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { projectApi } from '../services/api';
import { REAL_INTERNSHIPS, SAMPLE_APPLICATIONS } from '../constants/defaultInternships';
import { isApplicantAssignableToProject } from '../utils/projectAssignmentUtils';

export const useProjectsData = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [facultyApplications, setFacultyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated Project Page detail state
  const [activeProjectDetail, setActiveProjectDetail] = useState<any | null>(null);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);

  // Task assignment modal & form states
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [showAssignTaskAnytimeModal, setShowAssignTaskAnytimeModal] = useState(false);
  const [anytimeTaskForm, setAnytimeTaskForm] = useState({
    studentEmail: '',
    title: '',
    description: '',
    instructions: '',
    completionDays: '3',
    customDays: 3,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    projectId: '',
  });

  const [roleInputs, setRoleInputs] = useState<Record<string, string>>({});
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  // Individual Candidate Modal state
  const [editingIndividualCandidate, setEditingIndividualCandidate] = useState<any | null>(null);
  const [singleRoleInput, setSingleRoleInput] = useState('');
  const [singleDescInput, setSingleDescInput] = useState('');
  const [singleEditError, setSingleEditError] = useState('');

  // Password confirmation modal for project deletion
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [validatingPassword, setValidatingPassword] = useState(false);

  // Create Project Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    internshipTitle: 'Web Developer Internship',
    startDate: '',
    endDate: '',
    frequencyType: 'WEEKLY',
    frequencyDays: 7,
    description: '',
  });

  const [viewingStudentProfile, setViewingStudentProfile] = useState<any | null>(null);
  const [studentMeetingsMap] = useState<Record<string, any[]>>({});
  const [studentReviewsMap, setStudentReviewsMap] = useState<
    Record<string, { status: string; score: string; notes: string; reviewedAt: string }>
  >({});
  const [studentAcceptanceMap, setStudentAcceptanceMap] = useState<
    Record<
      string,
      { status: 'ACCEPTED' | 'REVISION_REQUIRED' | 'PENDING'; remarks: string; acceptedAt: string }
    >
  >({});
  const [studentFeedbackMap, setStudentFeedbackMap] = useState<
    Record<
      string,
      {
        rating: number;
        strengths: string;
        improvements: string;
        comments: string;
        updatedAt: string;
      }
    >
  >({});

  // Interactive Modals State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: 'APPROVED & REVIEWED',
    score: '9.5 / 10',
    notes:
      'Code implementation is well structured, modular, tested, and satisfies all task specifications.',
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    strengths: 'Strong problem solving, clear documentation, timely module commits',
    improvements: 'Consider writing more unit tests for corner edge-cases',
    comments:
      'Outstanding effort! All assigned module responsibilities have been delivered with high quality.',
  });

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const facultyEmail = decoded?.sub ? String(decoded.sub).trim() : '';

  const persistFacultyProjects = (projectList: any[]) => {
    if (!facultyEmail) return;
    const savedProjectsKey = `faculty_projects_v2_${facultyEmail}`;
    localStorage.setItem(savedProjectsKey, JSON.stringify(projectList));
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [internRes, projRes, appsRes] = await Promise.all([
        facultyEmail ? api.get(`/internships/faculty?email=${facultyEmail}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        facultyEmail ? projectApi.getFacultyProjects(facultyEmail).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        facultyEmail ? api.get(`/applications/faculty?email=${facultyEmail}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      let fetchedProjects = projRes.data || [];
      const cleanEmail = (facultyEmail || '').trim().toLowerCase();
      let fetchedApps = (appsRes.data || []).filter((a: any) =>
        String(a.facultyEmail || '').trim().toLowerCase() === cleanEmail
      );
      let myInternships = (internRes.data || []).filter((i: any) =>
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

      if (fetchedApps.length === 0) {
        const facultyInternshipIds = new Set(myInternships.map((i: any) => i.id));
        const facultyInternshipEmails = new Set(myInternships.map((i: any) => String(i.facultyId || '').toLowerCase()));
        let sampleMatch = (SAMPLE_APPLICATIONS as any[]).filter((a) =>
          facultyInternshipIds.has(Number(a.internshipId)) ||
          facultyInternshipEmails.has(String(a.facultyEmail || '').toLowerCase())
        );
        if (sampleMatch.length === 0) {
          const firstIntern = myInternships[0];
          const secondIntern = myInternships[1] || myInternships[0];
          fetchedApps = [
            {
              id: 601, internshipId: firstIntern?.id || 1,
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
              projectAccepted: true,
              projectTitle: 'Student Dashboard Portal',
            },
            {
              id: 602, internshipId: firstIntern?.id || 1,
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
              projectAccepted: false,
            },
            {
              id: 603, internshipId: secondIntern?.id || 2,
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
              projectAccepted: true,
              projectTitle: 'Semantic Matching Engine',
            },
            {
              id: 604, internshipId: firstIntern?.id || 1,
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
              projectAccepted: true,
              projectTitle: 'E-Commerce Bookstore',
              internshipStartDate: '2026-10-01',
              internshipEndDate: '2027-03-31',
            },
          ];
        } else {
          fetchedApps = sampleMatch;
        }
      }

      const savedProjectsKey = `faculty_projects_v2_${facultyEmail || 'default'}`;
      if (myInternships.length === 0 && fetchedApps.length === 0 && fetchedProjects.length === 0) {
        localStorage.removeItem(savedProjectsKey);
        fetchedProjects = [];
      } else {
        const savedProjectsRaw = localStorage.getItem(savedProjectsKey);
        if (savedProjectsRaw) {
          try {
            const localProjects = JSON.parse(savedProjectsRaw);
            if (Array.isArray(localProjects) && localProjects.length > 0) {
              const apiIds = new Set(fetchedProjects.map((p: any) => p.id));
              const customLocal = localProjects.filter((p: any) => !apiIds.has(p.id));
              fetchedProjects = [...customLocal, ...fetchedProjects];
            }
          } catch (e) {}
        }
      }

      if (fetchedProjects.length === 0 && myInternships.length > 0 && fetchedApps.length > 0) {
        const firstIntern = myInternships[0];
        const selectedApps = fetchedApps.filter((a: any) => a.status === 'SELECTED' || a.status === 'SHORTLISTED').slice(0, 3);
        const assignedStudents = selectedApps.length > 0 ? selectedApps : fetchedApps.slice(0, 3);
        fetchedProjects = [
          {
            id: 701,
            name: firstIntern?.title || 'Full-Stack Development Project',
            internshipTitle: firstIntern?.title || 'Full-Stack Web Development Intern',
            internshipId: firstIntern?.id || 1,
            startDate: '2026-10-01',
            endDate: '2027-03-31',
            frequencyType: 'WEEKLY',
            frequencyDays: 7,
            description: firstIntern?.description || 'End-to-end development of student portal features including dashboard, profile management, and notification system.',
            facultyEmail: firstIntern?.facultyId || facultyEmail || 'dr.sharma@manipal.edu',
            status: 'ACTIVE',
            createdAt: '2026-09-10T09:00:00',
            periods: Array.from({ length: 8 }, (_, i) => ({
              id: i + 1,
              periodNumber: i + 1,
              startDate: new Date(2026, 9, 1 + i * 7).toISOString().split('T')[0],
              endDate: new Date(2026, 9, 7 + i * 7).toISOString().split('T')[0],
              tasks: [
                { id: i * 3 + 1, title: `Research & Planning (Week ${i + 1})`, description: 'Review requirements and plan implementation', priority: 'HIGH', dueDate: new Date(2026, 9, 2 + i * 7).toISOString().split('T')[0] },
                { id: i * 3 + 2, title: `Implementation Sprint ${i + 1}`, description: 'Code implementation and unit testing', priority: 'MEDIUM', dueDate: new Date(2026, 9, 5 + i * 7).toISOString().split('T')[0] },
                { id: i * 3 + 3, title: `Review & Report ${i + 1}`, description: 'Submit weekly progress report', priority: 'LOW', dueDate: new Date(2026, 9, 7 + i * 7).toISOString().split('T')[0] },
              ],
            })),
            assignedApplicants: assignedStudents.map((a: any, idx: number) => ({
              id: 801 + idx,
              applicationId: a.id,
              studentEmail: a.studentEmail,
              studentName: a.studentName || a.studentEmail.split('@')[0],
              studentCgpa: a.studentCgpa,
              studentSkills: a.studentSkills,
              course: a.course,
              semester: a.semester,
              role: idx === 0 ? 'Frontend Lead' : idx === 1 ? 'Backend Developer' : 'Full-Stack Developer',
              task: idx === 0 ? 'UI Components & React Dashboard' : idx === 1 ? 'REST APIs & Database Models' : 'End-to-End Feature Implementation',
              status: 'ASSIGNED',
              projectAccepted: true,
            })),
          },
          {
            id: 702,
            name: myInternships[1]?.title || 'ML Research Project',
            internshipTitle: myInternships[1]?.title || 'Machine Learning Research Intern',
            internshipId: myInternships[1]?.id || 2,
            startDate: '2026-09-15',
            endDate: '2027-05-15',
            frequencyType: 'WEEKLY',
            frequencyDays: 7,
            description: myInternships[1]?.description || 'Research and development of semantic matching algorithms for internship recommendation engine using transformer architectures and vector similarity search.',
            facultyEmail: myInternships[1]?.facultyId || facultyEmail || 'dr.rao@manipal.edu',
            status: 'ACTIVE',
            createdAt: '2026-09-01T10:00:00',
            periods: Array.from({ length: 12 }, (_, i) => ({
              id: 100 + i,
              periodNumber: i + 1,
              startDate: new Date(2026, 8, 15 + i * 7).toISOString().split('T')[0],
              endDate: new Date(2026, 8, 21 + i * 7).toISOString().split('T')[0],
              tasks: [
                { id: 200 + i * 2, title: `Literature Review Week ${i + 1}`, description: 'Study relevant papers and document findings', priority: 'HIGH' },
                { id: 201 + i * 2, title: `Experiment Sprint ${i + 1}`, description: 'Run experiments and track metrics', priority: 'MEDIUM' },
              ],
            })),
            assignedApplicants: fetchedApps.filter((a: any) => a.internshipId === (myInternships[1]?.id || 2)).slice(0, 2).map((a: any, idx: number) => ({
              id: 901 + idx,
              applicationId: a.id,
              studentEmail: a.studentEmail,
              studentName: a.studentName || a.studentEmail.split('@')[0],
              studentCgpa: a.studentCgpa,
              studentSkills: a.studentSkills,
              course: a.course,
              semester: a.semester,
              role: 'ML Research Assistant',
              task: idx === 0 ? 'Transformer Model Experiments' : 'Data Pipeline & Vector DB',
              status: 'ASSIGNED',
              projectAccepted: true,
            })),
          },
        ];
      }

      // Sanitize and deduplicate assignedApplicants on all projects
      fetchedProjects = fetchedProjects.map((proj: any) => {
        if (proj.assignedApplicants && Array.isArray(proj.assignedApplicants)) {
          const seen = new Set<string>();
          const cleanAssigned = proj.assignedApplicants.filter((item: any) => {
            const e = (item.studentEmail || item.email || '').trim().toLowerCase();
            if (!e) return true;
            if (seen.has(e)) return false;
            seen.add(e);
            return true;
          });
          return { ...proj, assignedApplicants: cleanAssigned };
        }
        return proj;
      });

      setInternships(myInternships);
      setProjects(fetchedProjects);
      setFacultyApplications(fetchedApps);

      if (fetchedProjects.length > 0) {
        setRoleInputs((prev) => {
          const next = { ...prev };
          fetchedProjects.forEach((proj: any) => {
            if (proj.assignedApplicants) {
              proj.assignedApplicants.forEach((appItem: any) => {
                const key = `${proj.id}_${appItem.studentEmail || appItem.email}`;
                if (!next[key]) next[key] = appItem.role || '';
              });
            }
          });
          return next;
        });

        setTaskInputs((prev) => {
          const next = { ...prev };
          fetchedProjects.forEach((proj: any) => {
            if (proj.assignedApplicants) {
              proj.assignedApplicants.forEach((appItem: any) => {
                const key = `${proj.id}_${appItem.studentEmail || appItem.email}`;
                if (!next[key]) next[key] = appItem.task || appItem.description || '';
              });
            }
          });
          return next;
        });
      }
    } catch (error) {
      console.error('Error fetching projects data:', error);
      const fallbackFacultyEmail = 'dr.sharma@manipal.edu';
      setInternships((REAL_INTERNSHIPS as any[]).filter((i) => i.facultyId.toLowerCase() === fallbackFacultyEmail));
      setFacultyApplications(SAMPLE_APPLICATIONS.slice(0, 3) as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [facultyEmail]);

  const handleSaveReview = (studentEmail: string) => {
    const taskNum = (reviewForm as any).taskNumber || 1;
    const projId = activeProjectDetail?.id || 1;
    const key = `task_data_${projId}_${studentEmail}_${taskNum}`;
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};

    const isAccepted = reviewForm.status.includes('APPROVED') || reviewForm.status === 'ACCEPTED';
    const isChangeReq = reviewForm.status.includes('REVISION') || reviewForm.status === 'CHANGE_REQUESTED';

    const updatedTask = {
      ...existing,
      taskNumber: taskNum,
      reviewStatus: isAccepted ? 'ACCEPTED' : isChangeReq ? 'CHANGE_REQUESTED' : 'SUBMITTED',
      facultyFeedback: reviewForm.notes,
      score: reviewForm.score,
    };
    localStorage.setItem(key, JSON.stringify(updatedTask));

    setStudentReviewsMap((prev) => ({
      ...prev,
      [studentEmail]: {
        status: reviewForm.status,
        score: reviewForm.score,
        notes: reviewForm.notes,
        reviewedAt: new Date().toLocaleDateString(),
      },
    }));
    setShowReviewModal(false);
    alert(
      isAccepted
        ? `Task ${taskNum} marked as Good / Accepted ✓ for ${studentEmail}`
        : isChangeReq
        ? `Change request sent to ${studentEmail} for Task ${taskNum} ⚠️`
        : `Evaluation review saved for ${studentEmail}`
    );
  };

  const handleSaveFeedback = (studentEmail: string) => {
    setStudentFeedbackMap((prev) => ({
      ...prev,
      [studentEmail]: {
        rating: feedbackForm.rating,
        strengths: feedbackForm.strengths,
        improvements: feedbackForm.improvements,
        comments: feedbackForm.comments,
        updatedAt: new Date().toLocaleDateString(),
      },
    }));
    setShowFeedbackModal(false);
    alert(`Mentorship rating feedback saved for ${studentEmail}`);
  };

  const handleToggleAcceptance = (
    studentEmail: string,
    status: 'ACCEPTED' | 'REVISION_REQUIRED'
  ) => {
    setStudentAcceptanceMap((prev) => ({
      ...prev,
      [studentEmail]: {
        status,
        remarks:
          status === 'ACCEPTED'
            ? 'Project deliverables verified, code merged, and officially accepted by faculty.'
            : 'Revisions requested. Please inspect faculty review notes and update pull request.',
        acceptedAt: new Date().toLocaleDateString(),
      },
    }));
    alert(
      `Project status updated to ${status === 'ACCEPTED' ? 'ACCEPTED ✓' : 'REVISION REQUIRED ⚠️'}`
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.startDate || !projectForm.endDate) {
      return alert('Please fill in all mandatory fields (Name, Start Date, End Date)');
    }
    try {
      const selectedInternshipRole =
        projectForm.internshipTitle && projectForm.internshipTitle !== 'undefined' && projectForm.internshipTitle.trim() !== ''
          ? projectForm.internshipTitle
          : (internships[0]?.title || internships[0]?.internshipTitle || internships[0]?.role) || 'Web Developer Internship';

      const payload = {
        ...projectForm,
        internshipTitle: selectedInternshipRole,
        facultyEmail,
      };

      let newProj: any;
      try {
        const res = await projectApi.createProject(payload);
        newProj = {
          ...payload,
          ...(res.data || {}),
        };
      } catch (err) {
        console.warn('Backend API project creation failed, persisting locally:', err);
      }

      if (!newProj || !newProj.id) {
        newProj = {
          id: Date.now(),
          ...payload,
          assignedApplicants: [],
          status: 'ACTIVE',
        };
      }

      // Guarantee internshipTitle is ALWAYS set from payload
      newProj.internshipTitle = payload.internshipTitle || newProj.internshipTitle || 'Web Developer Internship';

      const updatedProjects = [newProj, ...projects.filter((p) => p.id !== newProj.id)];
      setProjects(updatedProjects);

      if (facultyEmail) {
        const savedProjectsKey = `faculty_projects_v2_${facultyEmail}`;
        localStorage.setItem(savedProjectsKey, JSON.stringify(updatedProjects));
      }

      setShowCreateModal(false);
      setProjectForm({
        name: '',
        internshipTitle: 'Web Developer Internship',
        startDate: '',
        endDate: '',
        frequencyType: 'WEEKLY',
        frequencyDays: 7,
        description: '',
      });
      alert(`Project "${newProj.name}" created successfully under ${newProj.internshipTitle}!`);
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project');
    }
  };

  const handleUpdateProject = async (updatedProjectData: any) => {
    if (!updatedProjectData.name || !updatedProjectData.startDate || !updatedProjectData.endDate) {
      return alert('Please fill in all mandatory fields (Name, Start Date, End Date)');
    }
    try {
      try {
        await projectApi.updateProject(updatedProjectData.id, updatedProjectData);
      } catch (err) {
        console.warn('Backend API project update failed, persisting locally:', err);
      }

      const updatedProjects = projects.map((p) =>
        p.id === updatedProjectData.id ? { ...p, ...updatedProjectData } : p
      );
      setProjects(updatedProjects);

      if (facultyEmail) {
        persistFacultyProjects(updatedProjects);
      }

      setShowEditModal(false);
      setEditingProject(null);
      alert(`Project "${updatedProjectData.name}" updated successfully!`);
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: number | string) => {
    if (!projectId && projectId !== 0) return;

    const nextProjects = projects.filter((p) => String(p.id) !== String(projectId));

    setProjects(nextProjects);
    persistFacultyProjects(nextProjects);

    try {
      await projectApi.deleteProject(projectId);
    } catch (err) {
      console.warn('Backend delete failed; local project list was already cleaned up:', err);
    }

    if (activeProjectDetail && String(activeProjectDetail.id) === String(projectId)) {
      setActiveProjectDetail(null);
    }

    setShowDeletePasswordModal(false);
    setProjectToDelete(null);
    setDeletePasswordInput('');
    alert('Project deleted successfully!');
  };

  const handleAssignTaskAnytime = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!anytimeTaskForm.studentEmail || !anytimeTaskForm.title) {
      return alert('Please enter student email and task title');
    }
    try {
      const taskNum = (anytimeTaskForm as any).taskNumber || 1;
      const projId = anytimeTaskForm.projectId || activeProjectDetail?.id || 1;
      const key = `task_data_${projId}_${anytimeTaskForm.studentEmail}_${taskNum}`;

      const existingRaw = localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const isQuick = (anytimeTaskForm as any).isQuickTask || anytimeTaskForm.priority === 'HIGH' || !(anytimeTaskForm as any).taskNumber;
      const taskData = {
        ...existing,
        taskNumber: taskNum,
        title: anytimeTaskForm.title,
        instructions: anytimeTaskForm.instructions || anytimeTaskForm.description,
        dueDate: anytimeTaskForm.dueDate,
        isAssigned: true,
        priority: anytimeTaskForm.priority || 'HIGH',
        isQuickTask: isQuick,
        taskType: isQuick ? 'QUICK_INSTANT_TASK' : 'SCHEDULED_TASK',
        reviewStatus: existing.reviewStatus && existing.reviewStatus !== 'NOT_ASSIGNED' ? existing.reviewStatus : 'ASSIGNED',
      };
      localStorage.setItem(key, JSON.stringify(taskData));

      alert(`Task ${taskNum} "${anytimeTaskForm.title}" assigned successfully to ${anytimeTaskForm.studentEmail}!`);
      setShowAssignTaskAnytimeModal(false);
    } catch (error) {
      alert('Failed to assign task');
    }
  };

  const getProjectTaskPeriods = (project: any) => {
    if (!project?.startDate || !project?.endDate) return 1;
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const freq = project.frequencyDays || (project.frequencyType === 'WEEKLY' ? 7 : project.frequencyType === 'MONTHLY' ? 30 : 15);
    return Math.max(1, Math.ceil(days / Math.max(1, Number(freq) || 7)));
  };

  const handleSaveTaskAssignments = (activeProj: any, candidateApps: any[]) => {
    if (!activeProj) return;
    const projId = activeProj.id;

    const seenEmails = new Set<string>();
    const roleFilteredApps = candidateApps.filter((app: any) => {
      if (!isApplicantAssignableToProject(app, activeProj)) return false;

      const email = (app.studentEmail || app.email || '').trim().toLowerCase();
      if (!email) return true;
      if (seenEmails.has(email)) return false;
      seenEmails.add(email);
      return true;
    });

    const updatedAssignedMap = new Map<string, any>();
    roleFilteredApps.forEach((app: any) => {
      const email = (app.studentEmail || app.email || '').trim();
      const cleanEmail = email.toLowerCase();
      const key = `${projId}_${email}`;
      const role = roleInputs[key] || roleInputs[email] || roleInputs[cleanEmail] || app.role || 'Intern';
      const task = taskInputs[key] || taskInputs[email] || taskInputs[cleanEmail] || app.task || app.description || '';
      if (cleanEmail && !updatedAssignedMap.has(cleanEmail)) {
        updatedAssignedMap.set(cleanEmail, {
          ...app,
          email: email,
          studentEmail: email,
          name: app.name || app.studentName || email,
          role: role,
          task: task,
          description: task,
          assignedAt: new Date().toLocaleDateString(),
        });
      }
    });

    const updatedAssigned = Array.from(updatedAssignedMap.values());

    const updatedProj = {
      ...activeProj,
      assignedApplicants: updatedAssigned,
    };

    setActiveProjectDetail(updatedProj);

    const updatedProjects = projects.map((p) => (p.id === projId ? updatedProj : p));
    setProjects(updatedProjects);

    if (facultyEmail) {
      const savedProjectsKey = `faculty_projects_v2_${facultyEmail}`;
      localStorage.setItem(savedProjectsKey, JSON.stringify(updatedProjects));
    }

    const totalPeriodCount = getProjectTaskPeriods(activeProj);

    updatedAssigned.forEach((item: any) => {
      const email = item.studentEmail || item.email;
      const cleanEmail = (email || '').trim().toLowerCase();
      const rawEmail = (email || '').trim();

      for (let periodNum = 1; periodNum <= totalPeriodCount; periodNum += 1) {
        const taskKeyProj = `task_data_${projId}_${rawEmail}_${periodNum}`;
        const taskKeyProjClean = `task_data_${projId}_${cleanEmail}_${periodNum}`;

        const existingRaw = localStorage.getItem(taskKeyProj) || localStorage.getItem(taskKeyProjClean);
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        const hasProgress = existing && (
          existing.isSubmitted ||
          existing.reviewStatus === 'SUBMITTED' ||
          existing.reviewStatus === 'ACCEPTED' ||
          existing.reviewStatus === 'APPROVED & REVIEWED' ||
          existing.reviewStatus === 'CHANGE_REQUESTED' ||
          existing.reviewStatus === 'RESUBMITTED' ||
          (existing.studentResponseText && existing.studentResponseText.trim() !== '') ||
          (existing.studentFiles && existing.studentFiles.length > 0) ||
          (existing.studentFilesData && existing.studentFilesData.length > 0) ||
          (existing.submissionHistory && existing.submissionHistory.length > 0)
        );
        const taskData = {
          ...existing,
          taskNumber: periodNum,
          title: `${item.role || 'Assigned Module Role'} - Task ${periodNum}`,
          instructions: item.task || item.description || `Assigned candidate task instructions for period ${periodNum}.`,
          isAssigned: hasProgress ? (existing.isAssigned ?? false) : false,
          reviewStatus: existing.reviewStatus && hasProgress ? existing.reviewStatus : 'NOT_ASSIGNED',
        };
        localStorage.setItem(taskKeyProj, JSON.stringify(taskData));
        localStorage.setItem(taskKeyProjClean, JSON.stringify(taskData));
      }
    });

    setShowAssignTaskModal(false);
    alert(`Role assignments and task responsibilities saved successfully for ${updatedAssigned.length} candidate(s)!`);
  };

  const handleSaveSingleCandidateRole = (candidate: any, newRole: string, newDesc: string) => {
    if (!activeProjectDetail || !candidate) return;
    const email = (candidate.studentEmail || candidate.email || '').trim();
    const cleanEmail = email.toLowerCase();
    const projId = activeProjectDetail.id;

    const key = `${projId}_${email}`;
    setRoleInputs((prev) => ({ ...prev, [key]: newRole }));
    setTaskInputs((prev) => ({ ...prev, [key]: newDesc }));

    const existingAssigned = activeProjectDetail.assignedApplicants || [];
    const exists = existingAssigned.some((a: any) => (a.studentEmail || a.email || '').trim().toLowerCase() === cleanEmail);

    let updatedAssigned: any[];
    if (exists) {
      updatedAssigned = existingAssigned.map((a: any) => {
        if ((a.studentEmail || a.email || '').trim().toLowerCase() === cleanEmail) {
          return { ...a, role: newRole, task: newDesc, description: newDesc };
        }
        return a;
      });
    } else {
      updatedAssigned = [
        ...existingAssigned,
        {
          ...candidate,
          email,
          studentEmail: email,
          name: candidate.name || candidate.studentName || email,
          role: newRole,
          task: newDesc,
          description: newDesc,
          assignedAt: new Date().toLocaleDateString(),
        },
      ];
    }

    // Ensure deduplication
    const deduplicatedAssignedMap = new Map<string, any>();
    updatedAssigned.forEach((item: any) => {
      const e = (item.studentEmail || item.email || '').trim().toLowerCase();
      if (e && !deduplicatedAssignedMap.has(e)) {
        deduplicatedAssignedMap.set(e, item);
      }
    });
    const finalAssigned = Array.from(deduplicatedAssignedMap.values());

    const updatedProj = {
      ...activeProjectDetail,
      assignedApplicants: finalAssigned,
    };
    setActiveProjectDetail(updatedProj);

    const updatedProjects = projects.map((p) => (p.id === projId ? updatedProj : p));
    setProjects(updatedProjects);

    if (facultyEmail) {
      const savedProjectsKey = `faculty_projects_v2_${facultyEmail}`;
      localStorage.setItem(savedProjectsKey, JSON.stringify(updatedProjects));
    }

    const totalPeriodCount = getProjectTaskPeriods(activeProjectDetail);

    for (let periodNum = 1; periodNum <= totalPeriodCount; periodNum += 1) {
      const taskKey = `task_data_${projId}_${email}_${periodNum}`;
      const taskKeyClean = `task_data_${projId}_${cleanEmail}_${periodNum}`;
      const existingRaw = localStorage.getItem(taskKey) || localStorage.getItem(taskKeyClean);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const hasProgress = existing && (
        existing.isSubmitted ||
        existing.reviewStatus === 'SUBMITTED' ||
        existing.reviewStatus === 'ACCEPTED' ||
        existing.reviewStatus === 'APPROVED & REVIEWED' ||
        existing.reviewStatus === 'CHANGE_REQUESTED' ||
        existing.reviewStatus === 'RESUBMITTED' ||
        (existing.studentResponseText && existing.studentResponseText.trim() !== '') ||
        (existing.studentFiles && existing.studentFiles.length > 0) ||
        (existing.studentFilesData && existing.studentFilesData.length > 0) ||
        (existing.submissionHistory && existing.submissionHistory.length > 0)
      );
      const taskData = {
        ...existing,
        taskNumber: periodNum,
        title: `${newRole}${totalPeriodCount > 1 ? ` - Task ${periodNum}` : ''}`,
        instructions: newDesc || `Assigned candidate task instructions for period ${periodNum}.`,
        isAssigned: hasProgress ? (existing.isAssigned ?? false) : false,
        reviewStatus: existing.reviewStatus && hasProgress ? existing.reviewStatus : 'NOT_ASSIGNED',
      };
      localStorage.setItem(taskKey, JSON.stringify(taskData));
      localStorage.setItem(taskKeyClean, JSON.stringify(taskData));
    }

    setEditingIndividualCandidate(null);
    alert(`Updated candidate role title to "${newRole}" for ${email}!`);
  };

  return {
    internships,
    projects,
    setProjects,
    facultyApplications,
    loading,
    facultyEmail,
    activeProjectDetail,
    setActiveProjectDetail,
    showProjectDetailsModal,
    setShowProjectDetailsModal,
    showAssignTaskModal,
    setShowAssignTaskModal,
    showAssignTaskAnytimeModal,
    setShowAssignTaskAnytimeModal,
    anytimeTaskForm,
    setAnytimeTaskForm,
    roleInputs,
    setRoleInputs,
    taskInputs,
    setTaskInputs,
    editingIndividualCandidate,
    setEditingIndividualCandidate,
    singleRoleInput,
    setSingleRoleInput,
    singleDescInput,
    setSingleDescInput,
    singleEditError,
    setSingleEditError,
    showDeletePasswordModal,
    setShowDeletePasswordModal,
    projectToDelete,
    setProjectToDelete,
    deletePasswordInput,
    setDeletePasswordInput,
    deletePasswordError,
    setDeletePasswordError,
    validatingPassword,
    setValidatingPassword,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingProject,
    setEditingProject,
    projectForm,
    setProjectForm,
    viewingStudentProfile,
    setViewingStudentProfile,
    studentMeetingsMap,
    studentReviewsMap,
    studentAcceptanceMap,
    studentFeedbackMap,
    showReviewModal,
    setShowReviewModal,
    reviewForm,
    setReviewForm,
    showFeedbackModal,
    setShowFeedbackModal,
    feedbackForm,
    setFeedbackForm,
    fetchInitialData,
    handleSaveReview,
    handleSaveFeedback,
    handleToggleAcceptance,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleAssignTaskAnytime,
    handleSaveTaskAssignments,
    handleSaveSingleCandidateRole,
  };
};
