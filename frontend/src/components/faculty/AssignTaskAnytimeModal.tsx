import React from 'react';
import { ClipboardList, X } from 'lucide-react';

interface AssignTaskAnytimeModalProps {
  show: boolean;
  onClose: () => void;
  form: {
    studentEmail: string;
    title: string;
    description: string;
    instructions: string;
    completionDays: string;
    customDays: number;
    dueDate: string;
    priority: string;
    projectId: string | number;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
}

export const AssignTaskAnytimeModal: React.FC<AssignTaskAnytimeModalProps> = ({
  show,
  onClose,
  form,
  setForm,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#081330',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          maxWidth: '540px',
          width: '100%',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                ⚡ Assign Task Anytime
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>
                Assign a task to an individual student on any day with custom deadlines.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Target Student */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                TARGET STUDENT EMAIL <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                required
                value={form.studentEmail}
                onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                placeholder="e.g. student@gmail.com"
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

            {/* Task Title */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                TASK TITLE <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Build Payment Gateway API, Fix Database Indexes..."
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

            {/* Task Description & Instructions */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                INSTRUCTIONS & DELIVERABLE EXPECTATIONS
              </label>
              <textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Provide clear steps, requirements, and reference URLs..."
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
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Completion Timeframe Selector */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                COMPLETION TIMEFRAME (WITHIN HOW MANY DAYS?) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.completionDays}
                onChange={(e) => {
                  const daysChoice = e.target.value;
                  let daysCount = 3;
                  if (daysChoice === '1') daysCount = 1;
                  else if (daysChoice === '3') daysCount = 3;
                  else if (daysChoice === '5') daysCount = 5;
                  else if (daysChoice === '7') daysCount = 7;
                  else if (daysChoice === '15') daysCount = 15;
                  else if (daysChoice === 'CUSTOM') daysCount = form.customDays || 3;

                  const computedDate = new Date(Date.now() + daysCount * 86400000)
                    .toISOString()
                    .split('T')[0];
                  setForm({
                    ...form,
                    completionDays: daysChoice,
                    dueDate: computedDate,
                  });
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
                <option value="1" style={{ background: '#050c1e', color: '#fff' }}>⚡ Complete within 1 Day (24 Hours)</option>
                <option value="3" style={{ background: '#050c1e', color: '#fff' }}>📅 Complete within 3 Days</option>
                <option value="5" style={{ background: '#050c1e', color: '#fff' }}>📅 Complete within 5 Days</option>
                <option value="7" style={{ background: '#050c1e', color: '#fff' }}>🗓 Complete within 7 Days (1 Week)</option>
                <option value="15" style={{ background: '#050c1e', color: '#fff' }}>🗓 Complete within 15 Days</option>
                <option value="CUSTOM" style={{ background: '#050c1e', color: '#fff' }}>⚙️ Custom Number of Days...</option>
              </select>
            </div>

            {form.completionDays === 'CUSTOM' && (
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  CUSTOM NUMBER OF DAYS <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={form.customDays}
                  onChange={(e) => {
                    const numDays = Number(e.target.value) || 1;
                    const computedDate = new Date(Date.now() + numDays * 86400000)
                      .toISOString()
                      .split('T')[0];
                    setForm({
                      ...form,
                      customDays: numDays,
                      dueDate: computedDate,
                    });
                  }}
                  placeholder="e.g. 2, 4, 10, 20"
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

            {/* Due Date & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  CALCULATED DUE DATE
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
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
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'block',
                  }}
                >
                  PRIORITY LEVEL
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
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
                  <option value="LOW" style={{ background: '#050c1e', color: '#fff' }}>Low Priority</option>
                  <option value="MEDIUM" style={{ background: '#050c1e', color: '#fff' }}>Medium Priority</option>
                  <option value="HIGH" style={{ background: '#050c1e', color: '#fff' }}>High Priority</option>
                  <option value="URGENT" style={{ background: '#050c1e', color: '#fff' }}>⚡ Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 24px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
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
                padding: '10px 24px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              }}
            >
              ⚡ Assign Task Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
