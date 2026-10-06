import React, { useState } from 'react';
import { PlusCircle, Briefcase, Calendar, Trash2, Edit3, Users } from 'lucide-react';

interface ProjectListPageProps {
  projects: any[];
  onSelectProject: (proj: any) => void;
  onCreateProjectClick: () => void;
  onEditProjectClick: (proj: any) => void;
  onDeleteProjectClick: (proj: any) => void;
}

export const isProjectActive = (p: any): boolean => {
  if (!p) return false;
  if (p.status === 'COMPLETED' || p.status === 'CLOSED' || p.isCompleted === true) {
    return false;
  }
  const endDateStr = p.endDate || p.internshipEndDate || p.internship?.endDate;
  if (endDateStr) {
    const endDate = new Date(endDateStr);
    if (!isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
      if (new Date() > endDate) {
        return false; // Internship end date passed -> project is no longer active
      }
    }
  }
  return true;
};

export const ProjectListPage: React.FC<ProjectListPageProps> = ({
  projects,
  onSelectProject,
  onCreateProjectClick,
  onEditProjectClick,
  onDeleteProjectClick,
}) => {
  const [filter, setFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  const filteredProjects = projects.filter((p) => {
    const active = isProjectActive(p);
    if (filter === 'ACTIVE') return active;
    if (filter === 'COMPLETED') return !active;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '14px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Project Management
            <span
              style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '12px',
                padding: '2px 10px',
                fontSize: '11px',
                fontWeight: 900,
              }}
            >
              {projects.length} Projects
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
            Click on any project to view & assign selected applicants for that internship.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Filters */}
          <div
            style={{
              background: 'rgba(11, 15, 25, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '3px',
              display: 'flex',
              gap: '3px',
            }}
          >
            {(['ACTIVE', 'COMPLETED', 'ALL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(245, 158, 11, 0.3)' : 'transparent',
                  color: filter === f ? '#ffffff' : '#94a3b8',
                  border: filter === f ? '1px solid rgba(168, 85, 247, 0.5)' : 'none',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: filter === f ? 800 : 600,
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={onCreateProjectClick}
            style={{
              background: 'linear-gradient(135deg, #5b51ef 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(91, 81, 239, 0.25)',
            }}
          >
            <PlusCircle size={15} /> + Create Project
          </button>
        </div>
      </div>

      {/* Projects Grid View */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <Briefcase size={32} style={{ color: '#94a3b8', margin: '0 auto 10px auto' }} />
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>No projects found</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Click "+ Create Project" to add a new project.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '14px',
          }}
        >
          {filteredProjects.map((proj) => {
            const assignedCount = proj.assignedApplicants?.length || 0;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.3 }}>
                        {proj.name}
                      </h3>
                      {proj.internshipTitle && proj.internshipTitle !== 'General Internship Project' && proj.internshipTitle !== 'undefined' && (
                        <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 800 }}>
                          {proj.internshipTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProjectClick(proj);
                      }}
                      style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '6px',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                      title="Edit Project"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProjectClick(proj);
                      }}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {proj.description && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      margin: 0,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {proj.description}
                  </p>
                )}

                <div
                  style={{
                    background: 'rgba(11, 15, 25, 0.9)',
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '10px',
                    color: '#475569',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} style={{ color: '#fbbf24' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>
                        {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Start Date</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} style={{ color: '#059669' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>End Date</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#15803d' }}>
                    <Users size={14} />
                    <span>{assignedCount} Assigned</span>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>
                    View Workspace →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
