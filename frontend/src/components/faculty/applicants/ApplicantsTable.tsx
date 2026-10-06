import React, { useState } from 'react';
import { FileText, Sparkles, Video, MessageSquare, CheckCircle2, XCircle, Award, Download, UserCheck, Eye, AlertTriangle } from 'lucide-react';
import { getCertificateForStudent, downloadCertificatePDF, checkAreAllTasksCompleted } from '../../../services/certificateService';
import { calculateRealMatchDetails } from '../../../utils/matchCalculator';
import { ViewResumeModal } from '../ViewResumeModal';
import StudentProfileModal from '../StudentProfileModal';

interface ApplicantsTableProps {
  applications: any[];
  selectedAppIds: number[];
  setSelectedAppIds: React.Dispatch<React.SetStateAction<number[]>>;
  matchMap: Record<string, any>;
  aiLoadingMap?: Record<string, boolean>;
  onInspectMatch: (app: any) => void;
  onScheduleInterview: (app: any) => void;
  onMessageStudent: (email: string) => void;
  onStatusUpdate: (id: number, status: string) => void;
  onIssueCertificate?: (app: any) => void;
}

export const ApplicantsTable: React.FC<ApplicantsTableProps> = ({
  applications,
  selectedAppIds,
  setSelectedAppIds,
  matchMap,
  aiLoadingMap = {},
  onInspectMatch,
  onScheduleInterview,
  onMessageStudent,
  onStatusUpdate,
  onIssueCertificate,
}) => {
  const [candidateFilter, setCandidateFilter] = useState<'ALL' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'PENDING'>('ALL');
  const [viewingResumeStudent, setViewingResumeStudent] = useState<any | null>(null);
  const [viewingDetailsStudent, setViewingDetailsStudent] = useState<any | null>(null);
  const [viewingDetailsMatch, setViewingDetailsMatch] = useState<any | null>(null);
  const [overCapacityCandidate, setOverCapacityCandidate] = useState<{
    application: any;
    selectedCount: number;
    openings: number;
  } | null>(null);

  const isShortlisted = (status: string) => status === 'SHORTLISTED' || status === 'INTERVIEW';
  const isSelected = (status: string) => status === 'SELECTED';
  const isRejected = (status: string) => status === 'REJECTED';

  const requestStatusUpdate = (app: any, status: string) => {
    if (status === 'SELECTED' && !isSelected(app.status)) {
      const internshipKey = app.internshipId != null
        ? String(app.internshipId)
        : String(app.internshipTitle || app.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const selectedCount = applications.filter((candidate) => {
        const candidateKey = candidate.internshipId != null
          ? String(candidate.internshipId)
          : String(candidate.internshipTitle || candidate.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return candidateKey === internshipKey && isSelected(candidate.status);
      }).length;
      const openingValue = Number(app.openings ?? app.postedInternship?.openings ?? 1);
      const openings = Number.isFinite(openingValue) ? Math.max(0, openingValue) : 1;

      if (selectedCount >= openings) {
        setOverCapacityCandidate({ application: app, selectedCount, openings });
        return;
      }
    }

    onStatusUpdate(app.id, status);
  };

  const filteredApplications = applications.filter((app) => {
    if (candidateFilter === 'SHORTLISTED') return isShortlisted(app.status);
    if (candidateFilter === 'SELECTED') return isSelected(app.status);
    if (candidateFilter === 'REJECTED') return isRejected(app.status);
    if (candidateFilter === 'PENDING') return !isShortlisted(app.status) && !isSelected(app.status) && !isRejected(app.status);
    return true;
  });

  const selectedForRole = applications.filter((app) => isSelected(app.status)).length;
  const roleOpeningValue = Number(
    applications[0]?.openings ?? applications[0]?.postedInternship?.openings ?? 1
  );
  const roleOpenings = Number.isFinite(roleOpeningValue) ? Math.max(0, roleOpeningValue) : 1;
  const openingsRemaining = Math.max(0, roleOpenings - selectedForRole);
  const overCapacityCount = Math.max(0, selectedForRole - roleOpenings);

  const allSelected =
    filteredApplications.length > 0 &&
    filteredApplications.every((app) => selectedAppIds.includes(app.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApplications.map((app) => app.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter((item) => item !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  return (
    <div
      style={{
        background: '#081330',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Candidate Status Sub-Filter Bar: ALL, SHORTLISTED, SELECTED, REJECTED, PENDING */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: '#060d1e',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {(['ALL', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'PENDING'] as const).map((tab) => {
            const isActive = candidateFilter === tab;
            const count = applications.filter((a) => {
              if (tab === 'SHORTLISTED') return isShortlisted(a.status);
              if (tab === 'SELECTED') return isSelected(a.status);
              if (tab === 'REJECTED') return isRejected(a.status);
              if (tab === 'PENDING') return !isShortlisted(a.status) && !isSelected(a.status) && !isRejected(a.status);
              return true;
            }).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setCandidateFilter(tab)}
                style={{
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive
                    ? tab === 'SHORTLISTED'
                      ? '#c084fc'
                      : tab === 'SELECTED'
                      ? '#34d399'
                      : tab === 'REJECTED'
                      ? '#f87171'
                      : tab === 'PENDING'
                      ? '#fbbf24'
                      : '#38bdf8'
                    : '#94a3b8',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab === 'ALL'
                  ? `All (${count})`
                  : tab === 'SHORTLISTED'
                  ? `🟣 Shortlisted (${count})`
                  : tab === 'SELECTED'
                  ? `🟢 Selected (${count})`
                  : tab === 'REJECTED'
                  ? `🔴 Rejected (${count})`
                  : `🟡 Pending (${count})`}
              </button>
            );
          })}
        </div>
        <div
          aria-live="polite"
          style={{
            padding: '7px 11px',
            color: overCapacityCount > 0 ? '#fda4af' : openingsRemaining > 0 ? '#a3e635' : '#fbbf24',
            background: overCapacityCount > 0 ? 'rgba(251, 113, 133, 0.12)' : openingsRemaining > 0 ? 'rgba(163, 230, 53, 0.1)' : 'rgba(251, 191, 36, 0.1)',
            border: `1px solid ${overCapacityCount > 0 ? 'rgba(251, 113, 133, 0.3)' : openingsRemaining > 0 ? 'rgba(163, 230, 53, 0.25)' : 'rgba(251, 191, 36, 0.25)'}`,
            borderRadius: '9px',
            fontSize: '11px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {selectedForRole}/{roleOpenings} selected · {overCapacityCount > 0 ? `${overCapacityCount} over capacity` : `${openingsRemaining} openings left`}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#060d1e', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 800 }}>
              <th style={{ padding: '14px 16px', width: '40px' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '14px 16px' }}>CANDIDATE</th>
              <th style={{ padding: '14px 16px' }}>INTERNSHIP ROLE</th>
              <th style={{ padding: '14px 16px' }}>AI MATCH SCORE</th>
              <th style={{ padding: '14px 16px' }}>STATUS</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                  No candidates found under "{candidateFilter}" filter.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => {
                const isChecked = selectedAppIds.includes(app.id);
                const matchKey = `${app.studentEmail}_${app.internshipId}`.toLowerCase();
                let matchData = matchMap ? matchMap[matchKey] : undefined;
                if (!matchData && matchMap) {
                  matchData = Object.values(matchMap).find(
                    (m: any) =>
                      (m.student?.email || m.studentEmail || '').toLowerCase() === (app.studentEmail || '').toLowerCase() &&
                      String(m.internship?.id || m.internshipId) === String(app.internshipId)
                  );
                }

                const studentProfileObj = {
                  skills: app.studentSkills || app.technicalSkills || app.fullStudentProfile?.skills || '',
                  technicalSkills: app.technicalSkills || app.fullStudentProfile?.technicalSkills || '',
                  programmingLanguages: app.programmingLanguages || app.fullStudentProfile?.programmingLanguages || app.languages || '',
                  projects: app.projects || app.fullStudentProfile?.projects || '',
                  certificates: app.certificates || app.fullStudentProfile?.certificates || app.certifications || '',
                  completedCourseworks: app.completedCourseworks || app.fullStudentProfile?.completedCourseworks || app.coursework || '',
                  coursework: app.coursework || app.fullStudentProfile?.coursework || '',
                  bio: app.bio || app.coverLetter || app.fullStudentProfile?.bio || app.about || '',
                  about: app.about || app.fullStudentProfile?.about || '',
                  interestedDomain: app.interestedDomain || app.fullStudentProfile?.interestedDomain || app.domain || '',
                  domain: app.domain || app.fullStudentProfile?.domain || '',
                  experience: app.experience || app.fullStudentProfile?.experience || app.experienceSummary || '',
                  experienceSummary: app.experienceSummary || app.fullStudentProfile?.experienceSummary || '',
                  experienceYears: app.experienceYears ?? app.fullStudentProfile?.experienceYears ?? app.yearsExperience ?? app.totalExperience ?? app.yearsOfExperience ?? null,
                  yearsExperience: app.yearsExperience ?? app.fullStudentProfile?.yearsExperience ?? null,
                  cgpa: app.cgpa ?? app.studentCgpa ?? app.fullStudentProfile?.cgpa ?? null,
                  studentCgpa: app.studentCgpa ?? app.fullStudentProfile?.studentCgpa ?? app.cgpa ?? null,
                  semester: app.semester ?? app.studentSemester ?? app.fullStudentProfile?.semester ?? null,
                  studentSemester: app.studentSemester ?? app.fullStudentProfile?.studentSemester ?? app.semester ?? null,
                  department: app.department || app.fullStudentProfile?.department || app.course || app.studying || '',
                  studying: app.studying || app.fullStudentProfile?.studying || '',
                  course: app.course || app.fullStudentProfile?.course || '',
                  internships: app.internships || app.fullStudentProfile?.internships || app.pastInternships || app.internshipHistory || '',
                  pastInternships: app.pastInternships || app.fullStudentProfile?.pastInternships || '',
                  internshipHistory: app.internshipHistory || app.fullStudentProfile?.internshipHistory || '',
                  workExperiences: app.workExperiences || app.fullStudentProfile?.workExperiences || '',
                  languages: app.languages || app.fullStudentProfile?.languages || '',
                  interests: app.interests || app.fullStudentProfile?.interests || '',
                  awards: app.awards || app.fullStudentProfile?.awards || '',
                  volunteering: app.volunteering || app.fullStudentProfile?.volunteering || '',
                  customSections: app.customSections || app.fullStudentProfile?.customSections || '',
                };

                const internshipObj = {
                  id: app.internshipId,
                  title: app.internshipTitle || app.title || '',
                  internshipTitle: app.internshipTitle || app.title || '',
                  description: app.internshipDescription || app.internshipSkillsRequired && '' ? app.internshipDescription : (app.description || app.internshipDescription || ''),
                  internshipDescription: app.internshipDescription || app.description || '',
                  skillsRequired: app.internshipSkillsRequired || app.skillsRequired || app.requirements || app.technicalRequirements || '',
                  requirements: app.requirements || app.internshipSkillsRequired || app.skillsRequired || '',
                  technicalRequirements: app.technicalRequirements || app.internshipSkillsRequired || app.skillsRequired || '',
                  skillsPreferred: app.internshipSkillsPreferred || app.skillsPreferred || app.preferredSkills || [],
                  preferredSkills: app.preferredSkills || app.internshipSkillsPreferred || app.skillsPreferred || [],
                  eligibilityCriteria: app.internshipEligibility || app.eligibilityCriteria || app.eligibility || app.requiredQualification || '',
                  eligibility: app.eligibility || app.internshipEligibility || app.eligibilityCriteria || '',
                  requiredQualification: app.requiredQualification || app.internshipEligibility || app.eligibilityCriteria || '',
                  preferredQualification: app.preferredQualification || '',
                  responsibilities: app.responsibilities || app.jobResponsibilities || app.duties || app.keyResponsibilities || '',
                  jobResponsibilities: app.jobResponsibilities || app.responsibilities || '',
                  keyResponsibilities: app.keyResponsibilities || app.responsibilities || '',
                  duties: app.duties || app.responsibilities || '',
                  keyProjects: app.keyProjects || app.internshipProjects || '',
                  projects: app.postedInternship?.projects || app.keyProjects || '',
                  mode: app.mode || '',
                  internshipType: app.internshipType || '',
                  duration: app.duration || '',
                  location: app.location || '',
                  department: app.postedInternship?.department || app.internshipDepartment || '',
                };

                const fullInternshipRef = app.postedInternship || {};
                Object.keys(fullInternshipRef).forEach((k) => {
                  if (internshipObj[k as keyof typeof internshipObj] === undefined ||
                      internshipObj[k as keyof typeof internshipObj] === '' ||
                      (Array.isArray(internshipObj[k as keyof typeof internshipObj]) &&
                       (internshipObj[k as keyof typeof internshipObj] as any[]).length === 0)) {
                    if (fullInternshipRef[k] !== undefined && fullInternshipRef[k] !== null && fullInternshipRef[k] !== '') {
                      (internshipObj as any)[k] = fullInternshipRef[k];
                    }
                  }
                });
                const fullStudentRef = app.fullStudentProfile || {};
                Object.keys(fullStudentRef).forEach((k) => {
                  if (studentProfileObj[k as keyof typeof studentProfileObj] === undefined ||
                      studentProfileObj[k as keyof typeof studentProfileObj] === '' ||
                      (Array.isArray(studentProfileObj[k as keyof typeof studentProfileObj]) &&
                       (studentProfileObj[k as keyof typeof studentProfileObj] as any[]).length === 0)) {
                    if (fullStudentRef[k] !== undefined && fullStudentRef[k] !== null && fullStudentRef[k] !== '') {
                      (studentProfileObj as any)[k] = fullStudentRef[k];
                    }
                  }
                });

                const matchResult = calculateRealMatchDetails(internshipObj, studentProfileObj, matchData);
                const matchPct = matchResult.matchPercentage;
                const isAiLoading = !!aiLoadingMap[matchKey];

                const candidateIsSelected = isSelected(app.status);
                const candidateIsShortlisted = isShortlisted(app.status);
                const candidateIsRejected = isRejected(app.status);

                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: isChecked ? 'rgba(56, 189, 248, 0.12)' : 'transparent' }}>
                    <td style={{ padding: '16px' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelectOne(app.id)} style={{ cursor: 'pointer' }} />
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: candidateIsSelected
                              ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                              : candidateIsShortlisted
                              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                              : 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(56, 189, 248, 0.2)',
                          }}
                        >
                          {(app.studentName || app.studentEmail || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '13px' }}>
                            {app.studentName || app.studentEmail}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.studentEmail}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setViewingDetailsStudent(app);
                                setViewingDetailsMatch(matchResult);
                              }}
                              style={{
                                fontSize: '11px',
                                color: '#7dd3fc',
                                fontWeight: 800,
                                background: 'rgba(14, 165, 233, 0.12)',
                                border: '1px solid rgba(125, 211, 252, 0.34)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                              title="View full candidate details"
                            >
                              <Eye size={12} style={{ color: '#7dd3fc' }} /> View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => setViewingResumeStudent(app)}
                              style={{
                                fontSize: '11px',
                                color: '#38bdf8',
                                fontWeight: 800,
                                background: 'rgba(56, 189, 248, 0.12)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                              title="View candidate resume PDF or credential document"
                            >
                              <FileText size={12} style={{ color: '#38bdf8' }} /> View Resume ↗
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        {app.internshipTitle || 'General Internship'}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => onInspectMatch({ ...app, matchResult })}
                        style={{
                          background: isAiLoading ? 'rgba(148, 163, 184, 0.12)' : matchPct >= 60 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: isAiLoading ? '#cbd5e1' : matchPct >= 60 ? '#34d399' : '#fbbf24',
                          border: isAiLoading ? '1px solid rgba(148, 163, 184, 0.25)' : matchPct >= 60 ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '10px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 900,
                          cursor: isAiLoading ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: matchPct >= 60 ? '0 2px 8px rgba(52, 211, 153, 0.15)' : 'none',
                        }}
                      >
                        <Sparkles size={13} style={{ color: isAiLoading ? '#cbd5e1' : matchPct >= 60 ? '#34d399' : '#fbbf24' }} />{' '}
                        {isAiLoading ? 'Calculating…' : `${matchPct}% AI Match →`}
                      </button>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <select
                        value={app.status || 'APPLIED'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'INTERVIEW') {
                            onScheduleInterview(app);
                          }
                          requestStatusUpdate(app, val);
                        }}
                        style={{
                          background: candidateIsSelected
                            ? 'rgba(52, 211, 153, 0.2)'
                            : candidateIsShortlisted
                            ? 'rgba(168, 85, 247, 0.2)'
                            : candidateIsRejected
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                          color: candidateIsSelected
                            ? '#34d399'
                            : candidateIsShortlisted
                            ? '#c084fc'
                            : candidateIsRejected
                            ? '#f87171'
                            : '#fbbf24',
                          border: candidateIsSelected
                            ? '1px solid rgba(52, 211, 153, 0.4)'
                            : candidateIsShortlisted
                            ? '1px solid rgba(168, 85, 247, 0.4)'
                            : candidateIsRejected
                            ? '1px solid rgba(239, 68, 68, 0.4)'
                            : '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="APPLIED" style={{ color: '#fbbf24', background: '#09122a', fontWeight: 700 }}>
                          🟡 APPLIED
                        </option>
                        <option value="SHORTLISTED" style={{ color: '#c084fc', background: '#09122a', fontWeight: 700 }}>
                          🟣 SHORTLISTED
                        </option>
                        <option value="INTERVIEW" style={{ color: '#c084fc', background: '#09122a', fontWeight: 700 }}>
                          🟣 INTERVIEW
                        </option>
                        <option value="SELECTED" style={{ color: '#34d399', background: '#09122a', fontWeight: 700 }}>
                          🟢 SELECTED
                        </option>
                        <option value="REJECTED" style={{ color: '#f87171', background: '#09122a', fontWeight: 700 }}>
                          🔴 REJECTED
                        </option>
                      </select>
                    </td>

                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {candidateIsSelected ? (
                          <>
                            {/* FINAL SELECTED CANDIDATE: CHAT & CERTIFICATE */}
                            <button
                              onClick={() => onMessageStudent(app.studentEmail)}
                              style={{
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <MessageSquare size={13} style={{ color: '#2563eb' }} /> Chat
                            </button>

                            {(() => {
                              const existingCert = getCertificateForStudent(app.studentEmail, app.id);
                              const allTasksDone = checkAreAllTasksCompleted(app);

                              if (existingCert) {
                                return (
                                  <button
                                    onClick={() => downloadCertificatePDF(existingCert)}
                                    title="Download Issued Certificate PDF"
                                    style={{
                                      background: '#e0e7ff',
                                      color: '#3730a3',
                                      border: '1px solid #c7d2fe',
                                      borderRadius: '8px',
                                      padding: '6px 10px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                    }}
                                  >
                                    <Download size={13} style={{ color: '#4338ca' }} /> Certificate PDF
                                  </button>
                                );
                              }

                              if (!allTasksDone) {
                                return (
                                  <button
                                    disabled
                                    title="Student must complete all weekly project tasks before certificate can be allowed/issued"
                                    style={{
                                      background: '#f1f5f9',
                                      color: '#94a3b8',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px',
                                      padding: '6px 10px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'not-allowed',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      opacity: 0.7,
                                    }}
                                  >
                                    <Award size={13} style={{ color: '#94a3b8' }} /> Tasks Pending
                                  </button>
                                );
                              }

                              return (
                                <button
                                  onClick={() => onIssueCertificate && onIssueCertificate(app)}
                                  title="Allow & Issue Internship Certificate (All tasks completed)"
                                  style={{
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                                  }}
                                >
                                  <Award size={13} style={{ color: '#fde047' }} /> Allow &amp; Issue Cert
                                </button>
                              );
                            })()}
                          </>
                        ) : candidateIsShortlisted ? (
                          <>
                            {/* SHORTLISTED PHASE: INTERVIEW -> SELECT -> REJECT */}
                            <button
                              onClick={() => onScheduleInterview(app)}
                              style={{
                                background: '#f3e8ff',
                                color: '#6b21a8',
                                border: '1px solid #d8b4fe',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <Video size={13} style={{ color: '#9333ea' }} /> Interview
                            </button>

                            <button
                              onClick={() => requestStatusUpdate(app, 'SELECTED')}
                              style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <CheckCircle2 size={13} style={{ color: '#10b981' }} /> Select
                            </button>

                            <button
                              onClick={() => onStatusUpdate(app.id, 'REJECTED')}
                              style={{
                                background: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <XCircle size={13} style={{ color: '#ef4444' }} /> Reject
                            </button>
                          </>
                        ) : (
                          <>
                            {/* BEFORE SHORTLISTING: SHORTLIST OR REJECT */}
                            <button
                              onClick={() => onStatusUpdate(app.id, 'SHORTLISTED')}
                              style={{
                                background: '#f3e8ff',
                                color: '#6b21a8',
                                border: '1px solid #d8b4fe',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <UserCheck size={13} style={{ color: '#9333ea' }} /> Shortlist
                            </button>

                            {!candidateIsRejected && (
                              <button
                                onClick={() => onStatusUpdate(app.id, 'REJECTED')}
                                style={{
                                  background: '#fef2f2',
                                  color: '#b91c1c',
                                  border: '1px solid #fecaca',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <XCircle size={13} style={{ color: '#ef4444' }} /> Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {viewingDetailsStudent && (
        <StudentProfileModal
          studentEmail={viewingDetailsStudent.studentEmail || viewingDetailsStudent.email || ''}
          internshipId={viewingDetailsStudent.internshipId}
          onClose={() => {
            setViewingDetailsStudent(null);
            setViewingDetailsMatch(null);
          }}
          onMessage={(student) => {
            onMessageStudent(student?.studentEmail || student?.email || '');
          }}
          matchOverride={viewingDetailsMatch}
        />
      )}

      <ViewResumeModal
        isOpen={!!viewingResumeStudent}
        onClose={() => setViewingResumeStudent(null)}
        student={viewingResumeStudent}
      />

      {overCapacityCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="opening-capacity-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 25000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(2, 6, 23, 0.78)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 'min(440px, 100%)',
              padding: '24px',
              color: '#e2e8f0',
              background: '#081330',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '18px',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ width: '40px', height: '40px', display: 'grid', placeItems: 'center', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)', borderRadius: '12px' }}>
                <AlertTriangle size={20} />
              </span>
              <h2 id="opening-capacity-title" style={{ margin: 0, color: '#ffffff', fontSize: '17px', fontWeight: 900 }}>
                Openings are filled
              </h2>
            </div>
            <p style={{ margin: '0 0 20px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
              {overCapacityCandidate.application.internshipTitle || 'This internship'} has {overCapacityCandidate.openings} opening{overCapacityCandidate.openings === 1 ? '' : 's'}, with {overCapacityCandidate.selectedCount} student{overCapacityCandidate.selectedCount === 1 ? '' : 's'} already selected. Select {overCapacityCandidate.application.studentName || overCapacityCandidate.application.studentEmail} anyway?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setOverCapacityCandidate(null)}
                style={{ padding: '9px 14px', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '9px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusUpdate(overCapacityCandidate.application.id, 'SELECTED');
                  setOverCapacityCandidate(null);
                }}
                style={{ padding: '9px 14px', color: '#111827', background: '#fbbf24', border: '1px solid #fcd34d', borderRadius: '9px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}
              >
                Select anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
