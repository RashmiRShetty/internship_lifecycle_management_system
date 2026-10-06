import React from 'react';
import { Edit3, X } from 'lucide-react';

interface ReviewModalProps {
  show: boolean;
  onClose: () => void;
  reviewForm: {
    status: string;
    score: string;
    notes: string;
  };
  setReviewForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  show,
  onClose,
  reviewForm,
  setReviewForm,
  onSave,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="modal modal-md"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          maxWidth: '500px',
          width: '90%',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
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
                background: '#eef2ff',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                🔍 Update Project Review & Grade
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
                Evaluate deliverable performance and update score ratings.
              </p>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#e2e8f0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              REVIEW STATUS
            </label>
            <select
              value={reviewForm.status}
              onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="APPROVED & REVIEWED">APPROVED & REVIEWED</option>
              <option value="NEEDS REVISION">NEEDS REVISION</option>
              <option value="UNDER EVALUATION">UNDER EVALUATION</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              EVALUATION SCORE
            </label>
            <input
              type="text"
              value={reviewForm.score}
              onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
              placeholder="e.g. 9.5 / 10, A+"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                background: '#fff',
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              FACULTY REVIEW NOTES & FEEDBACK
            </label>
            <textarea
              rows={4}
              value={reviewForm.notes}
              onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
              placeholder="Provide constructive assessment..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                background: '#fff',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>

        <div
          className="modal-footer"
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setReviewForm((prev: any) => ({ ...prev, status: 'NEEDS REVISION' }));
              setTimeout(onSave, 0);
            }}
            style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ⚠️ Request Change
          </button>
          <button
            type="button"
            onClick={() => {
              setReviewForm((prev: any) => ({ ...prev, status: 'APPROVED & REVIEWED' }));
              setTimeout(onSave, 0);
            }}
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            ✓ Good / Accept
          </button>
        </div>
      </div>
    </div>
  );
};
