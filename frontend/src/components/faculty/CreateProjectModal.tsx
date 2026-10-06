import React, { useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';

interface CreateProjectModalProps {
  show: boolean;
  onClose: () => void;
  projectForm: {
    name: string;
    internshipTitle: string;
    startDate: string;
    endDate: string;
    frequencyType: string;
    frequencyDays: number;
    description: string;
  };
  setProjectForm: React.Dispatch<React.SetStateAction<any>>;
  handleInternshipSelect: (title: string) => void;
  handleCreateProject: (e: React.FormEvent) => void;
  internships: any[];
}

const DEFAULT_PROJECT_FORM = {
  name: '',
  internshipTitle: '',
  startDate: '',
  endDate: '',
  frequencyType: 'WEEKLY',
  frequencyDays: 7,
  description: '',
};

const formatDateToYYYYMMDD = (dateVal: any): string => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    if (dateVal.includes('T')) {
      return dateVal.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
      return dateVal.trim();
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  show,
  onClose,
  projectForm,
  setProjectForm,
  handleCreateProject,
  internships,
}) => {
  useEffect(() => {
    if (!show) {
      setProjectForm(DEFAULT_PROJECT_FORM);
    }
  }, [show, setProjectForm]);

  if (!show) return null;

  const handleModalClose = () => {
    setProjectForm(DEFAULT_PROJECT_FORM);
    onClose();
  };

  const handleDomainSelect = (title: string) => {
    if (!title) {
      setProjectForm((prev: any) => ({
        ...prev,
        internshipTitle: '',
        startDate: '',
        endDate: '',
      }));
      return;
    }

    const matched = internships.find(
      (i: any) =>
        (i.title || i.internshipTitle || i.role || i.roleName || '').trim().toLowerCase() === title.trim().toLowerCase()
    );

    let start = formatDateToYYYYMMDD(matched?.startDate || matched?.createdDate || matched?.postedDate);
    let end = formatDateToYYYYMMDD(matched?.endDate || matched?.applicationDeadline);

    // If no start date, default to today
    if (!start) {
      start = formatDateToYYYYMMDD(new Date());
    }

    // If matched has duration (e.g. "3 months", "12 weeks"), compute end date
    if (!end && matched?.duration && start) {
      const sDate = new Date(start);
      if (!isNaN(sDate.getTime())) {
        const lower = String(matched.duration).toLowerCase().trim();
        const digitMatch = lower.match(/(\d+)/);
        if (digitMatch) {
          const amount = parseInt(digitMatch[1], 10);
          if (lower.includes('week') || lower.includes('wk') || lower.endsWith('w')) {
            sDate.setDate(sDate.getDate() + amount * 7);
          } else if (lower.includes('day') || lower.endsWith('d')) {
            sDate.setDate(sDate.getDate() + amount);
          } else if (lower.includes('year') || lower.includes('yr')) {
            sDate.setFullYear(sDate.getFullYear() + amount);
          } else {
            sDate.setMonth(sDate.getMonth() + amount);
          }
          end = formatDateToYYYYMMDD(sDate);
        }
      }
    }

    // If still no end date, default to 6 months after start date
    if (!end && start) {
      const sDate = new Date(start);
      if (!isNaN(sDate.getTime())) {
        sDate.setMonth(sDate.getMonth() + 6);
        end = formatDateToYYYYMMDD(sDate);
      }
    }

    setProjectForm((prev: any) => ({
      ...prev,
      internshipTitle: title,
      startDate: start,
      endDate: end,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateProject(e);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="fixed inset-0" onClick={handleModalClose} />
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
              <PlusCircle size={18} style={{ color: '#38bdf8' }} /> Create Project
            </h2>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>
              All fields are mandatory. Please fill in all details below.
            </p>
          </div>
          <button
            className="modal-close"
            type="button"
            onClick={handleModalClose}
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
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                PROJECT NAME <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="e.g. E-Commerce Microservices Engine"
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

            {/* Posted Internship Dropdown */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                UNDER WHICH INTERNSHIP ROLE? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                required
                value={projectForm.internshipTitle}
                onChange={(e) => handleDomainSelect(e.target.value)}
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
                <option value="" style={{ background: '#081330', color: '#ffffff' }}>-- Select Internship Role --</option>
                {internships.map((internship: any, idx: number) => {
                  const roleName =
                    internship.title ||
                    internship.internshipTitle ||
                    internship.role ||
                    internship.roleName;
                  if (!roleName) return null;
                  return (
                    <option key={internship.id || idx} value={roleName} style={{ background: '#081330', color: '#ffffff' }}>
                      {roleName}
                    </option>
                  );
                })}
                <option value="Web Developer Internship" style={{ background: '#081330', color: '#ffffff' }}>Web Developer Internship</option>
                <option value="Full Stack Web Developer Internship" style={{ background: '#081330', color: '#ffffff' }}>Full Stack Web Developer Internship</option>
                <option value="Frontend Engineering Internship" style={{ background: '#081330', color: '#ffffff' }}>Frontend Engineering Internship</option>
                <option value="Backend Software Engineering Internship" style={{ background: '#081330', color: '#ffffff' }}>Backend Software Engineering Internship</option>
                <option value="UI/UX Design Internship" style={{ background: '#081330', color: '#ffffff' }}>UI/UX Design Internship</option>
              </select>
            </div>

            {/* Start Date & End Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  START DATE <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
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
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  END DATE <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={projectForm.endDate}
                  min={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
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

            {/* Task / Report Frequency */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                TASK / REPORT FREQUENCY <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                required
                value={projectForm.frequencyType}
                onChange={(e) => setProjectForm({ ...projectForm, frequencyType: e.target.value })}
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
                <option value="DAILY" style={{ background: '#081330', color: '#ffffff' }}>1. Daily (Every day)</option>
                <option value="WEEKLY" style={{ background: '#081330', color: '#ffffff' }}>2. Weekly (Every 7 days)</option>
                <option value="FIFTEEN_DAYS" style={{ background: '#081330', color: '#ffffff' }}>3. Every 15 Days</option>
                <option value="MONTHLY" style={{ background: '#081330', color: '#ffffff' }}>4. Monthly (Every month)</option>
                <option value="CUSTOM" style={{ background: '#081330', color: '#ffffff' }}>5. Custom Number of Days...</option>
              </select>
            </div>

            {projectForm.frequencyType === 'CUSTOM' && (
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  CUSTOM NUMBER OF DAYS PER PERIOD <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  required
                  value={projectForm.frequencyDays}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, frequencyDays: Number(e.target.value) })
                  }
                  placeholder="e.g. 3, 10, 20"
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
            )}

            {/* Auto-Generated Submission Schedule Preview */}
            {projectForm.startDate && projectForm.endDate && (
              <div
                style={{
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '12px',
                  color: '#34d399',
                }}
              >
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  ⚡ Auto-Generated Schedule Preview:
                </div>
                {(() => {
                  const s = new Date(projectForm.startDate);
                  const e = new Date(projectForm.endDate);
                  const daysStep =
                    projectForm.frequencyType === 'DAILY'
                      ? 1
                      : projectForm.frequencyType === 'WEEKLY'
                      ? 7
                      : projectForm.frequencyType === 'FIFTEEN_DAYS'
                      ? 15
                      : projectForm.frequencyType === 'MONTHLY'
                      ? 30
                      : projectForm.frequencyDays || 7;
                  const totalDays = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
                  const count = Math.ceil(totalDays / daysStep);
                  return (
                    <div>
                      The system will automatically generate <strong>{count} Report Periods</strong> (every {daysStep} day{daysStep > 1 ? 's' : ''}) from {projectForm.startDate} to {projectForm.endDate}.
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Description */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                PROJECT DESCRIPTION & EXPECTATIONS <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                required
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Outline key project deliverables, milestones, tech stack expectations..."
                style={{
                  width: '100%',
                  minHeight: '90px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#ffffff',
                  outline: 'none',
                  background: '#050c1e',
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
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
              onClick={handleModalClose}
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
              Confirm &amp; Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
