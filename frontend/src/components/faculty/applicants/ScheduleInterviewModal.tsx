import React from 'react';
import { Video, MapPin, X } from 'lucide-react';

interface ScheduleInterviewModalProps {
  show: boolean;
  onClose: () => void;
  selectedApp: any;
  meetingData: {
    title: string;
    description: string;
    startTime: string;
    type?: 'ONLINE' | 'IN_PERSON';
    meetingLink?: string;
  };
  setMeetingData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      startTime: string;
      type?: 'ONLINE' | 'IN_PERSON';
      meetingLink?: string;
    }>
  >;
  onSchedule: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  show,
  onClose,
  selectedApp,
  meetingData,
  setMeetingData,
  onSchedule,
}) => {
  if (!show || !selectedApp) return null;

  const currentType = meetingData.type || 'ONLINE';

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.72)' }}
      />
      <div
        className="modal modal-md"
        style={{
          position: 'relative',
          background: '#081330',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '24px',
          overflow: 'hidden',
          maxWidth: '520px',
          width: 'min(520px, 100%)',
          maxHeight: 'calc(100dvh - 32px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.55), 0 0 32px rgba(124, 58, 237, 0.14)',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
            background: 'rgba(15, 23, 42, 0.92)',
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
                borderRadius: '10px',
                background: currentType === 'IN_PERSON' ? 'rgba(245, 158, 11, 0.14)' : 'rgba(168, 85, 247, 0.16)',
                color: currentType === 'IN_PERSON' ? '#fbbf24' : '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentType === 'IN_PERSON' ? <MapPin size={20} /> : <Video size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Schedule Interview
              </h2>
              <p style={{ fontSize: '12px', color: '#a9b4cc', margin: '2px 0 0 0', fontWeight: 500 }}>
                Candidate: {selectedApp.studentName || selectedApp.studentEmail}
              </p>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Interview Type Selector Cards */}
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#cbd5e1',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              INTERVIEW MODE <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setMeetingData({ ...meetingData, type: 'ONLINE' })}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: currentType === 'ONLINE' ? '2px solid #a855f7' : '1px solid rgba(148, 163, 184, 0.28)',
                  background: currentType === 'ONLINE' ? 'rgba(168, 85, 247, 0.14)' : '#0b1736',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: currentType === 'ONLINE' ? '#9333ea' : '#1e293b',
                    color: currentType === 'ONLINE' ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Video size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: currentType === 'ONLINE' ? '#e9d5ff' : '#f1f5f9' }}>
                    Google Meet
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Online Video Call</div>
                </div>
              </div>

              <div
                onClick={() => setMeetingData({ ...meetingData, type: 'IN_PERSON' })}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: currentType === 'IN_PERSON' ? '2px solid #f59e0b' : '1px solid rgba(148, 163, 184, 0.28)',
                  background: currentType === 'IN_PERSON' ? 'rgba(245, 158, 11, 0.12)' : '#0b1736',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: currentType === 'IN_PERSON' ? '#d97706' : '#1e293b',
                    color: currentType === 'IN_PERSON' ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: currentType === 'IN_PERSON' ? '#fcd34d' : '#f1f5f9' }}>
                    Direct Location
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>In-Person / Office</div>
                </div>
              </div>
            </div>
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
              MEETING TITLE <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
              placeholder="e.g. Technical Code Review & Interview"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f8fafc',
                outline: 'none',
                background: '#050c1e',
                boxSizing: 'border-box',
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
              DATE & TIME <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={meetingData.startTime}
              onChange={(e) => setMeetingData({ ...meetingData, startTime: e.target.value })}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f8fafc',
                outline: 'none',
                background: '#050c1e',
                colorScheme: 'dark',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Dynamic Link vs Location Address input */}
          {currentType === 'IN_PERSON' ? (
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
                LOCATION / VENUE ADDRESS <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={meetingData.meetingLink || ''}
                onChange={(e) => setMeetingData({ ...meetingData, meetingLink: e.target.value })}
                placeholder="e.g. Room 302, CS Dept Block B, Main Campus"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f8fafc',
                  outline: 'none',
                  background: '#050c1e',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '11px', color: '#fbbf24', margin: '4px 0 0 0', fontWeight: 600 }}>
                📍 Candidate will receive an email/notification instructing them to attend in person at this venue address.
              </p>
            </div>
          ) : (
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
                GOOGLE MEET LINK
              </label>
              <p style={{ fontSize: '12px', color: '#c4b5fd', margin: 0, fontWeight: 600 }}>
                A real Google Meet link will be created in the faculty organizer's Google Calendar when scheduled.
              </p>
            </div>
          )}

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
              DESCRIPTION / INSTRUCTIONS (OPTIONAL)
            </label>
            <textarea
              rows={3}
              value={meetingData.description}
              onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
              placeholder={
                currentType === 'IN_PERSON'
                  ? 'e.g. Please bring a printed copy of your resume and ID card.'
                  : 'e.g. Please join 5 minutes early with working camera and mic.'
              }
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                fontSize: '13px',
                fontWeight: 500,
                color: '#f8fafc',
                outline: 'none',
                background: '#050c1e',
                resize: 'vertical',
                lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div
          className="modal-footer"
          style={{
            padding: '16px 24px',
            background: 'rgba(15, 23, 42, 0.92)',
            borderTop: '1px solid rgba(168, 85, 247, 0.2)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.14)',
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
            onClick={onSchedule}
            style={{
              background:
                currentType === 'IN_PERSON'
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 22px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow:
                currentType === 'IN_PERSON'
                  ? '0 4px 12px rgba(217,119,6,0.3)'
                  : '0 4px 12px rgba(147,51,234,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {currentType === 'IN_PERSON' ? (
              <>
                <MapPin size={15} /> Schedule In-Person Interview
              </>
            ) : (
              <>
                <Video size={15} /> Schedule Google Meet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
