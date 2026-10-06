import React from 'react';
import { Star, MessageCircle, X } from 'lucide-react';

interface FeedbackModalProps {
  show: boolean;
  onClose: () => void;
  feedbackForm: {
    rating: number;
    strengths: string;
    improvements: string;
    comments: string;
  };
  setFeedbackForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  show,
  onClose,
  feedbackForm,
  setFeedbackForm,
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
          maxWidth: '520px',
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
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                💬 Student Mentorship & Rating Feedback
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
                Provide rating feedback and mentorship guidance.
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
                marginBottom: '8px',
                display: 'block',
              }}
            >
              STAR RATING SCORE (1 TO 5 STARS)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <Star
                    size={28}
                    fill={star <= feedbackForm.rating ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                </button>
              ))}
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#d97706', marginLeft: '8px' }}>
                ({feedbackForm.rating} / 5 Stars)
              </span>
            </div>
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
              KEY STRENGTHS
            </label>
            <input
              type="text"
              value={feedbackForm.strengths}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
              placeholder="e.g. Strong problem solving, modular code structure..."
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
              AREAS FOR IMPROVEMENT
            </label>
            <input
              type="text"
              value={feedbackForm.improvements}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, improvements: e.target.value })}
              placeholder="e.g. Write additional unit tests for corner edge-cases..."
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
              FACULTY MENTORSHIP COMMENTS
            </label>
            <textarea
              rows={3}
              value={feedbackForm.comments}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
              placeholder="Provide mentorship feedback..."
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
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 22px',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
            }}
          >
            Save Feedback & Notify Student
          </button>
        </div>
      </div>
    </div>
  );
};
