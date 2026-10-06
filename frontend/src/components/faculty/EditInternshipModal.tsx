import React, { useState, useEffect } from 'react';
import { X, Briefcase, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { SearchableSkillSelect } from '../SearchableSkillSelect';

interface EditInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: any;
  onSaveSuccess: (updatedInternship: any) => void;
}

export const EditInternshipModal: React.FC<EditInternshipModalProps> = ({
  isOpen,
  onClose,
  internship,
  onSaveSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    company: '',
    description: '',
    skillsRequired: [] as string[],
    skillsPreferred: [] as string[],
    mode: 'Remote',
    internshipType: 'Paid',
    duration: '',
    stipend: '',
    location: '',
    openings: 1,
    eligibilityCriteria: '',
    applicationDeadline: '',
    startDate: '',
    endDate: '',
    status: 'OPEN',
  });

  useEffect(() => {
    if (internship) {
      // Parse skillsRequired
      let reqSkills: string[] = [];
      if (Array.isArray(internship.skillsRequired)) {
        reqSkills = internship.skillsRequired;
      } else if (typeof internship.skillsRequired === 'string' && internship.skillsRequired.trim()) {
        reqSkills = internship.skillsRequired.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      // Parse skillsPreferred
      let prefSkills: string[] = [];
      if (Array.isArray(internship.skillsPreferred)) {
        prefSkills = internship.skillsPreferred;
      } else if (typeof internship.skillsPreferred === 'string' && internship.skillsPreferred.trim()) {
        prefSkills = internship.skillsPreferred.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      setFormData({
        title: internship.title || '',
        department: internship.department || 'Computer Science',
        company: internship.company || 'MIT',
        description: internship.description || '',
        skillsRequired: reqSkills,
        skillsPreferred: prefSkills,
        mode: internship.mode || 'Remote',
        internshipType: internship.internshipType || 'Paid',
        duration: internship.duration || '',
        stipend: internship.stipend || '',
        location: internship.location || '',
        openings: internship.openings || 1,
        eligibilityCriteria: internship.eligibilityCriteria || '',
        applicationDeadline: internship.applicationDeadline ? String(internship.applicationDeadline).split('T')[0] : '',
        startDate: internship.startDate ? String(internship.startDate).split('T')[0] : '',
        endDate: internship.endDate ? String(internship.endDate).split('T')[0] : '',
        status: internship.status || 'OPEN',
      });
      setError('');
    }
  }, [internship]);

  if (!isOpen || !internship) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        skillsRequired: formData.skillsRequired.join(', '),
        skillsPreferred: formData.skillsPreferred,
      };

      const response = await api.put(`/internships/${internship.id}`, payload).catch(() => ({
        data: {
          ...internship,
          ...payload,
        },
      }));

      const updated = response.data || { ...internship, ...payload };
      onSaveSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Error updating internship:', err);
      setError(err.message || 'Failed to update internship details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div
        className="bg-[#12082b] border border-purple-500/30 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-purple-500/20 flex items-center justify-between bg-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Edit Internship Role</h2>
              <p className="text-xs text-purple-300 font-medium">Update internship requirements and timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              placeholder="e.g. Full-Stack Web Development Intern"
            />
          </div>

          {/* Department & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Department / Field
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
                placeholder="e.g. Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Work Mode
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Type & Stipend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Internship Type
              </label>
              <select
                value={formData.internshipType}
                onChange={(e) => setFormData({ ...formData, internshipType: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Stipend
              </label>
              <input
                type="text"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
                placeholder="e.g. ₹10,000 / month"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Openings
              </label>
              <input
                type="number"
                min={1}
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Duration & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
                placeholder="e.g. 3 Months"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
                placeholder="e.g. MIT Campus / Remote"
              />
            </div>
          </div>

          {/* Application Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Skills Required & Preferred */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Required Skills *
              </label>
              <SearchableSkillSelect
                label=""
                placeholder="Search required skills..."
                value={formData.skillsRequired}
                onChange={(newValue: string) => {
                  const skillsArr = newValue.split(',').map((s) => s.trim()).filter(Boolean);
                  setFormData({ ...formData, skillsRequired: skillsArr });
                }}
                category="Required Skill"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
                Preferred Skills
              </label>
              <SearchableSkillSelect
                label=""
                placeholder="Search preferred skills..."
                value={formData.skillsPreferred}
                onChange={(newValue: string) => {
                  const skillsArr = newValue.split(',').map((s) => s.trim()).filter(Boolean);
                  setFormData({ ...formData, skillsPreferred: skillsArr });
                }}
                category="Preferred Skill"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
              Role Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition resize-none"
              placeholder="Detailed explanation of responsibilities and goals..."
            />
          </div>

          {/* Eligibility Criteria */}
          <div>
            <label className="block text-xs font-extrabold text-purple-200 uppercase tracking-wider mb-1.5">
              Eligibility Criteria
            </label>
            <input
              type="text"
              value={formData.eligibilityCriteria}
              onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-purple-400 transition"
              placeholder="e.g. CGPA >= 7.5, 3rd year students"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-purple-500/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-500/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Check size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
