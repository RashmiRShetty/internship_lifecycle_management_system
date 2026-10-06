import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  Phone,
  Award,
  Briefcase,
  Sparkles,
  CheckCircle2,
  User,
  Loader2,
  AlertCircle,
  Globe,
  Link as LinkIcon,
  FolderGit2,
  BookOpen,
  Compass,
  Calendar,
  Layers,
} from 'lucide-react';
import api from '../../services/api';
import { getResumeFullUrl } from '../../utils/resumeUrl';

interface ViewResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export const ViewResumeModal: React.FC<ViewResumeModalProps> = ({ isOpen, onClose, student }) => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const studentEmail = student?.studentEmail || student?.email || '';

  useEffect(() => {
    if (isOpen && studentEmail) {
      const fetchFullStudentProfile = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/users/profile/student?email=${encodeURIComponent(studentEmail)}`);
          if (res.data) {
            setProfileData(res.data);
          }
        } catch (err) {
          console.log('Could not fetch full student profile from backend, using provided student object:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchFullStudentProfile();
    } else {
      setProfileData(null);
    }
  }, [isOpen, studentEmail]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  // Merge provided student props with fetched profile data
  const mergedStudent = {
    ...student,
    ...(profileData || {}),
  };

  const rawResumeUrl = mergedStudent.resumeUrl || mergedStudent.resume || student.resumeUrl || '';
  const resumePdfUrl = getResumeFullUrl(rawResumeUrl);
  const isPdf = rawResumeUrl && (rawResumeUrl.endsWith('.pdf') || rawResumeUrl.includes('/uploads/') || rawResumeUrl.startsWith('data:application/pdf') || rawResumeUrl.startsWith('blob:'));

  const firstName = mergedStudent.firstName || '';
  const lastName = mergedStudent.lastName || '';
  const studentName = firstName
    ? `${firstName} ${lastName}`.trim()
    : mergedStudent.studentName || mergedStudent.fullName || studentEmail.split('@')[0] || 'Student';

  const phone = mergedStudent.phone || mergedStudent.phoneNumber || '';
  const gender = mergedStudent.gender || '';
  const dob = mergedStudent.dob || '';
  const linkedin = mergedStudent.linkedin || '';
  const github = mergedStudent.github || '';

  const college = mergedStudent.collegeName || mergedStudent.college || mergedStudent.university || 'Manipal Institute of Technology';
  const department = mergedStudent.department || mergedStudent.course || 'Computer Science & Engineering';
  const studying = mergedStudent.studying || mergedStudent.degree || 'B.Tech';
  const regNo = mergedStudent.registrationNumber || mergedStudent.regNo || mergedStudent.rollNo || '';
  const cgpa = mergedStudent.cgpa || mergedStudent.studentCgpa || '';
  const semester = mergedStudent.semester || mergedStudent.sem || '';
  const highestGraduation = mergedStudent.highestGraduation || '';

  const interestedDomain = mergedStudent.interestedDomain || '';
  const workingField = mergedStudent.workingField || '';
  const experience = mergedStudent.experience || '';
  const bio = mergedStudent.bio || mergedStudent.coverLetter || mergedStudent.about || '';

  // Parse arrays / comma-separated strings
  const parseList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const skillsList = parseList(mergedStudent.skills || mergedStudent.studentSkills);
  const progLangsList = parseList(mergedStudent.programmingLanguages);
  const courseworksList = parseList(mergedStudent.completedCourseworks);
  const certificatesList = parseList(mergedStudent.certificates);

  // Projects string or list
  const projectsData = mergedStudent.projects;
  let projectsList: string[] = [];
  if (Array.isArray(projectsData)) {
    projectsList = projectsData.map((p) => (typeof p === 'object' ? `${p.title || p.name}: ${p.description || ''}` : String(p)));
  } else if (typeof projectsData === 'string' && projectsData.trim()) {
    projectsList = projectsData.split('\n').filter(Boolean);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" onClick={onClose}>
      <div
        className="bg-[#0e0722] border border-purple-500/30 rounded-3xl w-full max-w-4xl text-white shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-purple-500/20 flex items-center justify-between bg-purple-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Candidate Resume &amp; Credentials — {studentName}
                {isPdf ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                    PDF File Attached
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-bold">
                    Full Profile CV
                  </span>
                )}
              </h2>
              <p className="text-xs text-purple-300 font-medium">Uploaded Student Academic Profile &amp; Resume Details</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resumePdfUrl && (
              <a
                href={resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink size={13} /> Open PDF ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/40">
          {loading ? (
            <div className="p-12 text-center text-purple-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-purple-400" /> Fetching student credentials &amp; resume...
            </div>
          ) : (
            <>
              {/* PDF Viewer (if student has uploaded a PDF file) */}
              {resumePdfUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                    <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-400" />
                      Uploaded PDF document for <span className="text-white font-bold">{studentEmail}</span>
                    </div>
                    <a
                      href={resumePdfUrl}
                      download={`${studentName.replace(/\s+/g, '_')}_Resume.pdf`}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1"
                    >
                      <Download size={13} /> Download PDF
                    </a>
                  </div>

                  {isPdf ? (
                    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-900 shadow-inner">
                      <iframe
                        src={resumePdfUrl}
                        className="w-full h-full border-0"
                        title={`${studentName} Resume`}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={28} className="text-purple-400" />
                        <div>
                          <div className="text-sm font-bold text-white">External Resume Link</div>
                          <div className="text-xs text-slate-400 truncate max-w-md">{resumePdfUrl}</div>
                        </div>
                      </div>
                      <a
                        href={resumePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                      >
                        View Document <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-400 shrink-0" />
                  <span>No custom PDF file was attached. Displaying full student academic CV &amp; profile details below.</span>
                </div>
              )}

              {/* Formatted Complete Candidate Resume Document */}
              <div className="bg-[#12082b] border border-purple-500/30 rounded-2xl p-6 space-y-6 shadow-lg">
                {/* Header / Primary Student Identity */}
                <div className="border-b border-purple-500/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center uppercase shadow-md shrink-0">
                      {studentName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        {studentName}
                        {studying && (
                          <span className="px-2.5 py-0.5 bg-purple-950/70 text-purple-300 border border-purple-400/30 text-[10px] font-extrabold rounded-md">
                            {studying}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-purple-300 font-bold mt-0.5 flex items-center gap-1.5">
                        <GraduationCap size={14} /> {department} • {college}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {cgpa && (
                      <span className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 font-extrabold rounded-xl">
                        CGPA: {cgpa} / 10
                      </span>
                    )}
                    {semester && (
                      <span className="px-3 py-1.5 bg-indigo-950/60 border border-indigo-400/30 text-indigo-200 font-extrabold rounded-xl">
                        Sem {semester}
                      </span>
                    )}
                    {regNo && (
                      <span className="px-3 py-1.5 bg-slate-900 border border-white/10 text-slate-300 font-extrabold rounded-xl">
                        Reg: {regNo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact & Social Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Mail size={14} className="text-purple-400 shrink-0" />
                    <span className="text-white font-bold truncate">{studentEmail}</span>
                  </div>

                  {phone && (
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Phone size={14} className="text-purple-400 shrink-0" />
                      <span className="text-white font-bold">{phone}</span>
                    </div>
                  )}

                  {gender && (
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <User size={14} className="text-purple-400 shrink-0" />
                      <span className="text-white font-bold">Gender: {gender}</span>
                    </div>
                  )}

                  {dob && (
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Calendar size={14} className="text-purple-400 shrink-0" />
                      <span className="text-white font-bold">DOB: {dob}</span>
                    </div>
                  )}

                  {linkedin && (
                    <a
                      href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 font-bold hover:underline"
                    >
                      <LinkIcon size={14} className="shrink-0" /> LinkedIn Profile ↗
                    </a>
                  )}

                  {github && (
                    <a
                      href={github.startsWith('http') ? github : `https://${github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-200 font-bold hover:underline"
                    >
                      <Globe size={14} className="shrink-0" /> GitHub Profile ↗
                    </a>
                  )}
                </div>

                {/* Academic & Field Focus Bar */}
                {(interestedDomain || workingField || highestGraduation) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {interestedDomain && (
                      <div className="bg-purple-950/40 border border-purple-500/20 p-3 rounded-xl">
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block mb-0.5">
                          Interested Domain
                        </span>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Compass size={13} className="text-purple-400" /> {interestedDomain}
                        </span>
                      </div>
                    )}
                    {workingField && (
                      <div className="bg-purple-950/40 border border-purple-500/20 p-3 rounded-xl">
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block mb-0.5">
                          Specialization Field
                        </span>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Layers size={13} className="text-purple-400" /> {workingField}
                        </span>
                      </div>
                    )}
                    {highestGraduation && (
                      <div className="bg-purple-950/40 border border-purple-500/20 p-3 rounded-xl">
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block mb-0.5">
                          Qualification / Level
                        </span>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <GraduationCap size={13} className="text-purple-400" /> {highestGraduation}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Executive Summary / Bio / Cover Letter */}
                {bio && (
                  <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User size={14} /> Executive Summary / Cover Note
                    </h4>
                    <div className="p-3.5 bg-slate-900/80 border border-purple-500/20 rounded-xl text-xs text-slate-200 leading-relaxed font-medium">
                      {bio}
                    </div>
                  </div>
                )}

                {/* Technical Skills & Programming Languages */}
                {(skillsList.length > 0 || progLangsList.length > 0) && (
                  <div className="space-y-4">
                    {skillsList.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Award size={14} /> Technical Skills &amp; Competencies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-950/60 border border-purple-400/30 text-purple-200 font-bold rounded-lg text-xs flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={12} className="text-emerald-400" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {progLangsList.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <BookOpen size={14} /> Programming Languages
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {progLangsList.map((lang, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-indigo-950/60 border border-indigo-400/30 text-indigo-200 font-bold rounded-lg text-xs flex items-center gap-1.5"
                            >
                              <Sparkles size={12} className="text-indigo-400" /> {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Projects Section */}
                {projectsList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FolderGit2 size={14} /> Key Academic &amp; Personal Projects
                    </h4>
                    <div className="space-y-2">
                      {projectsList.map((proj, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/80 border border-purple-500/20 rounded-xl text-xs text-slate-200 font-medium">
                          {proj}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Courseworks */}
                {courseworksList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen size={14} /> Relevant Courseworks &amp; Subjects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {courseworksList.map((course, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-900 border border-white/10 text-slate-300 font-semibold rounded-lg text-xs"
                        >
                          📚 {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates */}
                {certificatesList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award size={14} /> Certifications &amp; Training
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {certificatesList.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold rounded-lg text-xs"
                        >
                          🏆 {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {experience && (
                  <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Briefcase size={14} /> Practical Experience
                    </h4>
                    <div className="p-3.5 bg-slate-900/80 border border-purple-500/20 rounded-xl text-xs text-slate-200 font-medium">
                      {experience}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-purple-500/20 bg-purple-950/40 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            InternSmart MIT Portal — Complete Student Resume &amp; Credentials
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
