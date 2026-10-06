import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface DeletePasswordModalProps {
  show: boolean;
  projectToDelete: any;
  onClose: () => void;
  deletePasswordInput: string;
  setDeletePasswordInput: (val: string) => void;
  confirmDeleteWithPassword: (e: React.FormEvent) => void;
}

export const DeletePasswordModal: React.FC<DeletePasswordModalProps> = ({
  show,
  projectToDelete,
  onClose,
  deletePasswordInput,
  setDeletePasswordInput,
  confirmDeleteWithPassword,
}) => {
  if (!show || !projectToDelete) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 12, 23, 0.48)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: 'min(90vw, 760px)',
          background: '#f3f3f5',
          borderRadius: '28px',
          boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)',
          border: '1px solid rgba(255,255,255,0.4)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 28px 18px',
            background: '#f3f3f5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                fontSize: '18px',
                fontWeight: 900,
              }}
            >
              <AlertCircle size={22} style={{ color: '#dc2626' }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#d92d2d',
                  margin: 0,
                  letterSpacing: '-0.04em',
                }}
              >
                Security Verification
              </h2>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '14px',
                  color: '#7a3d45',
                  fontWeight: 600,
                }}
              >
                Enter your account password to confirm project deletion.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f2d7dc',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#b91c1c',
              boxShadow: 'inset 0 0 0 1px rgba(220, 38, 38, 0.08)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={confirmDeleteWithPassword}>
          <div style={{ padding: '8px 28px 12px' }}>
            <div
              style={{
                background: '#f6dfe1',
                border: '1px solid #f1bec4',
                borderRadius: '14px',
                padding: '18px 18px',
                marginTop: '8px',
                marginBottom: '18px',
                color: '#8f1d1f',
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              <div>
                You are about to delete project: <strong style={{ color: '#7f1d1d' }}>{projectToDelete.name}</strong>. This action cannot be undone.
              </div>
            </div>

            <label
              style={{
                display: 'block',
                marginBottom: '10px',
                color: '#101828',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Account Password <span style={{ color: '#d92d2d' }}>*</span>
            </label>

            <input
              type="password"
              required
              autoFocus
              value={deletePasswordInput}
              onChange={(e) => setDeletePasswordInput(e.target.value)}
              placeholder="Enter your account password..."
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '14px',
                border: '1px solid #bcc5d0',
                background: '#ffffff',
                padding: '0 16px',
                fontSize: '18px',
                fontWeight: 500,
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '18px 28px 28px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '56px',
                borderRadius: '14px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#1f2937',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 0 rgba(15, 23, 42, 0.04)',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                flex: 2,
                height: '56px',
                border: 'none',
                borderRadius: '14px',
                background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 10px 18px rgba(220, 38, 38, 0.22)',
              }}
            >
              Confirm Permanent Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
