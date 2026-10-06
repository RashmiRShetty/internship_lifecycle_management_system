import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { issueCertificate, type InternshipCertificate } from '../../../services/certificateService';

interface IssueCertificateModalProps {
  show: boolean;
  onClose: () => void;
  application: any;
  facultyEmail: string;
  facultyName?: string;
  onCertificateIssued: (cert: InternshipCertificate) => void;
}

export const IssueCertificateModal: React.FC<IssueCertificateModalProps> = ({
  show,
  onClose,
  application,
  facultyEmail,
  facultyName = 'Faculty Supervisor',
  onCertificateIssued,
}) => {
  const [studentName, setStudentName] = useState<string>(
    application?.studentName || application?.studentEmail?.split('@')[0] || 'Student'
  );
  const [internshipTitle, setInternshipTitle] = useState<string>(
    application?.internshipTitle || 'Internship Program'
  );
  const [performanceGrade, setPerformanceGrade] = useState<string>('Grade A+ (Outstanding)');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show || !application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !internshipTitle) {
      return alert('Please fill in student name and internship title');
    }

    try {
      setIsSubmitting(true);
      const newCert = issueCertificate({
        applicationId: application.id,
        studentEmail: application.studentEmail,
        studentName,
        facultyEmail,
        facultyName,
        internshipTitle,
        issueDate,
        performanceGrade,
      });

      alert(`Certificate issued successfully for ${studentName}! Certificate Code: ${newCert.certificateNumber}`);
      onCertificateIssued(newCert);
      onClose();
    } catch (err) {
      alert('Failed to issue certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          maxWidth: '520px',
          width: '100%',
          maxHeight: 'calc(100dvh - 32px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/mit_logo.png" alt="MIT Logo" style={{ height: '38px', objectFit: 'contain' }} />
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Issue MIT Certificate
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                Manipal Institute of Technology Official Internship Certificate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Certificate Preview Box */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#b82a26', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
            MANIPAL INSTITUTE OF TECHNOLOGY • CERTIFICATE PREVIEW
          </div>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', fontFamily: 'serif', marginTop: '4px' }}>
            {studentName || 'STUDENT NAME'}
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            Role: <strong>{internshipTitle || 'Internship Title'}</strong>
          </div>
          <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
            Grade: {performanceGrade} • Supervisor: {facultyName}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Student Email
            </label>
            <input
              type="email"
              value={application.studentEmail}
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '13px',
                color: '#64748b',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Internship Title / Role
            </label>
            <input
              type="text"
              value={internshipTitle}
              onChange={(e) => setInternshipTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Performance Rating
              </label>
              <select
                value={performanceGrade}
                onChange={(e) => setPerformanceGrade(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#0f172a',
                }}
              >
                <option value="Grade A+ (Outstanding)">Grade A+ (Outstanding)</option>
                <option value="Grade A (Excellent)">Grade A (Excellent)</option>
                <option value="Grade B+ (Very Good)">Grade B+ (Very Good)</option>
                <option value="Successfully Completed">Successfully Completed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#b82a26',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(184,42,38,0.3)',
              }}
            >
              <CheckCircle2 size={16} /> Issue MIT Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
