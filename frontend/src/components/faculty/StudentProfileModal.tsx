import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Send,
  Sparkles,
  Target,
  ShieldCheck,
  Award,
  X,
  BookOpen,
  FolderGit2,
  User,
  Globe,
  Link as LinkIcon,
} from 'lucide-react';
import api from '../../services/api';
import { getAiMatchForPair } from '../../services/aiMatcher';
import { calculateRealMatchDetails } from '../../utils/matchCalculator';
import { ViewResumeModal } from './ViewResumeModal';

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
    <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>{label}</p>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{value || 'N/A'}</p>
  </div>
);

export const StudentProfileModal = ({ studentEmail, internshipId, onClose, onMessage, matchOverride }: { studentEmail: string; internshipId?: number; onClose: () => void; onMessage: (student: any) => void; matchOverride?: any }) => {
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any | null>(matchOverride || null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const facultyEmail = decoded?.sub ? String(decoded.sub).trim() : '';

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const [sRes, iRes, matchesRes] = await Promise.all([
          api.get(`/users/profile/student?email=${encodeURIComponent(studentEmail)}`),
          internshipId ? api.get(`/internships/${internshipId}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
          facultyEmail
            ? api.get(`/recommendations/faculty-applicants?email=${facultyEmail}`).catch(() => ({ data: [] }))
            : api.get(`/recommendations/faculty-applicants`).catch(() => ({ data: [] }))
        ]);
        const sData = sRes.data;
        const iData = iRes?.data;
        const matches = matchesRes.data || [];

        const matchRes = matches.find((m: any) => {
          const emailMatch = m.student?.email?.toLowerCase() === studentEmail?.toLowerCase();
          const idMatch = !internshipId || String(m.internship?.id) === String(internshipId);
          return emailMatch && idMatch;
        }) || matches.find((m: any) => m.student?.email?.toLowerCase() === studentEmail?.toLowerCase());

        setStudent(sData);
        if (matchOverride && typeof matchOverride.matchPercentage === 'number') {
          setMatchData(matchOverride);
          return;
        }

        if (matchRes && typeof matchRes.matchPercentage === 'number' && matchRes.matchPercentage > 0) {
          setMatchData(matchRes);
          return;
        }

        if (iData && sData) {
          setAiLoading(true);
          try {
            const aiMatch = await getAiMatchForPair({
              studentEmail,
              internshipId,
              internship: iData,
              studentProfile: sData,
              existingMatch: matchRes,
            });
            setMatchData(aiMatch);
          } catch (error) {
            setMatchData(calculateRealMatchDetails(iData, sData, matchRes));
          } finally {
            setAiLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentProfile();
  }, [studentEmail, internshipId, facultyEmail, matchOverride]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResumeModal) {
          setShowResumeModal(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose, showResumeModal]);

  if (!student && !loading) return null;

  const parseList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const skillsList = parseList(student?.skills || student?.studentSkills);
  const progLangsList = parseList(student?.programmingLanguages);
  const courseworksList = parseList(student?.completedCourseworks);
  const certificatesList = parseList(student?.certificates);

  const projectsData = student?.projects;
  let projectsList: string[] = [];
  if (Array.isArray(projectsData)) {
    projectsList = projectsData.map((p) => (typeof p === 'object' ? `${p.title || p.name}: ${p.description || ''}` : String(p)));
  } else if (typeof projectsData === 'string' && projectsData.trim()) {
    projectsList = projectsData.split('\n').filter(Boolean);
  }

  const displayName = student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : studentEmail.split('@')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        style={{ borderRadius: '24px', overflow: 'hidden', maxWidth: '850px', width: '94%', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)' }}
        onClick={(e) => e.stopPropagation()}
        className="my-6 max-h-[92vh] flex flex-col bg-white"
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '24px 28px', color: '#fff', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fff', color: '#4f46e5', fontWeight: 900, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', flexShrink: 0 }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px', color: '#fff' }}>{displayName}</h2>
                <span style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>
                  STUDENT PROFILE
                </span>
                {student?.studying && (
                  <span style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>
                    {student.studying}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', marginTop: '6px', opacity: 0.95, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={13} /> {studentEmail}</span>
                {student?.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={13} /> {student.phone}</span>}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GraduationCap size={13} /> {student?.college || student?.collegeName || 'Student'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f1f5f9' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontWeight: 600, fontSize: '13px' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
              <div>Loading student profile...</div>
            </div>
          ) : (
            <>
              {/* Stat Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CGPA</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{student?.cgpa ? `${student.cgpa} / 10` : 'N/A'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEMESTER</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{student?.semester ? `Sem ${student.semester}` : 'N/A'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXPERIENCE</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{student?.experience ? `${student.experience} yrs` : '0 yrs'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DEPARTMENT</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student?.department || 'N/A'}</div>
                </div>
              </div>

              {/* AI Match Card */}
              {aiLoading && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(59,130,246,0.08) 100%)',
                  border: '1px solid rgba(148,163,184,0.25)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: 700,
                }}>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(148,163,184,0.4)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Calculating AI match score...
                </div>
              )}

              {matchData && (() => {
                const pct = typeof matchData.matchPercentage === 'number' ? Math.round(matchData.matchPercentage) : 0;
                const matchedSkills = (
                  matchData.matchedSkills ||
                  matchData.matchedTechnicalRequirements ||
                  matchData.matchedRequirements ||
                  matchData.matchedItems ||
                  []
                ).filter(Boolean);
                const matchedCourseworks = matchData.matchedCourseworks || [];
                const totalReqs = (matchData.requirements && matchData.requirements.length) || Math.max(matchedSkills.length + matchedCourseworks.length, 1);
                const matchedCount = Math.min(matchedSkills.length, totalReqs);
                const reasonText = matchData.reason || matchData.recommendationReason || `${matchedCount} of ${totalReqs} technical requirements matched.`;
                return (
                  <div style={{
                    background: pct >= 60 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid ' + (pct >= 60 ? '#a7f3d0' : '#cbd5e1'),
                    borderRadius: '16px',
                    padding: '16px 18px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color={pct >= 60 ? '#059669' : '#475569'} />
                        <span style={{ fontSize: '14px', fontWeight: 900, color: pct >= 60 ? '#065f46' : '#1e293b' }}>
                          AI Candidate Match Score
                        </span>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 900,
                        padding: '5px 12px',
                        borderRadius: '20px',
                        background: pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : '#64748b',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}>
                        ⚡ {pct}% MATCH
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: pct >= 60 ? '#047857' : '#475569', marginBottom: '10px', fontWeight: 600, lineHeight: 1.5 }}>
                      {reasonText}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {matchedSkills.slice(0, 10).map((s: string) => (
                        <span key={s} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: '#ffffffcc', color: '#065f46', border: '1px solid #a7f3d0' }}>
                          ✓ Skill: {s}
                        </span>
                      ))}
                      {matchedCourseworks.slice(0, 6).map((c: string) => (
                        <span key={c} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: '#ffffffcc', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                          🎓 Coursework: {c}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* View Resume Button Banner */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Student Resume Document &amp; PDF
                      {student?.resumeUrl && (
                        <span style={{ background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 800 }}>
                          PDF Attached
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                      Open full candidate resume viewer, view PDF file or download document.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '10px 22px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                  }}
                >
                  <FileText size={16} /> View Resume ↗
                </button>
              </div>

              {/* 2-Column Academic & Portfolio Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={14} style={{ color: '#5b51ef' }} /> Academic Credentials
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <DetailItem label="College / Institute" value={student?.collegeName || student?.college} />
                    <DetailItem label="Reg / Roll Number" value={student?.registrationNumber} />
                    <DetailItem label="Department / Major" value={student?.department} />
                    <DetailItem label="Highest Qualification" value={student?.highestGraduation} />
                    <DetailItem label="Interested Domain" value={student?.interestedDomain} />
                    <DetailItem label="Specialization Field" value={student?.workingField} />
                    <DetailItem label="Gender & DOB" value={`${student?.gender || 'N/A'}${student?.dob ? ` (${student.dob})` : ''}`} />
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: '#5b51ef' }} /> Social & Portfolio Links
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {student?.linkedin && (
                      <a href={student.linkedin.startsWith('http') ? student.linkedin : `https://${student.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0284c7', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LinkIcon size={14} /> LinkedIn Profile</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {student?.github && (
                      <a href={student.github.startsWith('http') ? student.github : `https://${student.github}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={14} /> GitHub Portfolio</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {!student?.linkedin && !student?.github && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No extra portfolio links attached</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive Summary / Bio / Cover Letter */}
              {(student?.bio || student?.coverLetter) && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} style={{ color: '#5b51ef' }} /> Executive Summary / Cover Note
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.6, fontWeight: 500, background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    {student?.bio || student?.coverLetter}
                  </div>
                </div>
              )}

              {/* Skills & Programming Languages */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} style={{ color: '#5b51ef' }} /> Technical Skills &amp; Languages
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skillsList.map(skill => (
                    <span key={skill} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                      ✓ {skill}
                    </span>
                  ))}
                  {progLangsList.map(lang => (
                    <span key={lang} style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                      💻 {lang}
                    </span>
                  ))}
                  {skillsList.length === 0 && progLangsList.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No skills listed</span>
                  )}
                </div>
              </div>

              {/* Projects */}
              {projectsList.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderGit2 size={14} style={{ color: '#5b51ef' }} /> Academic &amp; Personal Projects
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {projectsList.map((proj, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                        {proj}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courseworks & Certifications */}
              {(courseworksList.length > 0 || certificatesList.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {courseworksList.length > 0 && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={14} style={{ color: '#5b51ef' }} /> Completed Courseworks
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {courseworksList.map((c, i) => (
                          <span key={i} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
                            📚 {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {certificatesList.length > 0 && (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} style={{ color: '#5b51ef' }} /> Certifications
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {certificatesList.map((cert, i) => (
                          <span key={i} style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
                            🏆 {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ borderRadius: '12px', fontWeight: 800 }}>Close</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ borderRadius: '12px', fontWeight: 800, background: '#5b51ef', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => onMessage(student)}>
              <Send size={14} /> Message Student
            </button>
          </div>
        </div>
      </div>

      <ViewResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        student={student}
      />
    </div>
  );
};

export default StudentProfileModal;
