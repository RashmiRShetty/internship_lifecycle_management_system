import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Calendar, Users, Edit3, Trash2, Info, X } from 'lucide-react';
import { isApplicantAssignableToProject } from '../../../utils/projectAssignmentUtils';

interface ProjectDetailPageProps {
  activeProjectDetail: any;
  facultyApplications: any[];
  onBack: () => void;
  onSelectStudentProfile: (student: any) => void;
  onOpenSingleEditModal: (candidate: any) => void;
  onRemoveCandidateTaskAssignment: (studentEmail: string) => void;
  onAssignTasksClick: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  activeProjectDetail,
  facultyApplications,
  onBack,
  onSelectStudentProfile,
  onOpenSingleEditModal,
  onRemoveCandidateTaskAssignment,
  onAssignTasksClick,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Source of truth for "who is assigned to THIS project" is the project's
  // own assignedApplicants list. We used to also pull in any accepted
  // application whose role text loosely matched this project's
  // internshipTitle — that had no real link to this project's id, so a
  // single applicant matched by title text alone showed up as "assigned"
  // under every project that shared a similar title. That's why the same
  // one student and task set appeared everywhere. Only trust
  // assignedApplicants here.
  const mergedAssignedList: any[] = [];

  if (activeProjectDetail.assignedApplicants && Array.isArray(activeProjectDetail.assignedApplicants)) {
    const seenEmails = new Set<string>();
    activeProjectDetail.assignedApplicants.forEach((item: any) => {
      const email = (item.studentEmail || item.email || '').trim().toLowerCase();
      if (email && !seenEmails.has(email)) {
        seenEmails.add(email);
        mergedAssignedList.push(item);
      }
    });
  }

  // Look up full applicant details (name, etc.) for each assigned entry from
  // facultyApplications, matched strictly by email — never by role/title text.
  const appsByEmail = new Map<string, any>();
  facultyApplications.forEach((app: any) => {
    const email = (app.studentEmail || app.email || '').trim().toLowerCase();
    if (email) appsByEmail.set(email, app);
  });

  const hasAcceptedApplicant = facultyApplications.some((app: any) =>
    isApplicantAssignableToProject(app, activeProjectDetail)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Bar */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px 20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} /> Back to Projects List
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              {activeProjectDetail.name}
            </h1>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '2px 10px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              {activeProjectDetail.internshipTitle || 'General Internship'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowDetailsModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={14} style={{ color: '#38bdf8' }} /> Project Details
          </button>

          <button
            onClick={() => {
              if (!hasAcceptedApplicant) {
                alert('A student must explicitly accept the internship before faculty can assign roles or tasks.');
                return;
              }
              onAssignTasksClick();
            }}
            disabled={!hasAcceptedApplicant}
            style={{
              background: hasAcceptedApplicant
                ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                : 'rgba(148, 163, 184, 0.18)',
              color: hasAcceptedApplicant ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: hasAcceptedApplicant ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: hasAcceptedApplicant ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none',
              opacity: hasAcceptedApplicant ? 1 : 0.7,
            }}
          >
            <Users size={14} /> Manage All Role Assignments
          </button>
        </div>
      </div>

      {/* Project Details Modal */}
      {showDetailsModal && (
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
          }}
          onClick={() => setShowDetailsModal(false)}
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
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    flexShrink: 0,
                  }}
                >
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    {activeProjectDetail.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                    Linked Internship: <strong style={{ color: '#38bdf8' }}>{activeProjectDetail.internshipTitle || 'General Internship'}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#cbd5e1',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {activeProjectDetail.description ? (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Project Description
                </div>
                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: 1.5, background: '#050c1e', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '12px', padding: '12px 14px' }}>
                  {activeProjectDetail.description}
                </p>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                No description provided for this project.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: '#38bdf8' }} /> Start Date:
                </span>
                <strong style={{ color: '#ffffff' }}>
                  {activeProjectDetail.startDate ? new Date(activeProjectDetail.startDate).toLocaleDateString() : 'N/A'}
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: '#34d399' }} /> End Date:
                </span>
                <strong style={{ color: '#ffffff' }}>
                  {activeProjectDetail.endDate ? new Date(activeProjectDetail.endDate).toLocaleDateString() : 'N/A'}
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} style={{ color: '#a855f7' }} /> Total Assigned Interns:
                </span>
                <strong style={{ color: '#34d399' }}>
                  {mergedAssignedList.length} Candidate(s)
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '8px 20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Applicants Cards Grid */}
      <div
        style={{
          background: 'rgba(8, 19, 48, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Assigned Student Interns ({mergedAssignedList.length})
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
            Click candidate card to open workspace
          </span>
        </div>

        {mergedAssignedList.length === 0 ? (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' }}>
            <Users size={28} style={{ color: '#38bdf8', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>No interns assigned yet</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Click "Manage All Role Assignments" above to assign selected candidates to this project.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {mergedAssignedList.map((item, idx) => {
              const appEmail = item.studentEmail || item.email;
              const matchedApp = appEmail ? appsByEmail.get(appEmail.trim().toLowerCase()) : undefined;
              const appName = item.name || matchedApp?.name || matchedApp?.studentName || appEmail;
              const roleTitle = item.role || item.task || 'Project Contributor';
              const taskDesc = item.description || (item.task !== roleTitle ? item.task : '');

              return (
                <div
                  key={appEmail || idx}
                  onClick={() => onSelectStudentProfile(item)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.2)',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '14px',
                          flexShrink: 0,
                        }}
                      >
                        {appName ? appName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appEmail}</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '8px', padding: '2px 8px', fontSize: '9px', fontWeight: 900, flexShrink: 0 }}>
                      ASSIGNED
                    </span>
                  </div>

                  <div style={{ background: 'rgba(5, 12, 30, 0.8)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8' }}>ROLE: {roleTitle}</div>
                    {taskDesc && (
                      <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '3px 0 0 0', lineHeight: 1.35 }}>
                        {taskDesc}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSingleEditModal(item);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit3 size={12} /> Edit Role
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCandidateTaskAssignment(appEmail);
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};