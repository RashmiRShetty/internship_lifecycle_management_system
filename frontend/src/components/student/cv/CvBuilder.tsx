import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Download,
  Loader2,
  RefreshCw,
  Layout,
  FileText,
  User,
  GraduationCap,
  Code2,
  Filter,
  Plus,
  Trash2,
  Briefcase,
  FolderGit2,
  Award,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Languages,
  Trophy,
  BookOpen,
  HeartHandshake,
  Terminal,
  Layers,
} from 'lucide-react';
import api from '../../../services/api';
import type {
  CvData,
  TemplateId,
  TemplateCategory,
  WorkExperienceItem,
  LanguageItem,
  AwardItem,
  PublicationItem,
  VolunteerItem,
  EducationItem,
  CustomSectionItem,
} from './cvTemplates';
import {
  TEMPLATES,
  TemplateThumbnailPreview,
  ModernTechTemplate,
  ClassicExecutiveTemplate,
  CreativeMinimalistTemplate,
  TwoColumnCompactTemplate,
  MinimalistSwissTemplate,
  EmeraldAccentTemplate,
  PurpleGradientTemplate,
  AcademicBorderTemplate,
} from './cvTemplates';

interface CvBuilderProps {
  profileData?: any;
  studentEmail?: string;
}

const LOCAL_STORAGE_KEY = 'student_portal_cv_draft_v3';

export const CvBuilder: React.FC<CvBuilderProps> = ({ profileData, studentEmail }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
  const [previewMode] = useState<'light' | 'dark'>('light');
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  type TabId =
    | 'personal'
    | 'bio'
    | 'experience'
    | 'projects'
    | 'education'
    | 'certificates'
    | 'skills'
    | 'coding'
    | 'languages'
    | 'awards'
    | 'publications'
    | 'volunteer'
    | 'custom';

  const [activeTab, setActiveTab] = useState<TabId>('personal');

  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Tag inputs state
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getInitialData = (): CvData => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fullName) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved CV draft:', e);
    }

    let parsedCertificates: any[] = [];
    try {
      if (profileData?.certificates) {
        parsedCertificates = typeof profileData.certificates === 'string' ? JSON.parse(profileData.certificates) : profileData.certificates;
      }
    } catch {}

    let parsedProjects: any[] = [];
    try {
      if (profileData?.projects) {
        parsedProjects = typeof profileData.projects === 'string' ? JSON.parse(profileData.projects) : profileData.projects;
      }
    } catch {}

    const rawSkills = profileData?.skills
      ? typeof profileData.skills === 'string'
        ? profileData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : profileData.skills
      : ['React.js', 'Node.js', 'Python', 'TypeScript', 'Tailwind CSS', 'SQL'];

    const rawInterests = profileData?.interestedDomain
      ? typeof profileData.interestedDomain === 'string'
        ? profileData.interestedDomain.split(',').map((s: string) => s.trim()).filter(Boolean)
        : profileData.interestedDomain
      : ['Web Development', 'Machine Learning', 'Cloud Computing', 'Data Analytics'];

    const defaultWorkExperiences: WorkExperienceItem[] = [
      {
        id: '1',
        role: 'Software Developer Intern',
        company: 'Tech Innovations Inc.',
        startDate: 'Jun 2023',
        endDate: 'Aug 2023',
        location: 'Boston, MA',
        description: '• Built responsive user dashboard components using React and TypeScript.\n• Integrated REST APIs with backend services, improving page load speed by 25%.\n• Conducted code reviews and unit testing for core API modules.',
      },
    ];

    const defaultLanguages: LanguageItem[] = [
      { id: 'l1', language: 'English', proficiency: 'Native / Fluent' },
      { id: 'l2', language: 'Spanish', proficiency: 'Intermediate' },
    ];

    const defaultAwards: AwardItem[] = [
      { id: 'a1', title: '1st Place Hackathon Winner', issuer: 'National University Hackfest', date: '2023', description: 'Built an AI accessibility tool for visually impaired users.' },
      { id: 'a2', title: "Dean's Honor List", issuer: 'Faculty of Engineering', date: '2022 - 2023' },
    ];

    const defaultPublications: PublicationItem[] = [
      { id: 'pb1', title: 'Optimizing Recommendation Systems in Academic Portals', publisher: 'IEEE Student Conference', date: '2023', link: 'doi.org/10.1109/example', description: 'Co-authored research on collaborative filtering algorithms.' },
    ];

    const defaultVolunteering: VolunteerItem[] = [
      { id: 'v1', role: 'Student Tech Lead', organization: 'ACM Student Chapter', startDate: '2023', endDate: 'Present', description: 'Organized coding bootcamps and workshops for 200+ students.' },
    ];

    const defaultEducationList: EducationItem[] = [
      { id: 'e1', institution: 'State High School', degree: 'High School Diploma (STEM)', startDate: '2018', endDate: '2020', cgpa: '3.95' },
    ];

    return {
      fullName: profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : 'Alex Morgan',
      title: profileData?.department ? `${profileData.department} Student` : 'Computer Science Student',
      email: studentEmail || profileData?.email || 'alex.morgan@university.edu',
      phone: profileData?.phone || '+1 (555) 019-2834',
      location: profileData?.collegeName || 'Boston, MA, USA',
      department: profileData?.department || 'Computer Science & Engineering',
      collegeName: profileData?.collegeName || 'State Institute of Technology',
      registrationNumber: profileData?.registrationNumber || 'REG-2024-8849',
      cgpa: profileData?.cgpa || '3.92 / 4.0',
      bio: profileData?.bio || 'Passionate software engineering student with expertise in full-stack web application development, algorithm design, and cloud technologies. Seeking internship opportunities to contribute and innovate.',
      linkedin: profileData?.linkedin || 'linkedin.com/in/alexmorgan',
      github: profileData?.github || 'github.com/alexmorgan',
      portfolio: profileData?.portfolio || 'alexmorgan.dev',
      profilePhoto: profileData?.profilePhoto || '',
      showPhoto: true,
      codingProfiles: {
        leetcode: 'alex_codes',
        hackerrank: 'alexmorgan_dev',
        kaggle: 'alexm_data',
      },
      skills: rawSkills,
      interests: rawInterests,
      experience: profileData?.experience || '',
      workExperiences: defaultWorkExperiences,
      completedCourseworks: profileData?.completedCourseworks || 'Data Structures, Operating Systems, Web Development, Database Management, Machine Learning',
      projects: parsedProjects.length > 0 ? parsedProjects : [
        {
          id: 'p1',
          name: 'AI Smart Internship Portal',
          description: 'Full-stack platform matching students with faculty research internships using machine learning recommendation algorithms.',
          link: 'github.com/project-internship',
          techStack: 'React, Node.js, Python, PostgreSQL',
        },
        {
          id: 'p2',
          name: 'Real-time Analytics Dashboard',
          description: 'High performance data visualization web app built with React, Tailwind CSS, and WebSocket streaming.',
          link: 'github.com/analytics-dash',
          techStack: 'React, TypeScript, WebSocket, Chart.js',
        },
      ],
      certificates: parsedCertificates.length > 0 ? parsedCertificates : [
        { id: 'c1', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', issueDate: '2023' },
        { id: 'c2', name: 'Full-Stack Web Development', issuer: 'Coursera / DeepLearning.AI', issueDate: '2023' },
      ],
      educationList: defaultEducationList,
      languages: defaultLanguages,
      awards: defaultAwards,
      publications: defaultPublications,
      volunteering: defaultVolunteering,
      customSections: [
        { id: 'cs1', sectionTitle: 'Key Seminars & Workshops', content: '• Attended Global Web3 & Cloud Engineering Summit (2023)\n• Participated in Open Source Security Workshop by Linux Foundation' },
      ],
    };
  };

  const [cvData, setCvData] = useState<CvData>(getInitialData);

  useEffect(() => {
    if (profileData && !localStorage.getItem(LOCAL_STORAGE_KEY)) {
      setCvData(getInitialData());
    }
  }, [profileData]);

  // Auto-Save Effect
  useEffect(() => {
    if (autoSaveEnabled) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));
      } catch (e) {
        console.error('Auto-save error:', e);
      }
    }
  }, [cvData, autoSaveEnabled]);

  // Save CV to Website (Saves both to local storage draft & updates database student profile)
  const handleSaveWebsiteCV = async () => {
    setIsSavingProfile(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cvData));

      const nameParts = cvData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await api.put('/users/profile/student', {
        email: studentEmail || cvData.email,
        firstName,
        lastName,
        phone: cvData.phone,
        department: cvData.department,
        collegeName: cvData.collegeName,
        registrationNumber: cvData.registrationNumber,
        cgpa: cvData.cgpa,
        bio: cvData.bio,
        linkedin: cvData.linkedin,
        github: cvData.github,
        skills: cvData.skills.join(', '),
        interestedDomain: cvData.interests.join(', '),
        projects: JSON.stringify(cvData.projects),
        certificates: JSON.stringify(cvData.certificates),
      });

      showToast('CV Saved to Website Successfully!');
    } catch (err: any) {
      console.error('Failed to sync profile:', err);
      showToast('CV Saved to Website (Local Storage)!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Optional: Import JSON File Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported && imported.fullName) {
            setCvData(imported);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(imported));
            showToast('CV backup file successfully imported!');
          } else {
            showToast('Invalid CV backup format.');
          }
        } catch (err) {
          showToast('Failed to parse JSON backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image size must be under 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvData({
          ...cvData,
          profilePhoto: reader.result as string,
          showPhoto: true,
        });
        showToast('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setCvData({ ...cvData, profilePhoto: '', showPhoto: false });
    showToast('Profile photo removed.');
  };

  const handleReset = () => {
    if (window.confirm('Reset CV data back to default profile details? This will clear custom edits.')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setCvData(getInitialData());
      showToast('CV reset to profile defaults.');
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  const handleSavePdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: previewMode === 'light' ? '#ffffff' : '#0b132b',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const canvasWidthMm = imgWidth * ratio;
      const canvasHeightMm = imgHeight * ratio;
      const marginX = (pdfWidth - canvasWidthMm) / 2;

      pdf.addImage(imgData, 'PNG', marginX, 0, canvasWidthMm, canvasHeightMm);

      const fileName = `${cvData.fullName.trim().replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
      showToast('Image PDF downloaded successfully!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // ATS Score Calculator
  const calculateAtsScore = () => {
    let score = 0;
    const items: { label: string; passed: boolean }[] = [];

    const hasContact = cvData.fullName && cvData.email && cvData.phone;
    items.push({ label: 'Contact Info Complete', passed: Boolean(hasContact) });
    if (hasContact) score += 15;

    const hasBio = cvData.bio && cvData.bio.trim().length >= 40;
    items.push({ label: 'Professional Summary', passed: Boolean(hasBio) });
    if (hasBio) score += 15;

    const hasExp = (cvData.workExperiences && cvData.workExperiences.length > 0) || (cvData.experience && cvData.experience.trim().length > 20);
    items.push({ label: 'Work Experience / Roles', passed: Boolean(hasExp) });
    if (hasExp) score += 15;

    const hasProjects = cvData.projects && cvData.projects.length >= 1;
    items.push({ label: 'Technical Projects', passed: Boolean(hasProjects) });
    if (hasProjects) score += 15;

    const hasSkills = cvData.skills && cvData.skills.length >= 4;
    items.push({ label: 'Key Technical Skills (4+)', passed: Boolean(hasSkills) });
    if (hasSkills) score += 15;

    const hasLanguages = cvData.languages && cvData.languages.length >= 1;
    items.push({ label: 'Languages Listed', passed: Boolean(hasLanguages) });
    if (hasLanguages) score += 10;

    const hasAwardsOrPubs = (cvData.awards && cvData.awards.length > 0) || (cvData.publications && cvData.publications.length > 0);
    items.push({ label: 'Awards or Publications', passed: Boolean(hasAwardsOrPubs) });
    if (hasAwardsOrPubs) score += 10;

    if (previewMode === 'light') score += 5;

    return { score: Math.min(100, score), items };
  };

  const { score: atsScore, items: atsChecklist } = calculateAtsScore();

  // Handlers for dynamic list updates
  const handleAddExperience = () => {
    const newExp: WorkExperienceItem = {
      id: Date.now().toString(),
      role: 'Role Title (e.g. Developer Intern)',
      company: 'Company / Research Lab',
      startDate: 'Jun 2024',
      endDate: 'Present',
      location: 'City, State',
      description: '• Developed key features using React and TypeScript.',
    };
    setCvData({ ...cvData, workExperiences: [...(cvData.workExperiences || []), newExp] });
  };

  const handleUpdateExperience = (id: string, field: keyof WorkExperienceItem, val: string) => {
    setCvData({
      ...cvData,
      workExperiences: (cvData.workExperiences || []).map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp)),
    });
  };

  const handleRemoveExperience = (id: string) => {
    setCvData({ ...cvData, workExperiences: (cvData.workExperiences || []).filter((exp) => exp.id !== id) });
  };

  // Language handlers
  const handleAddLanguage = () => {
    const newLang: LanguageItem = { id: Date.now().toString(), language: 'Language', proficiency: 'Fluent' };
    setCvData({ ...cvData, languages: [...(cvData.languages || []), newLang] });
  };

  const handleUpdateLanguage = (idx: number, field: keyof LanguageItem, val: string) => {
    const updated = [...(cvData.languages || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, languages: updated });
  };

  const handleRemoveLanguage = (idx: number) => {
    const updated = [...(cvData.languages || [])];
    updated.splice(idx, 1);
    setCvData({ ...cvData, languages: updated });
  };

  // Award handlers
  const handleAddAward = () => {
    const newAward: AwardItem = { id: Date.now().toString(), title: 'Award / Honor Title', issuer: 'Issuing Organization', date: '2024' };
    setCvData({ ...cvData, awards: [...(cvData.awards || []), newAward] });
  };

  const handleUpdateAward = (idx: number, field: keyof AwardItem, val: string) => {
    const updated = [...(cvData.awards || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, awards: updated });
  };

  const handleRemoveAward = (idx: number) => {
    const updated = [...(cvData.awards || [])];
    updated.splice(idx, 1);
    setCvData({ ...cvData, awards: updated });
  };

  // Publication handlers
  const handleAddPublication = () => {
    const newPub: PublicationItem = { id: Date.now().toString(), title: 'Research Paper Title', publisher: 'Journal / Conference', date: '2024' };
    setCvData({ ...cvData, publications: [...(cvData.publications || []), newPub] });
  };

  const handleUpdatePublication = (idx: number, field: keyof PublicationItem, val: string) => {
    const updated = [...(cvData.publications || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, publications: updated });
  };

  const handleRemovePublication = (idx: number) => {
    const updated = [...(cvData.publications || [])];
    updated.splice(idx, 1);
    setCvData({ ...cvData, publications: updated });
  };

  // Volunteer handlers
  const handleAddVolunteer = () => {
    const newVol: VolunteerItem = { id: Date.now().toString(), role: 'Volunteer Role', organization: 'Organization / Club', startDate: '2023', endDate: 'Present' };
    setCvData({ ...cvData, volunteering: [...(cvData.volunteering || []), newVol] });
  };

  const handleUpdateVolunteer = (idx: number, field: keyof VolunteerItem, val: string) => {
    const updated = [...(cvData.volunteering || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, volunteering: updated });
  };

  const handleRemoveVolunteer = (idx: number) => {
    const updated = [...(cvData.volunteering || [])];
    updated.splice(idx, 1);
    setCvData({ ...cvData, volunteering: updated });
  };

  // Education list handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = { id: Date.now().toString(), institution: 'High School / Secondary College', degree: 'Diploma / High School', endDate: '2020' };
    setCvData({ ...cvData, educationList: [...(cvData.educationList || []), newEdu] });
  };

  const handleUpdateEducation = (idx: number, field: keyof EducationItem, val: string) => {
    const updated = [...(cvData.educationList || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, educationList: updated });
  };

  const handleRemoveEducation = (idx: number) => {
    const updated = [...(cvData.educationList || [])];
    updated.splice(idx, 1);
    setCvData({ ...cvData, educationList: updated });
  };

  // Custom section handlers
  const handleAddCustomSection = () => {
    const newSec: CustomSectionItem = { id: Date.now().toString(), sectionTitle: 'Custom Title', content: '• Add details here...' };
    setCvData({ ...cvData, customSections: [...(cvData.customSections || []), newSec] });
  };

  const handleUpdateCustomSection = (idx: number, field: keyof CustomSectionItem, val: string) => {
    const updated = [...(cvData.customSections || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, customSections: updated });
  };

  const handleRemoveCustomSection = (idx: number) => {
    const updated = [...(cvData.customSections || [])];
    updated.splice(idx, 1);
    setCvData({ ...cvData, customSections: updated });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj = {
      id: Date.now().toString(),
      name: 'New Technical Project',
      description: 'Built an interactive application solving key domain challenges.',
      link: 'github.com/username/project',
      techStack: 'React, Node.js',
    };
    setCvData({ ...cvData, projects: [...cvData.projects, newProj] });
  };

  const handleUpdateProject = (id: string, field: string, val: string) => {
    setCvData({
      ...cvData,
      projects: cvData.projects.map((p) => (p.id === id || p.name === id ? { ...p, [field]: val } : p)),
    });
  };

  const handleRemoveProject = (idx: number) => {
    const updated = [...cvData.projects];
    updated.splice(idx, 1);
    setCvData({ ...cvData, projects: updated });
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    const newCert = { id: Date.now().toString(), name: 'Certificate Title', issuer: 'Issuing Body', issueDate: '2024' };
    setCvData({ ...cvData, certificates: [...cvData.certificates, newCert] });
  };

  const handleUpdateCertificate = (idx: number, field: string, val: string) => {
    const updated = [...cvData.certificates];
    updated[idx] = { ...updated[idx], [field]: val };
    setCvData({ ...cvData, certificates: updated });
  };

  const handleRemoveCertificate = (idx: number) => {
    const updated = [...cvData.certificates];
    updated.splice(idx, 1);
    setCvData({ ...cvData, certificates: updated });
  };

  // Skill & Interest Handlers
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!cvData.skills.includes(newSkill.trim())) {
      setCvData({ ...cvData, skills: [...cvData.skills, newSkill.trim()] });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCvData({ ...cvData, skills: cvData.skills.filter((s) => s !== skillToRemove) });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (!cvData.interests.includes(newInterest.trim())) {
      setCvData({ ...cvData, interests: [...cvData.interests, newInterest.trim()] });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setCvData({ ...cvData, interests: cvData.interests.filter((i) => i !== interestToRemove) });
  };

  const renderTemplate = () => {
    const props = { data: cvData, mode: previewMode };
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTechTemplate {...props} />;
      case 'classic':
        return <ClassicExecutiveTemplate {...props} />;
      case 'creative':
        return <CreativeMinimalistTemplate {...props} />;
      case 'twocolumn':
        return <TwoColumnCompactTemplate {...props} />;
      case 'minimalist_line':
        return <MinimalistSwissTemplate {...props} />;
      case 'emerald_accent':
        return <EmeraldAccentTemplate {...props} />;
      case 'purple_gradient':
        return <PurpleGradientTemplate {...props} />;
      case 'academic_border':
        return <AcademicBorderTemplate {...props} />;
      default:
        return <ClassicExecutiveTemplate {...props} />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          header, aside, nav, .sd-sidebar, .glass-header, .print\\:hidden {
            display: none !important;
          }
          #cv-printable-area, #cv-printable-area * {
            visibility: visible !important;
          }
          #cv-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Hidden JSON File Input */}
      <input
        type="file"
        ref={jsonFileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-sky-500 text-white font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-sky-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Main Header */}
      <div className="bg-[#0b132b]/90 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">ATS Resume & Multi-Section CV Builder</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Customize 13+ sections, upload profile photos, verify ATS scores, and save your CV to local storage or backend profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* PRIMARY SAVE ACTION: SAVE CV DIRECTLY TO WEBSITE */}
          <button
            onClick={handleSaveWebsiteCV}
            disabled={isSavingProfile}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl transition shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            title="Save your CV directly to the website & student profile"
          >
            {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSavingProfile ? 'Saving...' : 'Save CV'}
          </button>

          {/* PRINT PDF */}
          <button
            onClick={handleNativePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition shadow-sm cursor-pointer"
            title="Print or Save clean Vector PDF"
          >
            <Printer className="w-4 h-4 text-sky-400" /> Print PDF
          </button>

          {/* SAVE AS PDF */}
          <button
            onClick={handleSavePdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Save as PDF'}
          </button>
        </div>
      </div>

      {/* Auto-Save & Save Status Bar */}
      <div className="bg-[#0b132b]/80 border border-slate-800 rounded-xl px-4 py-2 flex justify-between items-center text-xs text-slate-400 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto-Save to Browser Storage: <strong className="text-white">{autoSaveEnabled ? 'ACTIVE' : 'OFF'}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-slate-700"
            />
            Enable Auto-Save
          </label>
          <button onClick={handleReset} className="text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Collapsible Template Selector Bar */}
      <div className="bg-[#0b132b]/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
              <Layout className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Template Design:</span>
                <span className="text-sm font-extrabold text-white bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-lg border border-sky-500/30">
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Classic Standard'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTemplateSelectorOpen(!isTemplateSelectorOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            {isTemplateSelectorOpen ? 'Hide Templates ▲' : 'Change Template (8 Available) ▼'}
          </button>
        </div>

        {isTemplateSelectorOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                Filter:
              </span>
              {(['All', 'Corporate & Executive', 'Tech & Engineering', 'Creative & Design', 'Academic & Research'] as TemplateCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.filter((t) => (selectedCategory === 'All' ? true : t.category === selectedCategory)).map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl.id);
                      setIsTemplateSelectorOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all duration-200 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-400 shadow-xl ring-2 ring-sky-400/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="mb-3 transform group-hover:scale-[1.02] transition-transform duration-200">
                        <TemplateThumbnailPreview templateId={tmpl.id} />
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-xs text-white group-hover:text-sky-300 transition">{tmpl.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 mt-1">{tmpl.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left Column Controls */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          {/* 1. Form Editor Section Tabs AT THE VERY TOP */}
          <div className="bg-[#0b132b]/90 border border-sky-500/30 rounded-2xl p-3.5 shadow-lg space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Select Section to Edit:
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full font-extrabold border border-sky-500/30">
                13 Editor Tabs
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'personal', label: 'Personal & Photo', icon: User },
                { id: 'bio', label: 'Summary', icon: Sparkles },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'projects', label: 'Projects', icon: FolderGit2 },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'skills', label: 'Skills & Interests', icon: Code2 },
                { id: 'coding', label: 'Coding Profiles', icon: Terminal },
                { id: 'languages', label: 'Languages', icon: Languages },
                { id: 'awards', label: 'Awards', icon: Trophy },
                { id: 'publications', label: 'Publications', icon: BookOpen },
                { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake },
                { id: 'certificates', label: 'Certificates', icon: Award },
                { id: 'custom', label: 'Custom Section', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-400/40'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Active Tab Form Controls DIRECTLY BELOW TABS */}
          <div className="bg-[#0b132b]/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4 max-h-[650px] overflow-y-auto">
            {/* 1. PERSONAL INFO & PROFILE PHOTO */}
            {activeTab === 'personal' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4 text-sky-400" /> Personal Info & Profile Photo
                </h3>

                {/* Photo Upload Section */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
                  {cvData.profilePhoto ? (
                    <img src={cvData.profilePhoto} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-sky-400" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold rounded-lg hover:bg-sky-500/30 cursor-pointer"
                      >
                        Upload Photo
                      </button>
                      {cvData.profilePhoto && (
                        <button
                          onClick={handleRemovePhoto}
                          className="px-2 py-1 text-rose-400 text-xs font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cvData.showPhoto ?? true}
                        onChange={(e) => setCvData({ ...cvData, showPhoto: e.target.checked })}
                        className="rounded border-slate-700"
                      />
                      <span>Show Photo on Resume Header</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
                    <input type="text" value={cvData.fullName} onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Title / Headline</label>
                    <input type="text" value={cvData.title} onChange={(e) => setCvData({ ...cvData, title: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                    <input type="text" value={cvData.email} onChange={(e) => setCvData({ ...cvData, email: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Phone Number</label>
                    <input type="text" value={cvData.phone} onChange={(e) => setCvData({ ...cvData, phone: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Location (City, Country)</label>
                  <input type="text" value={cvData.location} onChange={(e) => setCvData({ ...cvData, location: e.target.value })} className="input-field mt-1" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">LinkedIn</label>
                    <input type="text" value={cvData.linkedin} onChange={(e) => setCvData({ ...cvData, linkedin: e.target.value })} className="input-field mt-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">GitHub</label>
                    <input type="text" value={cvData.github} onChange={(e) => setCvData({ ...cvData, github: e.target.value })} className="input-field mt-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Portfolio</label>
                    <input type="text" value={cvData.portfolio || ''} onChange={(e) => setCvData({ ...cvData, portfolio: e.target.value })} className="input-field mt-1 text-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUMMARY BIO */}
            {activeTab === 'bio' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-sky-400" /> Executive / Profile Summary
                </h3>
                <textarea
                  rows={4}
                  value={cvData.bio}
                  onChange={(e) => setCvData({ ...cvData, bio: e.target.value })}
                  className="input-field mt-1 text-xs leading-relaxed"
                />
              </div>
            )}

            {/* 3. WORK EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-sky-400" /> Work Experience & Internships
                  </h3>
                  <button onClick={handleAddExperience} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-sky-500/20 text-sky-400 rounded-lg cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Role
                  </button>
                </div>
                {(cvData.workExperiences || []).map((exp, idx) => (
                  <div key={exp.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Role #{idx + 1}</span>
                      <button onClick={() => handleRemoveExperience(exp.id!)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={exp.role} onChange={(e) => handleUpdateExperience(exp.id!, 'role', e.target.value)} placeholder="Role Title" className="input-field text-xs" />
                      <input type="text" value={exp.company} onChange={(e) => handleUpdateExperience(exp.id!, 'company', e.target.value)} placeholder="Company" className="input-field text-xs" />
                    </div>
                    <textarea rows={2} value={exp.description} onChange={(e) => handleUpdateExperience(exp.id!, 'description', e.target.value)} placeholder="Bullet achievements..." className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}

            {/* 4. PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-sky-400" /> Technical Projects
                  </h3>
                  <button onClick={handleAddProject} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-sky-500/20 text-sky-400 rounded-lg cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
                {cvData.projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Project #{idx + 1}</span>
                      <button onClick={() => handleRemoveProject(idx)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="text" value={proj.name} onChange={(e) => handleUpdateProject(proj.id || proj.name, 'name', e.target.value)} placeholder="Project Name" className="input-field text-xs" />
                    <input type="text" value={proj.techStack || ''} onChange={(e) => handleUpdateProject(proj.id || proj.name, 'techStack', e.target.value)} placeholder="Tech Stack" className="input-field text-xs" />
                    <textarea rows={2} value={proj.description} onChange={(e) => handleUpdateProject(proj.id || proj.name, 'description', e.target.value)} placeholder="Description..." className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}

            {/* 5. EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-400" /> Primary University Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input type="text" value={cvData.collegeName} onChange={(e) => setCvData({ ...cvData, collegeName: e.target.value })} placeholder="University / College" className="input-field text-xs" />
                    <input type="text" value={cvData.department} onChange={(e) => setCvData({ ...cvData, department: e.target.value })} placeholder="Department / Major" className="input-field text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input type="text" value={cvData.cgpa} onChange={(e) => setCvData({ ...cvData, cgpa: e.target.value })} placeholder="CGPA" className="input-field text-xs" />
                    <input type="text" value={cvData.completedCourseworks} onChange={(e) => setCvData({ ...cvData, completedCourseworks: e.target.value })} placeholder="Relevant Coursework" className="input-field text-xs" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-sky-400">Additional Education (High School / Diplomas)</h4>
                    <button onClick={handleAddEducation} className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                      <Plus className="w-3 h-3" /> Add School
                    </button>
                  </div>
                  {(cvData.educationList || []).map((edu, idx) => (
                    <div key={edu.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-sky-400 uppercase">School/Degree #{idx + 1}</span>
                        <button onClick={() => handleRemoveEducation(idx)} className="text-rose-400 p-1 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={edu.institution} onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)} placeholder="Institution Name" className="input-field text-xs" />
                        <input type="text" value={edu.degree} onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)} placeholder="Degree / Diploma" className="input-field text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CODING PROFILES */}
            {activeTab === 'coding' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Terminal className="w-4 h-4 text-sky-400" /> Competitive Coding Handles
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">LeetCode Username</label>
                    <input
                      type="text"
                      value={cvData.codingProfiles?.leetcode || ''}
                      onChange={(e) => setCvData({ ...cvData, codingProfiles: { ...cvData.codingProfiles, leetcode: e.target.value } })}
                      placeholder="e.g. alex_codes"
                      className="input-field mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">HackerRank Username</label>
                    <input
                      type="text"
                      value={cvData.codingProfiles?.hackerrank || ''}
                      onChange={(e) => setCvData({ ...cvData, codingProfiles: { ...cvData.codingProfiles, hackerrank: e.target.value } })}
                      placeholder="e.g. alex_hr"
                      className="input-field mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Kaggle Handle</label>
                    <input
                      type="text"
                      value={cvData.codingProfiles?.kaggle || ''}
                      onChange={(e) => setCvData({ ...cvData, codingProfiles: { ...cvData.codingProfiles, kaggle: e.target.value } })}
                      placeholder="e.g. alex_kaggle"
                      className="input-field mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Codeforces Handle</label>
                    <input
                      type="text"
                      value={cvData.codingProfiles?.codeforces || ''}
                      onChange={(e) => setCvData({ ...cvData, codingProfiles: { ...cvData.codingProfiles, codeforces: e.target.value } })}
                      placeholder="e.g. alex_cf"
                      className="input-field mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. LANGUAGES */}
            {activeTab === 'languages' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Languages className="w-4 h-4 text-sky-400" /> Languages Spoken
                  </h3>
                  <button onClick={handleAddLanguage} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Language
                  </button>
                </div>
                {(cvData.languages || []).map((lang, idx) => (
                  <div key={lang.id || idx} className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => handleUpdateLanguage(idx, 'language', e.target.value)}
                      placeholder="Language"
                      className="input-field text-xs flex-1"
                    />
                    <select
                      value={lang.proficiency}
                      onChange={(e) => handleUpdateLanguage(idx, 'proficiency', e.target.value)}
                      className="bg-slate-800 text-white text-xs p-2 rounded border border-slate-700"
                    >
                      <option value="Native / Fluent">Native / Fluent</option>
                      <option value="Professional">Professional</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                    <button onClick={() => handleRemoveLanguage(idx)} className="text-rose-400 p-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 8. AWARDS & HONORS */}
            {activeTab === 'awards' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sky-400" /> Honors & Awards
                  </h3>
                  <button onClick={handleAddAward} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Award
                  </button>
                </div>
                {(cvData.awards || []).map((award, idx) => (
                  <div key={award.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Award #{idx + 1}</span>
                      <button onClick={() => handleRemoveAward(idx)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="text" value={award.title} onChange={(e) => handleUpdateAward(idx, 'title', e.target.value)} placeholder="Award Title" className="input-field text-xs" />
                    <input type="text" value={award.issuer} onChange={(e) => handleUpdateAward(idx, 'issuer', e.target.value)} placeholder="Issuer / Host" className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}

            {/* 9. PUBLICATIONS */}
            {activeTab === 'publications' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-400" /> Publications & Research
                  </h3>
                  <button onClick={handleAddPublication} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Paper
                  </button>
                </div>
                {(cvData.publications || []).map((pub, idx) => (
                  <div key={pub.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Publication #{idx + 1}</span>
                      <button onClick={() => handleRemovePublication(idx)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="text" value={pub.title} onChange={(e) => handleUpdatePublication(idx, 'title', e.target.value)} placeholder="Paper Title" className="input-field text-xs" />
                    <input type="text" value={pub.publisher} onChange={(e) => handleUpdatePublication(idx, 'publisher', e.target.value)} placeholder="Journal / Conference" className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}

            {/* 10. VOLUNTEER & LEADERSHIP */}
            {activeTab === 'volunteer' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-sky-400" /> Volunteer & Leadership
                  </h3>
                  <button onClick={handleAddVolunteer} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Role
                  </button>
                </div>
                {(cvData.volunteering || []).map((vol, idx) => (
                  <div key={vol.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Role #{idx + 1}</span>
                      <button onClick={() => handleRemoveVolunteer(idx)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="text" value={vol.role} onChange={(e) => handleUpdateVolunteer(idx, 'role', e.target.value)} placeholder="Role Title" className="input-field text-xs" />
                    <input type="text" value={vol.organization} onChange={(e) => handleUpdateVolunteer(idx, 'organization', e.target.value)} placeholder="Organization / Club" className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}

            {/* 11. CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-sky-400" /> Certifications & Honors
                  </h3>
                  <button onClick={handleAddCertificate} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Cert
                  </button>
                </div>
                {cvData.certificates.map((cert, idx) => (
                  <div key={cert.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Certificate #{idx + 1}</span>
                      <button onClick={() => handleRemoveCertificate(idx)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="text" value={cert.name} onChange={(e) => handleUpdateCertificate(idx, 'name', e.target.value)} placeholder="Certificate Name" className="input-field text-xs" />
                    <input type="text" value={cert.issuer} onChange={(e) => handleUpdateCertificate(idx, 'issuer', e.target.value)} placeholder="Issuer" className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}

            {/* 12. SKILLS & INTERESTS TAG MANAGER */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Code2 className="w-4 h-4 text-sky-400" /> Technical Skills Manager
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()} placeholder="Add skill..." className="input-field text-xs flex-1" />
                    <button onClick={handleAddSkill} className="px-3 py-1 bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cvData.skills.map((s, i) => (
                      <span key={i} className="bg-slate-800 text-sky-300 text-xs px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                        {s} <button onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Areas of Interest
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()} placeholder="Add interest..." className="input-field text-xs flex-1" />
                    <button onClick={handleAddInterest} className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cvData.interests.map((interest, i) => (
                      <span key={i} className="bg-slate-800 text-emerald-300 text-xs px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                        {interest} <button onClick={() => handleRemoveInterest(interest)} className="text-slate-400 hover:text-rose-400">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 13. CUSTOM SECTION */}
            {activeTab === 'custom' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" /> Custom Freeform Sections
                  </h3>
                  <button onClick={handleAddCustomSection} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-sky-500/20 text-sky-400 rounded cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Section
                  </button>
                </div>
                {(cvData.customSections || []).map((sec, idx) => (
                  <div key={sec.id || idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">Custom #{idx + 1}</span>
                      <button onClick={() => handleRemoveCustomSection(idx)} className="text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="text" value={sec.sectionTitle} onChange={(e) => handleUpdateCustomSection(idx, 'sectionTitle', e.target.value)} placeholder="Section Title (e.g. Patents)" className="input-field text-xs" />
                    <textarea rows={3} value={sec.content} onChange={(e) => handleUpdateCustomSection(idx, 'content', e.target.value)} placeholder="Bullet content..." className="input-field text-xs" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. ATS Score Meter Card BELOW FORM CONTROLS */}
          <div className="bg-[#0b132b]/90 border border-sky-500/30 rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" /> ATS Compatibility Meter
              </h3>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                atsScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                atsScore >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {atsScore}% Score
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className={`h-2 transition-all duration-500 ${
                  atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${atsScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {atsChecklist.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-300">
                  {item.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />}
                  <span className={item.passed ? 'text-slate-300' : 'text-slate-400 italic'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live CV Preview */}
        <div className="lg:col-span-7 print:w-full" id="cv-printable-area" ref={printRef}>
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default CvBuilder;
