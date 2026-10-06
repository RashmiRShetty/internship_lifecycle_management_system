export interface RealInternship {
  id: number;
  title: string;
  department: string;
  role: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  mode: string;
  stipend: string;
  duration: string;
  location: string;
  description: string;
  eligibilityCriteria: string;
  skillsRequired: string[] | string;
  skillsPreferred: string[];
  postedDate: string;
  applicationDeadline: string;
  startDate: string;
  openings: number;
  facultyId: string;
  status: 'OPEN' | 'CLOSED';
  weeklySubmissionDay: number;
}

export const REAL_INTERNSHIPS: RealInternship[] = [];

export interface SampleApplication {
  id: number;
  internshipId: number;
  internshipTitle: string;
  studentEmail: string;
  facultyEmail: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
  appliedAt: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export const SAMPLE_APPLICATIONS: SampleApplication[] = [
  {
    id: 101,
    internshipId: 1,
    internshipTitle: 'Full-Stack Web Development Intern',
    studentEmail: 'rashmi.pai@learner.manipal.edu',
    facultyEmail: 'dr.sharma@manipal.edu',
    status: 'SHORTLISTED',
    appliedAt: '2026-09-02T10:15:00',
    resumeUrl: '',
    coverLetter: 'Passionate full-stack developer with React and Spring Boot projects on GitHub.',
  },
  {
    id: 102,
    internshipId: 2,
    internshipTitle: 'Machine Learning Research Intern',
    studentEmail: 'rashmi.pai@learner.manipal.edu',
    facultyEmail: 'dr.rao@manipal.edu',
    status: 'UNDER_REVIEW',
    appliedAt: '2026-09-05T14:32:00',
    resumeUrl: '',
    coverLetter: 'Final year CSE student with 2 ML research projects on NLP and image classification.',
  },
  {
    id: 103,
    internshipId: 3,
    internshipTitle: 'UI/UX Creative Design Intern',
    studentEmail: 'rashmi.pai@learner.manipal.edu',
    facultyEmail: 'prof.iyer@manipal.edu',
    status: 'INTERVIEW',
    appliedAt: '2026-09-01T09:00:00',
    resumeUrl: '',
    coverLetter: 'Creative designer with a Figma portfolio of 10+ projects including mobile apps.',
  },
  {
    id: 104,
    internshipId: 6,
    internshipTitle: 'Cloud DevOps & Infrastructure Intern',
    studentEmail: 'rashmi.pai@learner.manipal.edu',
    facultyEmail: 'prof.kulkarni@manipal.edu',
    status: 'SELECTED',
    appliedAt: '2026-08-28T16:45:00',
    resumeUrl: '',
    coverLetter: 'AWS Certified Cloud Practitioner with Docker and Kubernetes hobby projects.',
  },
  {
    id: 105,
    internshipId: 5,
    internshipTitle: 'Embedded Systems & IoT Intern',
    studentEmail: 'rashmi.pai@learner.manipal.edu',
    facultyEmail: 'dr.menon@manipal.edu',
    status: 'APPLIED',
    appliedAt: '2026-09-10T11:20:00',
    resumeUrl: '',
    coverLetter: 'ECE student with Arduino home automation projects and ESP32 sensor network experience.',
  },
];

export const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    userEmail: 'rashmi.pai@learner.manipal.edu',
    title: 'Application Shortlisted',
    message: 'Congratulations! Your application for Full-Stack Web Development Intern has been shortlisted.',
    isRead: false,
    createdAt: '2026-09-14T09:00:00',
    type: 'APPLICATION',
  },
  {
    id: 2,
    userEmail: 'rashmi.pai@learner.manipal.edu',
    title: 'Interview Scheduled',
    message: 'Dr. Iyer has scheduled a UI/UX interview for September 20th at 2:00 PM.',
    isRead: false,
    createdAt: '2026-09-13T15:30:00',
    type: 'MEETING',
  },
  {
    id: 3,
    userEmail: 'rashmi.pai@learner.manipal.edu',
    title: 'Offer Letter Available',
    message: 'Your offer letter for Cloud DevOps Intern is ready to view in the Applications tab.',
    isRead: true,
    createdAt: '2026-09-11T11:15:00',
    type: 'OFFER',
  },
];

export const SAMPLE_PROFILE = {
  email: 'rashmi.pai@learner.manipal.edu',
  firstName: 'Rashmi',
  lastName: 'Pai',
  phone: '+91 98765 43210',
  course: 'B.Tech Computer Science & Engineering',
  semester: 7,
  cgpa: 8.65,
  skills: 'React, TypeScript, Python, SQL, Node.js, Docker, AWS, Figma',
  interestedDomain: 'Full-Stack Development, Machine Learning, Cloud',
  profileComplete: true,
  university: 'Manipal Institute of Technology (MAHE)',
  registrationNumber: '220911234',
  linkedinUrl: 'https://linkedin.com/in/rashmipai',
  githubUrl: 'https://github.com/rashmipai',
  projects: 'Student portal dashboard, Expense tracker app, ML classifier, Portfolio website',
  certificates: 'AWS Cloud Practitioner, Meta Frontend Professional, Google Data Analytics',
};
