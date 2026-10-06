import React from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import SearchableMultiSelect from '../../SearchableMultiSelect';
import { FormField, SecondaryButton } from '../ui';
import { DEPARTMENTS, DEFAULT_SKILLS, DEFAULT_INTERESTS, inputCls, textareaCls } from './profileFieldOptions';

interface ProfileEditFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  addCertificate: () => void;
  updateCertificate: (id: string, field: string, value: any) => void;
  handleCertificateFileChange: (id: string, file: File | null) => void;
  removeCertificate: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, field: string, value: string) => void;
  removeProject: (id: string) => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  form,
  setForm,
  addCertificate,
  updateCertificate,
  handleCertificateFileChange,
  removeCertificate,
  addProject,
  updateProject,
  removeProject,
}) => {
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev: any) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="First name">
          <input className={inputCls} type="text" value={form.firstName} onChange={f('firstName')} />
        </FormField>
        <FormField label="Last name">
          <input className={inputCls} type="text" value={form.lastName} onChange={f('lastName')} />
        </FormField>
        <FormField label="Phone">
          <input className={inputCls} type="tel" value={form.phone} onChange={f('phone')} />
        </FormField>
        <FormField label="Department">
          <select className={inputCls} value={form.department} onChange={f('department')}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Semester">
          <select className={inputCls} value={form.semester} onChange={f('semester')}>
            <option value="">Select semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                Semester {n}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Gender">
          <select className={inputCls} value={form.gender} onChange={f('gender')}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </FormField>
        <FormField label="Date of birth">
          <input className={inputCls} type="date" value={form.dob} onChange={f('dob')} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Skills">
          <SearchableMultiSelect
            options={DEFAULT_SKILLS}
            selected={form.skills}
            onChange={(selected: string[]) => setForm((prev: any) => ({ ...prev, skills: selected }))}
            placeholder="Search and select skills..."
          />
        </FormField>
        <FormField label="Interests">
          <SearchableMultiSelect
            options={DEFAULT_INTERESTS}
            selected={form.interests}
            onChange={(selected: string[]) => setForm((prev: any) => ({ ...prev, interests: selected }))}
            placeholder="Search and select interests..."
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="LinkedIn URL">
          <input className={inputCls} type="url" value={form.linkedin} onChange={f('linkedin')} placeholder="https://linkedin.com/in/..." />
        </FormField>
        <FormField label="GitHub URL">
          <input className={inputCls} type="url" value={form.github} onChange={f('github')} placeholder="https://github.com/..." />
        </FormField>
      </div>

      {/* Certificates edit section */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Certificates</label>
          <SecondaryButton className="px-3 py-1.5" onClick={addCertificate}>
            <Plus size={14} /> Add certificate
          </SecondaryButton>
        </div>
        <div className="flex flex-col gap-3">
          {form.certificates.map((cert: any) => (
            <div key={cert.id} className="rounded-2xl border border-emerald-100 p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-white">Certificate</span>
                <button type="button" onClick={() => removeCertificate(cert.id)} className="p-1 text-rose-500 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Name">
                  <input
                    className={inputCls}
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                    placeholder="Certificate name"
                  />
                </FormField>
                <FormField label="Organization">
                  <input
                    className={inputCls}
                    type="text"
                    value={cert.organization || cert.issuer || ''}
                    onChange={(e) => updateCertificate(cert.id, 'organization', e.target.value)}
                    placeholder="Issuing organization"
                  />
                </FormField>
                <FormField label="Completion year">
                  <input
                    className={inputCls}
                    type="text"
                    value={cert.completionYear || cert.issueDate || ''}
                    onChange={(e) => updateCertificate(cert.id, 'completionYear', e.target.value)}
                    placeholder="2024"
                  />
                </FormField>
                <FormField label="Certificate file (PDF/Image)">
                  <input
                    className="w-full text-xs text-slate-300"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => handleCertificateFileChange(cert.id, e.target.files?.[0] || null)}
                  />
                  {cert.file && (
                    <div className="mt-2 text-xs text-[#2563eb] font-bold flex items-center gap-1">
                      <FileText size={12} /> Selected: {cert.file.name}
                    </div>
                  )}
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects edit section */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Projects</label>
          <SecondaryButton className="px-3 py-1.5" onClick={addProject}>
            <Plus size={14} /> Add project
          </SecondaryButton>
        </div>
        <div className="flex flex-col gap-3">
          {form.projects.map((proj: any) => (
            <div key={proj.id} className="rounded-2xl border border-emerald-100 p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-white">Project</span>
                <button type="button" onClick={() => removeProject(proj.id)} className="p-1 text-rose-500 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <FormField label="Title">
                <input
                  className={`${inputCls} mb-3`}
                  type="text"
                  value={proj.title}
                  onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                  placeholder="Project title"
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  className={`${textareaCls} mb-3`}
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  placeholder="Project description"
                />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Technologies">
                  <input
                    className={inputCls}
                    type="text"
                    value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
                    onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    placeholder="React, Node.js, etc."
                  />
                </FormField>
                <FormField label="Link">
                  <input
                    className={inputCls}
                    type="url"
                    value={proj.link || ''}
                    onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                    placeholder="https://..."
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;
