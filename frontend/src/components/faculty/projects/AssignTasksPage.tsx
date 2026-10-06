import React from 'react';
import { ArrowLeft, Save, Briefcase, FileText } from 'lucide-react';
import { isApplicantAssignableToProject } from '../../../utils/projectAssignmentUtils';

interface AssignTasksPageProps {
  activeProjectDetail: any;
  facultyApplications: any[];
  roleInputs: Record<string, string>;
  setRoleInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  taskInputs: Record<string, string>;
  setTaskInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBack: () => void;
  onSaveTaskAssignments: () => void;
}

export const AssignTasksPage: React.FC<AssignTasksPageProps> = ({
  activeProjectDetail,
  facultyApplications,
  roleInputs,
  setRoleInputs,
  taskInputs,
  setTaskInputs,
  onBack,
  onSaveTaskAssignments,
}) => {
  const seenEmails = new Set<string>();
  const roleFilteredApps = facultyApplications.filter((app: any) => {
    if (!isApplicantAssignableToProject(app, activeProjectDetail)) return false;

    const studentEmail = (app.studentEmail || app.email || '').trim().toLowerCase();
    if (studentEmail) {
      if (seenEmails.has(studentEmail)) return false;
      seenEmails.add(studentEmail);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Action Header */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
            }}
          >
            <ArrowLeft size={16} /> Back to Project Details
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Manage Candidate Roles &amp; Task Assignments
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: 500 }}>
            Project: <strong style={{ color: '#38bdf8' }}>"{activeProjectDetail.name}"</strong> • Linked Internship:{' '}
            <strong style={{ color: '#ffffff' }}>{activeProjectDetail.internshipTitle || 'General Project'}</strong>
          </p>
        </div>

        <button
          onClick={onSaveTaskAssignments}
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
          }}
        >
          <Save size={18} /> Save &amp; Send Notification Emails
        </button>
      </div>

      {/* Candidate Task Table View */}
      <div
        style={{
          background: 'rgba(8, 19, 48, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {roleFilteredApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              No accepted applicants found for "{activeProjectDetail.internshipTitle || 'All Roles'}"
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Please select applicants in the Applicants tab first.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(5, 12, 30, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', fontWeight: 800 }}>
                  <th style={{ padding: '14px 16px' }}>ACCEPTED CANDIDATE</th>
                  <th style={{ padding: '14px 16px' }}>ASSIGNED ROLE TITLE</th>
                  <th style={{ padding: '14px 16px' }}>MODULE RESPONSIBILITIES</th>
                </tr>
              </thead>
              <tbody>
                {roleFilteredApps.map((app: any) => {
                  const studentEmail = app.studentEmail || app.email;
                  const key = `${activeProjectDetail.id}_${studentEmail}`;
                  const assignedItem = activeProjectDetail.assignedApplicants?.find(
                    (a: any) => (a.studentEmail || a.email) === studentEmail
                  );
                  const currentRole = roleInputs[key] !== undefined ? roleInputs[key] : (assignedItem?.role || app.role || '');
                  const currentTask = taskInputs[key] !== undefined ? taskInputs[key] : (assignedItem?.task || assignedItem?.description || app.task || '');

                  return (
                    <tr key={app.id || studentEmail} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 800, color: '#ffffff' }}>{app.name || studentEmail}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{studentEmail}</div>
                      </td>
                      <td style={{ padding: '16px', minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Briefcase size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                          <input
                            type="text"
                            value={currentRole}
                            onChange={(e) => setRoleInputs({ ...roleInputs, [key]: e.target.value })}
                            placeholder="e.g. Frontend Lead, QA"
                            style={{
                              width: '100%',
                              height: '40px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#ffffff',
                              outline: 'none',
                              background: '#050c1e',
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '16px', minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <input
                            type="text"
                            value={currentTask}
                            onChange={(e) => setTaskInputs({ ...taskInputs, [key]: e.target.value })}
                            placeholder="Describe module task responsibility..."
                            style={{
                              width: '100%',
                              height: '40px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#ffffff',
                              outline: 'none',
                              background: '#050c1e',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
