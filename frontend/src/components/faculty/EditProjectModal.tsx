import React, { useState, useEffect } from 'react';
import { Edit3, X } from 'lucide-react';

interface EditProjectModalProps {
  show: boolean;
  onClose: () => void;
  project: any;
  onSaveProject: (updatedProjectData: any) => void;
  internships: any[];
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  show,
  onClose,
  project,
  onSaveProject,
  internships,
}) => {
  const [form, setForm] = useState({
    name: '',
    internshipTitle: '',
    startDate: '',
    endDate: '',
    frequencyType: 'WEEKLY',
    frequencyDays: 7,
    description: '',
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        internshipTitle: project.internshipTitle || (internships[0]?.title || 'Web Developer Internship'),
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        frequencyType: project.frequencyType || 'WEEKLY',
        frequencyDays: project.frequencyDays || 7,
        description: project.description || '',
      });
    }
  }, [project, internships]);

  if (!show || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      return alert('Please fill in all mandatory fields (Name, Start Date, End Date)');
    }

    const freqDays =
      form.frequencyType === 'DAILY'
        ? 1
        : form.frequencyType === 'WEEKLY'
        ? 7
        : form.frequencyType === 'FIFTEEN_DAYS'
        ? 15
        : form.frequencyType === 'MONTHLY'
        ? 30
        : 7;

    onSaveProject({
      ...project,
      ...form,
      frequencyDays: freqDays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-[#081330] border border-slate-700/80 rounded-3xl shadow-2xl p-0 my-auto text-white"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: '#060d1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 900,
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Edit3 size={18} style={{ color: '#5b51ef' }} /> Edit Project Details
            </h2>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
              Update project details, timeline, and submission frequency.
            </p>
          </div>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {/* Project Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                PROJECT NAME <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. E-Commerce Frontend Platform"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  outline: 'none',
                  background: '#050c1e',
                }}
              />
            </div>

            {/* Linked Internship */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                LINK TO POSTED INTERNSHIP ROLE <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.internshipTitle}
                onChange={(e) => {
                  const title = e.target.value;
                  const matched = internships.find(
                    (i: any) =>
                      (i.title || i.internshipTitle || i.role || i.roleName || '').trim().toLowerCase() === title.trim().toLowerCase()
                  );

                  let start = matched?.startDate || matched?.createdDate || form.startDate || '';
                  let end = matched?.endDate || matched?.applicationDeadline || form.endDate || '';

                  if (start && start.includes('T')) start = start.split('T')[0];
                  if (end && end.includes('T')) end = end.split('T')[0];

                  setForm((prev) => ({
                    ...prev,
                    internshipTitle: title,
                    startDate: start || prev.startDate,
                    endDate: end || prev.endDate,
                  }));
                }}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  outline: 'none',
                  background: '#050c1e',
                  cursor: 'pointer',
                }}
              >
                {internships.map((intern) => {
                  const title = intern.title || intern.internshipTitle || intern.role || 'Web Developer Internship';
                  return (
                    <option key={intern.id || title} value={title} style={{ background: '#081330', color: '#ffffff' }}>
                      {title} ({intern.department || 'IT'})
                    </option>
                  );
                })}
                {!internships.some((i) => (i.title || i.internshipTitle) === form.internshipTitle) && form.internshipTitle && (
                  <option value={form.internshipTitle} style={{ background: '#081330', color: '#ffffff' }}>{form.internshipTitle}</option>
                )}
              </select>
            </div>

            {/* Start Date & End Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                  }}
                >
                  START DATE <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                    outline: 'none',
                    background: '#050c1e',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                  }}
                >
                  END DATE <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                    outline: 'none',
                    background: '#050c1e',
                  }}
                />
              </div>
            </div>

            {/* Report Submission Frequency */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                REPORT SUBMISSION FREQUENCY
              </label>
              <select
                value={form.frequencyType}
                onChange={(e) => setForm({ ...form, frequencyType: e.target.value })}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  outline: 'none',
                  background: '#050c1e',
                  cursor: 'pointer',
                }}
              >
                <option value="WEEKLY" style={{ background: '#081330', color: '#ffffff' }}>Weekly (Every 7 Days)</option>
                <option value="DAILY" style={{ background: '#081330', color: '#ffffff' }}>Daily (Every 1 Day)</option>
                <option value="FIFTEEN_DAYS" style={{ background: '#081330', color: '#ffffff' }}>Bi-Weekly (Every 15 Days)</option>
                <option value="MONTHLY" style={{ background: '#081330', color: '#ffffff' }}>Monthly (Every 30 Days)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                PROJECT DESCRIPTION / OBJECTIVE
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe project scope, goals, and key technologies..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#ffffff',
                  outline: 'none',
                  background: '#050c1e',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '16px 24px',
              background: '#060d1e',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 22px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
