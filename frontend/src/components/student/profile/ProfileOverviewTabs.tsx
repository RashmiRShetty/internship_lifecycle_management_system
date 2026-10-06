import React from 'react';
import {
  Briefcase,
  Award,
  Phone,
  User,
  Calendar,
  FileText,
  Globe,
  Code2,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import type { Certificate, ProjectItem } from './profileFieldOptions';
import { getSkillIcon } from '../BrowseInternships';

interface ProfileOverviewTabsProps {
  activeTab: 'overview' | 'skills' | 'certificates' | 'projects';
  profileData: any;
  parsedCertificates: Certificate[];
  parsedProjects: ProjectItem[];
}

export const ProfileOverviewTabs: React.FC<ProfileOverviewTabsProps> = ({
  activeTab,
  profileData,
  parsedCertificates,
  parsedProjects,
}) => {
  return (
    <div className="w-full font-sans text-slate-100">
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Details Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <User size={14} className="text-cyan-400" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {[
                ['Department', profileData?.department, Briefcase],
                ['Semester', profileData?.semester ? `Semester ${profileData.semester}` : null, Award],
                ['Phone', profileData?.phone, Phone],
                ['Gender', profileData?.gender, User],
                ['Date of birth', profileData?.dob ? new Date(profileData.dob).toLocaleDateString() : null, Calendar],
              ].map(([label, val, Icon]: any) => (
                <div key={label} className="bg-[#0a1e4e]/85 rounded-3xl border border-sky-500/30 p-5 shadow-xl hover:border-cyan-500/40 transition backdrop-blur-md">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3 shrink-0 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Icon size={18} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-extrabold text-white truncate">
                    {val || <span className="text-slate-300 italic font-normal">Not provided</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Profiles */}
          {(profileData?.linkedin || profileData?.github) && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Globe size={14} className="text-cyan-400" /> Social Profiles &amp; Links
              </h3>
              <div className="flex gap-3 flex-wrap">
                {profileData?.linkedin && (
                  <a
                    href={profileData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs"
                  >
                    LinkedIn Profile <ExternalLink size={13} />
                  </a>
                )}
                {profileData?.github && (
                  <a
                    href={profileData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white/10 text-white border border-white/20 hover:bg-white/20 text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs"
                  >
                    GitHub Portfolio <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" /> Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {profileData?.skills ? (
                profileData.skills.split(',').map((s: string) => (
                  <span
                    key={s}
                    className="px-4 py-2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold shadow-xs flex items-center gap-2"
                  >
                    {getSkillIcon(s)}
                    <span>{s.trim()}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-300 italic">No skills listed yet. Click "Edit profile" to add your skills.</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-400" /> Interested Domains
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {profileData?.interestedDomain ? (
                profileData.interestedDomain.split(',').map((s: string) => (
                  <span
                    key={s}
                    className="px-4 py-2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-extrabold shadow-xs flex items-center gap-1.5"
                  >
                    🎯 {s.trim()}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-300 italic">No domain interests listed yet.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Award size={14} className="text-amber-400" /> Certifications &amp; Verified Credentials
          </h3>
          {parsedCertificates.length === 0 ? (
            <div className="p-12 text-center text-slate-300 text-xs font-medium bg-[#06163d]/80 border border-dashed border-sky-500/30 rounded-3xl">
              No certificates uploaded yet. Click "Edit profile" to upload your achievements.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {parsedCertificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="rounded-3xl border border-sky-500/30 p-6 shadow-xl hover:border-cyan-500/40 transition bg-[#0a1e4e]/85 backdrop-blur-md flex flex-col justify-between gap-4 text-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <Award size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">{cert.name}</h4>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {cert.organization || cert.issuer}
                        {cert.completionYear || cert.issueDate ? ` · ${cert.completionYear || cert.issueDate}` : ''}
                      </p>
                    </div>
                  </div>

                  {(cert.fileUrl || cert.credentialUrl) && (
                    <a
                      href={cert.fileUrl || cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1.5 self-start pt-2"
                    >
                      <FileText size={14} /> View Certificate <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Code2 size={14} className="text-cyan-400" /> Project Portfolio
          </h3>
          {parsedProjects.length === 0 ? (
            <div className="p-12 text-center text-slate-300 text-xs font-medium bg-[#06163d]/80 border border-dashed border-sky-500/30 rounded-3xl">
              No projects added yet. Click "Edit profile" to list your project portfolio.
            </div>
          ) : (
            <div className="space-y-5">
              {parsedProjects.map((proj: any) => {
                const techsStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies;
                return (
                  <div key={proj.id} className="rounded-3xl border border-sky-500/30 p-6 shadow-xl hover:border-cyan-500/40 transition bg-[#0a1e4e]/85 backdrop-blur-md space-y-4 text-white">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30">
                          <Code2 size={20} />
                        </div>
                        <h4 className="text-base font-extrabold text-white">{proj.title}</h4>
                      </div>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          View Project <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="text-xs text-slate-300 font-medium leading-relaxed">{proj.description}</p>}
                    {techsStr && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {techsStr.split(',').map((tech: string) => (
                          <span key={tech} className="px-3 py-1 rounded-full bg-[#06163d] border border-sky-500/30 text-slate-300 text-xs font-medium">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileOverviewTabs;
