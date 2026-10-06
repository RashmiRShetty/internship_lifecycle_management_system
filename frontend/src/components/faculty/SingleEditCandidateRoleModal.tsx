import React from 'react';
import { Edit3, AlertCircle, X } from 'lucide-react';

interface SingleEditCandidateRoleModalProps {
  candidate: any;
  onClose: () => void;
  singleRoleInput: string;
  setSingleRoleInput: (val: string) => void;
  singleDescInput: string;
  setSingleDescInput: (val: string) => void;
  singleEditError: string;
  onSave: (e: React.FormEvent) => void;
}

export const SingleEditCandidateRoleModal: React.FC<SingleEditCandidateRoleModalProps> = ({
  candidate,
  onClose,
  singleRoleInput,
  setSingleRoleInput,
  singleDescInput,
  setSingleDescInput,
  singleEditError,
  onSave,
}) => {
  if (!candidate) return null;

  const candidateName = candidate.name || candidate.studentEmail || candidate.email || 'Candidate';

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
          maxWidth: '520px',
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
              <Edit3 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                ✏️ Edit Candidate Role &amp; Task
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>
                Update assigned role &amp; module responsibilities for {candidateName}
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

        <form onSubmit={onSave}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {singleEditError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '12px',
                  color: '#f87171',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ color: '#ef4444' }} /> {singleEditError}
              </div>
            )}

            {/* Role Title */}
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
                ASSIGNED ROLE TITLE <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={singleRoleInput}
                onChange={(e) => setSingleRoleInput(e.target.value)}
                placeholder="e.g. Frontend Lead, Backend Developer, QA Engineer"
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

            {/* Task Description */}
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
                MODULE RESPONSIBILITIES &amp; INSTRUCTIONS <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={4}
                required
                value={singleDescInput}
                onChange={(e) => setSingleDescInput(e.target.value)}
                placeholder="Describe key responsibilities and expectations..."
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
          </div>

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
              Save &amp; Send Email Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
