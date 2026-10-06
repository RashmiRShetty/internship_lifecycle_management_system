import React from 'react';
import { Mail, Phone, MapPin, Globe, Link2, GraduationCap, FolderGit2, Sparkles, Code2, ExternalLink, Languages, Trophy, BookOpen, HeartHandshake, Terminal, Layers, Briefcase } from 'lucide-react';

export interface WorkExperienceItem {
  id?: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description: string;
}

export interface LanguageItem {
  id?: string;
  language: string;
  proficiency: string; // Native, Fluent, Professional, Intermediate, Basic
}

export interface AwardItem {
  id?: string;
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

export interface PublicationItem {
  id?: string;
  title: string;
  publisher: string;
  date?: string;
  link?: string;
  description?: string;
}

export interface VolunteerItem {
  id?: string;
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  department?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  cgpa?: string;
  coursework?: string;
}

export interface CustomSectionItem {
  id?: string;
  sectionTitle: string;
  content: string;
}

export interface CodingProfiles {
  leetcode?: string;
  hackerrank?: string;
  kaggle?: string;
  codeforces?: string;
}

export interface CvData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  collegeName: string;
  registrationNumber: string;
  cgpa: string;
  bio: string;
  linkedin: string;
  github: string;
  portfolio?: string;
  
  // Profile Photo
  profilePhoto?: string;
  showPhoto?: boolean;

  // Coding Handles
  codingProfiles?: CodingProfiles;

  // Standard Sections
  skills: string[];
  interests: string[];
  experience: string;
  workExperiences?: WorkExperienceItem[];
  completedCourseworks: string;
  projects: Array<{ id?: string; name: string; description: string; link?: string; techStack?: string }>;
  certificates: Array<{ id?: string; name: string; issuer: string; issueDate?: string; credentialUrl?: string }>;

  // Additional 7 Sections
  educationList?: EducationItem[];
  languages?: LanguageItem[];
  awards?: AwardItem[];
  publications?: PublicationItem[];
  volunteering?: VolunteerItem[];
  customSections?: CustomSectionItem[];
}

export type TemplateId =
  | 'modern'
  | 'classic'
  | 'creative'
  | 'twocolumn'
  | 'minimalist_line'
  | 'emerald_accent'
  | 'purple_gradient'
  | 'academic_border';

export type TemplateCategory = 'All' | 'Tech & Engineering' | 'Corporate & Executive' | 'Creative & Design' | 'Academic & Research';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  badge: string;
  category: TemplateCategory;
}

export interface TemplateProps {
  data: CvData;
  mode?: 'light' | 'dark';
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic Standard ATS',
    description: '100% ATS-compliant clean layout with clear section dividers, ideal for formal applications.',
    badge: 'Recommended for ATS',
    category: 'Corporate & Executive',
  },
  {
    id: 'modern',
    name: 'Modern Tech',
    description: 'Sleek header with tech skill badges and clean card component borders.',
    badge: 'Popular for Tech',
    category: 'Tech & Engineering',
  },
  {
    id: 'creative',
    name: 'Creative Accent',
    description: 'Left vertical accent line with high contrast typography and clean grid sections.',
    badge: 'Sleek & Modern',
    category: 'Creative & Design',
  },
  {
    id: 'twocolumn',
    name: 'Two-Column Compact',
    description: 'Structured sidebar layout maximizing space efficiency for students with many projects.',
    badge: 'Compact Layout',
    category: 'Tech & Engineering',
  },
  {
    id: 'minimalist_line',
    name: 'Minimalist Swiss',
    description: 'Ultra-clean Swiss grid layout with fine divider lines and crisp typography.',
    badge: 'Ultra Clean',
    category: 'Corporate & Executive',
  },
  {
    id: 'emerald_accent',
    name: 'Emerald Tech & Data',
    description: 'Deep emerald styled layout with skill pills and clear section divisions.',
    badge: 'Data & Dev',
    category: 'Tech & Engineering',
  },
  {
    id: 'purple_gradient',
    name: 'Vibrant Studio',
    description: 'Rich violet-indigo header banner with rounded glass cards for creative tech roles.',
    badge: 'Vibrant Studio',
    category: 'Creative & Design',
  },
  {
    id: 'academic_border',
    name: 'Academic & Research',
    description: 'Formal double-border framed layout with structured traditional serif sections.',
    badge: 'Research & Academic',
    category: 'Academic & Research',
  },
];

/* ==========================================================================
   MINIATURE CANVA-STYLE TEMPLATE PREVIEW THUMBNAILS
   ========================================================================== */
export const TemplateThumbnailPreview: React.FC<{ templateId: TemplateId }> = ({ templateId }) => {
  switch (templateId) {
    case 'modern':
      return (
        <div className="h-32 w-full bg-[#0b132b] rounded-lg p-2.5 border border-sky-500/30 flex flex-col justify-between overflow-hidden shadow-inner relative transition">
          <div className="flex justify-between items-center border-b border-sky-500/30 pb-1.5">
            <div>
              <div className="h-2 w-20 bg-white rounded-full" />
              <div className="h-1.5 w-14 bg-sky-400 rounded-full mt-1" />
            </div>
            <div className="space-y-0.5">
              <div className="h-1 w-8 bg-slate-400 rounded-full" />
              <div className="h-1 w-10 bg-slate-400 rounded-full" />
            </div>
          </div>
          <div className="space-y-1.5 my-1">
            <div className="h-1.5 w-12 bg-sky-400/80 rounded-full" />
            <div className="h-2.5 w-full bg-slate-900 rounded border border-slate-800" />
            <div className="h-2.5 w-full bg-slate-900 rounded border border-slate-800" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-6 bg-slate-800 rounded border border-slate-700" />
            <div className="h-2 w-6 bg-slate-800 rounded border border-slate-700" />
            <div className="h-2 w-6 bg-slate-800 rounded border border-slate-700" />
          </div>
        </div>
      );
    case 'classic':
      return (
        <div className="h-32 w-full bg-white rounded-lg p-2.5 border border-slate-300 flex flex-col justify-between overflow-hidden shadow-sm relative transition">
          <div className="text-center pb-1.5 border-b border-slate-300">
            <div className="h-2 w-24 bg-slate-900 rounded-full mx-auto" />
            <div className="h-1 w-16 bg-slate-600 rounded-full mx-auto mt-1" />
          </div>
          <div className="space-y-1.5 my-1">
            <div className="h-1.5 w-14 bg-slate-800 rounded-full" />
            <div className="h-1 w-full bg-slate-200 rounded-full" />
            <div className="h-1 w-4/5 bg-slate-200 rounded-full" />
          </div>
          <div className="border-t border-slate-300 pt-1 flex justify-between">
            <div className="h-1 w-12 bg-slate-500 rounded-full" />
            <div className="h-1 w-10 bg-slate-500 rounded-full" />
          </div>
        </div>
      );
    case 'creative':
      return (
        <div className="h-32 w-full bg-slate-900 rounded-lg p-2.5 border border-emerald-500/30 border-l-4 border-l-emerald-500 flex flex-col justify-between overflow-hidden shadow-inner relative transition">
          <div>
            <div className="h-1.5 w-10 bg-emerald-500/30 rounded" />
            <div className="h-2.5 w-20 bg-white rounded-full mt-1" />
            <div className="h-1.5 w-14 bg-emerald-400 rounded-full mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 my-1">
            <div className="h-5 bg-slate-900 rounded p-1 border border-slate-800" />
            <div className="h-5 bg-slate-900 rounded p-1 border border-slate-800" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-7 bg-emerald-500/20 rounded border border-emerald-500/40" />
            <div className="h-2 w-7 bg-emerald-500/20 rounded border border-emerald-500/40" />
          </div>
        </div>
      );
    case 'twocolumn':
      return (
        <div className="h-32 w-full bg-white rounded-lg border border-slate-300 flex overflow-hidden shadow-sm relative transition">
          <div className="w-1/3 bg-slate-100 p-1.5 border-r border-slate-200 flex flex-col justify-between">
            <div>
              <div className="h-2 w-10 bg-slate-900 rounded-full" />
              <div className="h-1.5 w-8 bg-sky-600 rounded-full mt-1" />
              <div className="h-1 w-10 bg-slate-500 rounded-full mt-2" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-8 bg-sky-600/60 rounded" />
              <div className="h-1 w-6 bg-slate-300 rounded" />
            </div>
          </div>
          <div className="w-2/3 p-2 flex flex-col justify-between space-y-1">
            <div className="h-1.5 w-14 bg-sky-600 rounded-full" />
            <div className="h-1.5 w-full bg-slate-100 rounded" />
            <div className="h-1.5 w-full bg-slate-100 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
          </div>
        </div>
      );
    case 'minimalist_line':
      return (
        <div className="h-32 w-full bg-white rounded-lg p-2.5 border border-slate-300 flex flex-col justify-between overflow-hidden shadow-sm relative transition">
          <div className="flex justify-between items-end border-b border-slate-300 pb-1">
            <div>
              <div className="h-2 w-20 bg-slate-900 rounded-full" />
              <div className="h-1 w-12 bg-slate-600 rounded-full mt-1" />
            </div>
            <div className="h-1 w-8 bg-slate-400 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 my-1">
            <div className="h-6 bg-slate-50 rounded p-1 border border-slate-200" />
            <div className="h-6 bg-slate-50 rounded p-1 border border-slate-200" />
          </div>
          <div className="border-t border-slate-200 pt-1 flex gap-1">
            <div className="h-1.5 w-8 bg-slate-200 rounded" />
            <div className="h-1.5 w-8 bg-slate-200 rounded" />
          </div>
        </div>
      );
    case 'emerald_accent':
      return (
        <div className="h-32 w-full bg-white rounded-lg p-2 border border-emerald-300 flex flex-col justify-between overflow-hidden shadow-sm relative transition">
          <div className="bg-emerald-50 p-1.5 rounded border border-emerald-200 flex justify-between items-center">
            <div>
              <div className="h-2 w-16 bg-slate-900 rounded-full" />
              <div className="h-1 w-10 bg-emerald-600 rounded-full mt-0.5" />
            </div>
            <div className="h-1 w-6 bg-emerald-600 rounded-full" />
          </div>
          <div className="space-y-1 my-1">
            <div className="h-1.5 w-10 bg-emerald-600/80 rounded" />
            <div className="h-4 bg-emerald-50/80 rounded border border-emerald-200" />
          </div>
          <div className="flex gap-1">
            <div className="h-1.5 w-6 bg-emerald-100 rounded-lg border border-emerald-300" />
            <div className="h-1.5 w-6 bg-emerald-100 rounded-lg border border-emerald-300" />
          </div>
        </div>
      );
    case 'purple_gradient':
      return (
        <div className="h-32 w-full bg-white rounded-lg p-2 border border-purple-300 flex flex-col justify-between overflow-hidden shadow-sm relative transition">
          <div className="bg-purple-100 p-1.5 rounded-lg border border-purple-200">
            <div className="h-2 w-16 bg-purple-900 rounded-full" />
            <div className="h-1 w-12 bg-purple-600 rounded-full mt-0.5" />
          </div>
          <div className="space-y-1 my-1">
            <div className="h-1.5 w-12 bg-purple-600 rounded" />
            <div className="h-4 bg-purple-50 rounded-lg border border-purple-200" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-6 bg-purple-100 rounded-full border border-purple-300" />
            <div className="h-2 w-6 bg-purple-100 rounded-full border border-purple-300" />
          </div>
        </div>
      );
    case 'academic_border':
      return (
        <div className="h-32 w-full bg-white rounded-lg p-2 border-2 border-double border-slate-400 flex flex-col justify-between overflow-hidden shadow-sm relative transition">
          <div className="text-center border-b border-slate-300 pb-1">
            <div className="h-2 w-20 bg-slate-900 rounded-full mx-auto" />
            <div className="h-1 w-14 bg-slate-600 rounded-full mx-auto mt-0.5" />
          </div>
          <div className="space-y-1 my-1 text-center">
            <div className="h-1 w-12 bg-slate-500 rounded-full mx-auto" />
            <div className="h-1.5 w-full bg-slate-100 rounded" />
            <div className="h-1.5 w-4/5 bg-slate-100 rounded mx-auto" />
          </div>
          <div className="border-t border-slate-300 pt-1 text-center">
            <div className="h-1 w-16 bg-slate-500 rounded-full mx-auto" />
          </div>
        </div>
      );
    default:
      return null;
  }
};

/* ==========================================================================
   REUSABLE HELPER RENDERERS FOR NEW SECTIONS
   ========================================================================== */
const AdditionalSectionsRenderer: React.FC<{
  data: CvData;
  headingClass: string;
  cardClass: string;
  titleClass: string;
  subTitleClass: string;
  textClass: string;
  isLight: boolean;
}> = ({ data, headingClass, cardClass, titleClass, subTitleClass, textClass }) => {
  return (
    <div className="space-y-6">
      {/* Work Experiences */}
      {((data.workExperiences && data.workExperiences.length > 0) || (data.experience && data.experience.trim())) && (
        <div>
          <h2 className={headingClass}>
            <Briefcase className="w-4 h-4 inline mr-1.5" /> Experience & Roles
          </h2>
          {data.workExperiences && data.workExperiences.length > 0 ? (
            <div className="space-y-3">
              {data.workExperiences.map((exp, idx) => (
                <div key={exp.id || idx} className={cardClass}>
                  <div className="flex justify-between items-start flex-wrap gap-1">
                    <div>
                      <h3 className={titleClass}>{exp.role}</h3>
                      <p className={subTitleClass}>{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                    </div>
                    {(exp.startDate || exp.endDate) && (
                      <span className="text-[11px] font-semibold opacity-75">
                        {exp.startDate || ''} {exp.startDate && exp.endDate ? '–' : ''} {exp.endDate || 'Present'}
                      </span>
                    )}
                  </div>
                  <p className={`${textClass} mt-2 whitespace-pre-line leading-relaxed`}>{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${cardClass} whitespace-pre-line ${textClass} leading-relaxed`}>
              {data.experience}
            </div>
          )}
        </div>
      )}

      {/* Multiple Education Entries */}
      {data.educationList && data.educationList.length > 0 && (
        <div>
          <h2 className={headingClass}>
            <GraduationCap className="w-4 h-4 inline mr-1.5" /> Education History
          </h2>
          <div className="space-y-3">
            {data.educationList.map((edu, i) => (
              <div key={edu.id || i} className={cardClass}>
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <h3 className={titleClass}>{edu.institution}</h3>
                    <p className={subTitleClass}>
                      {edu.degree} {edu.department ? `• ${edu.department}` : ''} {edu.location ? `(${edu.location})` : ''}
                    </p>
                  </div>
                  {(edu.startDate || edu.endDate || edu.cgpa) && (
                    <div className="text-right">
                      {edu.cgpa && <p className="font-bold text-xs">CGPA: {edu.cgpa}</p>}
                      <p className="text-[11px] opacity-75">{edu.startDate || ''} - {edu.endDate || 'Present'}</p>
                    </div>
                  )}
                </div>
                {edu.coursework && (
                  <p className={`${textClass} mt-1.5 text-xs`}>
                    <span className="font-semibold">Coursework:</span> {edu.coursework}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages Spoken */}
      {data.languages && data.languages.length > 0 && (
        <div>
          <h2 className={headingClass}>
            <Languages className="w-4 h-4 inline mr-1.5" /> Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang, i) => (
              <div key={lang.id || i} className={`${cardClass} py-1.5 px-3 flex items-center gap-2 text-xs`}>
                <span className={`font-bold ${titleClass}`}>{lang.language}</span>
                <span className={`text-[11px] ${subTitleClass}`}>({lang.proficiency})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Honors, Awards & Achievements */}
      {data.awards && data.awards.length > 0 && (
        <div>
          <h2 className={headingClass}>
            <Trophy className="w-4 h-4 inline mr-1.5" /> Honors & Awards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.awards.map((award, i) => (
              <div key={award.id || i} className={cardClass}>
                <div className="flex justify-between items-start">
                  <h3 className={titleClass}>{award.title}</h3>
                  {award.date && <span className="text-[11px] opacity-75">{award.date}</span>}
                </div>
                <p className={subTitleClass}>{award.issuer}</p>
                {award.description && <p className={`${textClass} text-xs mt-1`}>{award.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications & Research Papers */}
      {data.publications && data.publications.length > 0 && (
        <div>
          <h2 className={headingClass}>
            <BookOpen className="w-4 h-4 inline mr-1.5" /> Publications & Research
          </h2>
          <div className="space-y-3">
            {data.publications.map((pub, i) => (
              <div key={pub.id || i} className={cardClass}>
                <div className="flex justify-between items-start">
                  <h3 className={titleClass}>{pub.title}</h3>
                  {pub.link && (
                    <a href={pub.link.startsWith('http') ? pub.link : `https://${pub.link}`} target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:underline">
                      DOI/Link ↗
                    </a>
                  )}
                </div>
                <p className={subTitleClass}>{pub.publisher} {pub.date ? `• ${pub.date}` : ''}</p>
                {pub.description && <p className={`${textClass} text-xs mt-1 leading-relaxed`}>{pub.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volunteer & Leadership Roles */}
      {data.volunteering && data.volunteering.length > 0 && (
        <div>
          <h2 className={headingClass}>
            <HeartHandshake className="w-4 h-4 inline mr-1.5" /> Leadership & Volunteer Roles
          </h2>
          <div className="space-y-3">
            {data.volunteering.map((vol, i) => (
              <div key={vol.id || i} className={cardClass}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={titleClass}>{vol.role}</h3>
                    <p className={subTitleClass}>{vol.organization}</p>
                  </div>
                  {(vol.startDate || vol.endDate) && (
                    <span className="text-[11px] opacity-75">{vol.startDate || ''} – {vol.endDate || 'Present'}</span>
                  )}
                </div>
                {vol.description && <p className={`${textClass} text-xs mt-1 leading-relaxed`}>{vol.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Freeform Sections */}
      {data.customSections && data.customSections.length > 0 && (
        <div className="space-y-5">
          {data.customSections.map((sec, i) => (
            <div key={sec.id || i}>
              <h2 className={headingClass}>
                <Layers className="w-4 h-4 inline mr-1.5" /> {sec.sectionTitle || 'Additional Section'}
              </h2>
              <div className={`${cardClass} whitespace-pre-line ${textClass} leading-relaxed text-xs`}>
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 1: MODERN TECH
   ========================================================================== */
export const ModernTechTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900' : 'bg-[#0b132b] text-slate-100';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800';
  const headingText = isLight ? 'text-sky-700' : 'text-sky-400';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-600' : 'text-slate-300';
  const pillBg = isLight ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-slate-800 text-sky-300 border-slate-700';

  return (
    <div className={`${containerBg} p-8 rounded-xl border ${isLight ? 'border-slate-300' : 'border-slate-700/60'} shadow-xl font-sans text-sm print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      {/* Header */}
      <div className={`border-b ${isLight ? 'border-sky-600/20' : 'border-sky-500/30'} pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-slate-300`}>
        <div className="flex items-center gap-4">
          {data.showPhoto && data.profilePhoto && (
            <img
              src={data.profilePhoto}
              alt={data.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-sky-400 shadow-md shrink-0 print:border-slate-400"
            />
          )}
          <div>
            <h1 className={`text-3xl font-extrabold ${titleText} tracking-tight print:text-black`}>
              {data.fullName || 'Student Name'}
            </h1>
            <p className={`${headingText} font-semibold text-base mt-1 print:text-slate-800`}>
              {data.title || data.department || 'Computer Science Student'}
            </p>
          </div>
        </div>

        <div className={`flex flex-col gap-1 text-xs ${subText} print:text-slate-700`}>
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-sky-500" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>{data.location}</span>
            </div>
          )}
          {(data.linkedin || data.github || data.portfolio) && (
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sky-600 print:text-slate-800 font-medium">
              {data.linkedin && (
                <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <Globe className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {data.github && (
                <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <Link2 className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {data.portfolio && (
                <a href={data.portfolio.startsWith('http') ? data.portfolio : `https://${data.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Portfolio
                </a>
              )}
            </div>
          )}

          {/* Coding Handles Bar */}
          {data.codingProfiles && (data.codingProfiles.leetcode || data.codingProfiles.hackerrank || data.codingProfiles.kaggle || data.codingProfiles.codeforces) && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-sky-600 font-semibold mt-1">
              <Terminal className="w-3 h-3 text-sky-500" />
              {data.codingProfiles.leetcode && <span>LeetCode: {data.codingProfiles.leetcode}</span>}
              {data.codingProfiles.hackerrank && <span>HackerRank: {data.codingProfiles.hackerrank}</span>}
              {data.codingProfiles.kaggle && <span>Kaggle: {data.codingProfiles.kaggle}</span>}
              {data.codingProfiles.codeforces && <span>Codeforces: {data.codingProfiles.codeforces}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Summary / Bio */}
      {data.bio && (
        <div className="mb-6">
          <h2 className={`text-xs font-bold uppercase tracking-wider ${headingText} mb-2 print:text-slate-900`}>
            Professional Summary
          </h2>
          <p className={`${subText} leading-relaxed print:text-slate-800`}>{data.bio}</p>
        </div>
      )}

      {/* Primary Education */}
      <div className="mb-6">
        <h2 className={`text-xs font-bold uppercase tracking-wider ${headingText} mb-3 flex items-center gap-2 print:text-slate-900`}>
          <GraduationCap className="w-4 h-4" /> Primary Education
        </h2>
        <div className={`${cardBg} p-4 rounded-lg border print:bg-slate-50 print:border-slate-200`}>
          <div className="flex justify-between items-start font-semibold print:text-black">
            <div>
              <p className={`text-base ${titleText}`}>{data.collegeName || 'Institute of Technology'}</p>
              <p className={`text-xs ${headingText} font-medium mt-0.5`}>
                {data.department ? `Department of ${data.department}` : 'Degree Program'}
              </p>
            </div>
            {data.cgpa && (
              <span className={`${isLight ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'} text-xs px-2.5 py-1 rounded-full border print:bg-slate-200 print:text-black font-bold`}>
                CGPA: {data.cgpa}
              </span>
            )}
          </div>
          {data.registrationNumber && (
            <p className={`text-xs ${subText} mt-2 print:text-slate-600`}>Reg No: {data.registrationNumber}</p>
          )}
          {data.completedCourseworks && (
            <p className={`text-xs ${subText} mt-2 print:text-slate-700`}>
              <span className="font-semibold">Relevant Coursework:</span> {data.completedCourseworks}
            </p>
          )}
        </div>
      </div>

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-xs font-bold uppercase tracking-wider ${headingText} mb-3 flex items-center gap-2 print:text-slate-900`}>
            <FolderGit2 className="w-4 h-4" /> Technical Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj, i) => (
              <div key={i} className={`${cardBg} p-4 rounded-lg border print:bg-slate-50 print:border-slate-200`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold ${titleText} print:text-black`}>{proj.name}</h3>
                  {proj.link && (
                    <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:underline font-semibold print:text-slate-800">
                      Link ↗
                    </a>
                  )}
                </div>
                <p className={`text-xs ${subText} leading-relaxed print:text-slate-700`}>{proj.description}</p>
                {proj.techStack && (
                  <p className="text-[11px] text-sky-600 font-semibold mt-1">Tech Stack: {proj.techStack}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-wider ${headingText} mb-3 flex items-center gap-2 print:text-slate-900`}>
              <Code2 className="w-4 h-4" /> Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className={`${pillBg} text-xs px-3 py-1 rounded-md border font-medium print:bg-slate-100 print:text-black print:border-slate-300`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.interests && data.interests.length > 0 && (
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-wider ${headingText} mb-3 flex items-center gap-2 print:text-slate-900`}>
              <Sparkles className="w-4 h-4" /> Areas of Interest
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest, i) => (
                <span key={i} className={`${isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-800 text-emerald-300 border-slate-700'} text-xs px-3 py-1 rounded-md border font-medium print:bg-slate-100 print:text-black print:border-slate-300`}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional 7 Sections */}
      <AdditionalSectionsRenderer
        data={data}
        headingClass={`text-xs font-bold uppercase tracking-wider ${headingText} mb-3 flex items-center gap-2 print:text-slate-900`}
        cardClass={`${cardBg} p-4 rounded-lg border print:bg-slate-50 print:border-slate-200`}
        titleClass={`font-bold ${titleText} text-sm print:text-black`}
        subTitleClass={`text-xs ${headingText} font-medium mt-0.5`}
        textClass={`text-xs ${subText} print:text-slate-800`}
        isLight={isLight}
      />
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 2: CLASSIC EXECUTIVE (ATS STANDARD)
   ========================================================================== */
export const ClassicExecutiveTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100';
  const borderStyle = isLight ? 'border-slate-300' : 'border-slate-700';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700';

  return (
    <div className={`${containerBg} p-8 rounded-xl border ${borderStyle} shadow-xl font-serif text-sm print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      {/* Header Centered */}
      <div className={`text-center border-b-2 ${isLight ? 'border-slate-300' : 'border-slate-700'} pb-6 mb-6 print:border-slate-400`}>
        {data.showPhoto && data.profilePhoto && (
          <img
            src={data.profilePhoto}
            alt={data.fullName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-slate-400"
          />
        )}
        <h1 className={`text-3xl font-bold ${titleText} tracking-wide uppercase print:text-black`}>
          {data.fullName || 'Student Name'}
        </h1>
        <p className={`${subText} font-sans italic text-sm mt-1 print:text-slate-700`}>
          {data.title || data.department || 'Computer Science Scholar'}
        </p>
        <div className={`flex flex-wrap justify-center items-center gap-3 text-xs font-sans ${subText} mt-3 print:text-slate-800`}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.location && <span>• {data.location}</span>}
          {data.linkedin && <span>• {data.linkedin}</span>}
          {data.github && <span>• {data.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.bio && (
        <div className="mb-6">
          <h2 className={`font-sans text-xs font-bold uppercase tracking-widest ${titleText} border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-1 mb-2 print:text-slate-900`}>
            Executive Summary
          </h2>
          <p className={`${subText} leading-relaxed font-sans text-xs print:text-slate-800`}>{data.bio}</p>
        </div>
      )}

      {/* Primary Education */}
      <div className="mb-6">
        <h2 className={`font-sans text-xs font-bold uppercase tracking-widest ${titleText} border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-1 mb-3 print:text-slate-900`}>
          Education
        </h2>
        <div className="font-sans">
          <div className="flex justify-between items-baseline">
            <h3 className={`font-bold ${titleText} print:text-black`}>{data.collegeName || 'MIT Institute of Technology'}</h3>
            {data.cgpa && <span className={`text-xs ${subText} font-semibold print:text-black`}>CGPA: {data.cgpa}</span>}
          </div>
          <p className={`text-xs ${subText} italic`}>{data.department ? `Department of ${data.department}` : ''}</p>
          {data.completedCourseworks && (
            <p className={`text-xs ${subText} mt-1`}>Coursework: {data.completedCourseworks}</p>
          )}
        </div>
      </div>

      {/* Additional 7 Sections */}
      <AdditionalSectionsRenderer
        data={data}
        headingClass={`font-sans text-xs font-bold uppercase tracking-widest ${titleText} border-b ${isLight ? 'border-slate-300' : 'border-slate-800'} pb-1 mb-3 print:text-slate-900`}
        cardClass={`${cardBg} p-3 rounded border mb-3 font-sans`}
        titleClass={`font-bold ${titleText} text-xs print:text-black`}
        subTitleClass={`text-xs ${subText} italic`}
        textClass={`font-sans text-xs ${subText} mt-1`}
        isLight={isLight}
      />
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 3: CREATIVE MINIMALIST
   ========================================================================== */
export const CreativeMinimalistTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900 border-slate-300 border-l-8 border-l-emerald-600' : 'bg-[#0f172a] text-slate-200 border-indigo-500/30 border-l-8 border-l-emerald-500';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';
  const accentText = isLight ? 'text-emerald-700' : 'text-emerald-400';

  return (
    <div className={`${containerBg} p-8 rounded-xl border shadow-xl font-sans text-sm print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      <div className="mb-6 flex justify-between items-start gap-4">
        <div>
          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${accentText} ${isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'} px-2.5 py-1 rounded print:text-emerald-800`}>
            CURRICULUM VITAE
          </span>
          <h1 className={`text-4xl font-black ${titleText} mt-2 tracking-tight print:text-black`}>
            {data.fullName || 'Student Name'}
          </h1>
          <p className={`${accentText} font-medium text-base mt-1 print:text-emerald-800`}>
            {data.title || data.department || 'Student Professional'}
          </p>

          <div className={`flex flex-wrap gap-4 text-xs ${subText} mt-4 print:text-slate-700`}>
            {data.email && <span>📧 {data.email}</span>}
            {data.phone && <span>📱 {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
            {data.github && <span>💻 {data.github}</span>}
            {data.linkedin && <span>🔗 {data.linkedin}</span>}
          </div>
        </div>

        {data.showPhoto && data.profilePhoto && (
          <img
            src={data.profilePhoto}
            alt={data.fullName}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
          />
        )}
      </div>

      <hr className={`${isLight ? 'border-slate-200' : 'border-slate-800'} mb-6 print:border-slate-300`} />

      {data.bio && (
        <div className="mb-6">
          <h2 className={`text-xs font-black uppercase tracking-wider ${accentText} mb-2 print:text-emerald-900`}>
            About Me
          </h2>
          <p className={`${subText} leading-relaxed text-xs print:text-slate-800`}>{data.bio}</p>
        </div>
      )}

      {/* Additional 7 Sections */}
      <AdditionalSectionsRenderer
        data={data}
        headingClass={`text-xs font-black uppercase tracking-wider ${accentText} mb-3 print:text-emerald-900`}
        cardClass={`${cardBg} p-4 rounded-lg border print:bg-slate-50 print:border-slate-200`}
        titleClass={`font-bold ${titleText} text-sm print:text-black`}
        subTitleClass={`text-xs ${accentText} font-medium mt-0.5`}
        textClass={`text-xs ${subText} print:text-slate-800`}
        isLight={isLight}
      />
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 4: TWO-COLUMN COMPACT
   ========================================================================== */
export const TwoColumnCompactTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-[#0b132b] text-slate-100 border-slate-700';
  const sidebarBg = isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';
  const headingText = isLight ? 'text-sky-800' : 'text-sky-400';

  return (
    <div className={`${containerBg} rounded-xl border shadow-xl font-sans text-xs print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-full">
        {/* Left Column Sidebar */}
        <div className={`${sidebarBg} p-6 border-r rounded-l-xl print:bg-slate-100 print:border-slate-300 print:text-black`}>
          {data.showPhoto && data.profilePhoto && (
            <img
              src={data.profilePhoto}
              alt={data.fullName}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-sky-400"
            />
          )}

          <div className="mb-6">
            <h1 className={`text-xl font-extrabold ${titleText} print:text-black leading-tight`}>
              {data.fullName || 'Student Name'}
            </h1>
            <p className={`${headingText} font-semibold text-xs mt-1`}>
              {data.title || data.department}
            </p>
          </div>

          {/* Contact */}
          <div className={`mb-6 space-y-2 text-[11px] ${subText} print:text-slate-800`}>
            <h2 className={`text-[10px] font-bold uppercase tracking-wider ${headingText} print:text-slate-900`}>Contact</h2>
            {data.email && <p className="break-all">✉ {data.email}</p>}
            {data.phone && <p>📞 {data.phone}</p>}
            {data.location && <p>📍 {data.location}</p>}
            {data.linkedin && <p className="break-all">🔗 {data.linkedin}</p>}
            {data.github && <p className="break-all">💻 {data.github}</p>}
          </div>

          {/* Languages Sidebar */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-6">
              <h2 className={`text-[10px] font-bold uppercase tracking-wider ${headingText} mb-2`}>Languages</h2>
              {data.languages.map((l, i) => (
                <p key={i} className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {l.language} ({l.proficiency})
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Column */}
        <div className="md:col-span-2 p-6 space-y-6">
          {data.bio && (
            <div>
              <h2 className={`text-xs font-bold uppercase tracking-wider ${headingText} mb-1.5 print:text-slate-900`}>Profile Summary</h2>
              <p className={`${subText} leading-relaxed print:text-slate-800`}>{data.bio}</p>
            </div>
          )}

          <AdditionalSectionsRenderer
            data={data}
            headingClass={`text-xs font-bold uppercase tracking-wider ${headingText} mb-2 print:text-slate-900`}
            cardClass={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'} p-3 rounded border print:bg-slate-50 print:border-slate-200`}
            titleClass={`font-bold ${titleText} text-xs print:text-black`}
            subTitleClass={`text-[11px] ${headingText} font-medium mt-0.5`}
            textClass={`text-[11px] ${subText} print:text-slate-700`}
            isLight={isLight}
          />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 5: MINIMALIST SWISS
   ========================================================================== */
export const MinimalistSwissTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-[#0b132b] text-slate-100 border-slate-700/60';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800';

  return (
    <div className={`${containerBg} p-8 rounded-xl border shadow-xl font-sans text-xs print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      <div className={`border-b ${isLight ? 'border-slate-300' : 'border-slate-700'} pb-5 mb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 print:border-slate-300`}>
        <div className="flex items-center gap-4">
          {data.showPhoto && data.profilePhoto && (
            <img
              src={data.profilePhoto}
              alt={data.fullName}
              className="w-16 h-16 rounded-full object-cover border border-slate-300"
            />
          )}
          <div>
            <h1 className={`text-3xl font-light ${titleText} tracking-tight uppercase print:text-black`}>
              {data.fullName || 'Student Name'}
            </h1>
            <p className={`${subText} text-xs mt-1 font-mono tracking-widest uppercase print:text-slate-700`}>
              {data.title || data.department}
            </p>
          </div>
        </div>
        <div className={`text-right text-[11px] ${subText} space-y-0.5 print:text-slate-700`}>
          {data.email && <p>{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
        </div>
      </div>

      <AdditionalSectionsRenderer
        data={data}
        headingClass={`text-[10px] font-bold uppercase tracking-widest ${subText} mb-2 print:text-slate-800`}
        cardClass={`${cardBg} p-3.5 rounded border mb-3 print:bg-slate-50 print:border-slate-200`}
        titleClass={`font-bold ${titleText} text-xs print:text-black`}
        subTitleClass={`text-[11px] ${subText} font-medium mt-0.5`}
        textClass={`text-[11px] ${subText} print:text-slate-800`}
        isLight={isLight}
      />
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 6: EMERALD TECH & DATA
   ========================================================================== */
export const EmeraldAccentTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900 border-emerald-300' : 'bg-[#022c22] text-slate-100 border-emerald-500/30';
  const bannerBg = isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-gradient-to-r from-emerald-900 to-teal-950 border-emerald-500/30';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-emerald-950/60 border-emerald-800/60';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';
  const accentText = isLight ? 'text-emerald-800' : 'text-emerald-400';

  return (
    <div className={`${containerBg} p-8 rounded-xl border shadow-xl font-sans text-xs print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      <div className={`${bannerBg} p-6 rounded-xl border mb-6 print:bg-slate-100 print:border-slate-300`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {data.showPhoto && data.profilePhoto && (
              <img
                src={data.profilePhoto}
                alt={data.fullName}
                className="w-18 h-18 rounded-full object-cover border-2 border-emerald-400"
              />
            )}
            <div>
              <h1 className={`text-3xl font-black ${titleText} tracking-tight print:text-black`}>
                {data.fullName || 'Student Name'}
              </h1>
              <p className={`${accentText} font-semibold text-sm mt-1 print:text-emerald-800`}>
                {data.title || data.department}
              </p>
            </div>
          </div>
          <div className={`text-right text-[11px] ${subText} space-y-0.5 print:text-slate-800`}>
            {data.email && <p>✉ {data.email}</p>}
            {data.phone && <p>📞 {data.phone}</p>}
            {data.location && <p>📍 {data.location}</p>}
          </div>
        </div>
      </div>

      <AdditionalSectionsRenderer
        data={data}
        headingClass={`text-xs font-black uppercase tracking-wider ${accentText} mb-2 print:text-emerald-900`}
        cardClass={`${cardBg} p-4 rounded-xl border mb-3 print:bg-slate-50 print:border-slate-200`}
        titleClass={`font-bold ${titleText} text-xs print:text-black`}
        subTitleClass={`text-xs ${accentText} font-medium mt-0.5`}
        textClass={`text-xs ${subText} print:text-slate-800`}
        isLight={isLight}
      />
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 7: VIBRANT STUDIO
   ========================================================================== */
export const PurpleGradientTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900 border-purple-300' : 'bg-[#0f0c1b] text-slate-100 border-purple-500/30';
  const bannerBg = isLight ? 'bg-purple-50 border-purple-200' : 'bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border-purple-500/30';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-purple-950/40 border-purple-800/40';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';
  const accentText = isLight ? 'text-purple-800' : 'text-purple-300';

  return (
    <div className={`${containerBg} p-8 rounded-xl border shadow-xl font-sans text-xs print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      <div className={`${bannerBg} p-6 rounded-2xl border mb-6 print:bg-slate-100 print:border-slate-300`}>
        <div className="flex items-center gap-4">
          {data.showPhoto && data.profilePhoto && (
            <img
              src={data.profilePhoto}
              alt={data.fullName}
              className="w-18 h-18 rounded-full object-cover border-2 border-purple-400"
            />
          )}
          <div>
            <h1 className={`text-3xl font-black ${titleText} tracking-tight print:text-black`}>
              {data.fullName || 'Student Name'}
            </h1>
            <p className={`${accentText} font-semibold text-sm mt-1 print:text-purple-900`}>
              {data.title || data.department}
            </p>
          </div>
        </div>
      </div>

      <AdditionalSectionsRenderer
        data={data}
        headingClass={`text-xs font-bold uppercase tracking-wider ${accentText} mb-2 print:text-purple-900`}
        cardClass={`${cardBg} p-4 rounded-xl border mb-3 print:bg-slate-50 print:border-slate-200`}
        titleClass={`font-bold ${titleText} text-xs print:text-black`}
        subTitleClass={`text-xs ${accentText} font-medium mt-0.5`}
        textClass={`text-xs ${subText} print:text-slate-800`}
        isLight={isLight}
      />
    </div>
  );
};

/* ==========================================================================
   TEMPLATE 8: ACADEMIC & RESEARCH
   ========================================================================== */
export const AcademicBorderTemplate: React.FC<TemplateProps> = ({ data, mode = 'light' }) => {
  const isLight = mode === 'light';
  const containerBg = isLight ? 'bg-white text-slate-900 border-slate-400' : 'bg-slate-900 text-slate-100 border-slate-700';
  const titleText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-700' : 'text-slate-300';

  return (
    <div className={`${containerBg} p-8 rounded-xl border-4 border-double shadow-xl font-serif text-xs print:p-6 print:bg-white print:text-black print:border-none print:shadow-none min-h-[900px]`}>
      <div className={`text-center border-b ${isLight ? 'border-slate-300' : 'border-slate-700'} pb-5 mb-5 print:border-slate-400`}>
        {data.showPhoto && data.profilePhoto && (
          <img
            src={data.profilePhoto}
            alt={data.fullName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-slate-400"
          />
        )}
        <h1 className={`text-2xl font-bold ${titleText} tracking-widest uppercase print:text-black`}>
          {data.fullName || 'Student Name'}
        </h1>
        <p className={`${subText} italic text-xs mt-1 print:text-slate-700`}>
          {data.title || data.department}
        </p>
      </div>

      <AdditionalSectionsRenderer
        data={data}
        headingClass={`font-sans text-[10px] font-bold uppercase tracking-widest ${subText} border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-1 mb-2 print:text-slate-900 print:border-slate-300`}
        cardClass="font-sans mb-3"
        titleClass={`font-bold ${titleText} text-xs print:text-black`}
        subTitleClass={`text-xs ${subText} italic`}
        textClass={`font-sans text-xs ${subText} mt-1`}
        isLight={isLight}
      />
    </div>
  );
};
