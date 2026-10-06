import React from 'react';
import { Clock } from 'lucide-react';

interface InternshipCardsGridProps {
  uniqueRoles: string[];
  applicationsByRole: Record<string, any[]>;
  postedInternships: any[];
  selectedRole: string | null;
  onSelectRole: (role: string | null) => void;
  statusFilter: 'ACTIVE' | 'END' | 'ALL';
  setStatusFilter?: (filter: 'ACTIVE' | 'END' | 'ALL') => void;
}

export const InternshipCardsGrid: React.FC<InternshipCardsGridProps> = ({
  uniqueRoles,
  applicationsByRole,
  postedInternships,
  selectedRole,
  onSelectRole,
  statusFilter,
}) => {
  const checkIsClosed = (role: string) => {
    const matched = postedInternships.find(
      (p) => (p.title || '').trim().toLowerCase() === role.trim().toLowerCase()
    );
    if (matched) {
      if (String(matched.status || '').toUpperCase() === 'CLOSED' || matched.isOpen === false) return true;
      if (matched.applicationDeadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(matched.applicationDeadline);
        if (typeof matched.applicationDeadline === 'string' && matched.applicationDeadline.includes('-')) {
          const parts = matched.applicationDeadline.split('T')[0].split('-');
          if (parts.length === 3) {
            deadlineDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            deadlineDate.setHours(23, 59, 59, 999);
          }
        }
        if (deadlineDate < today) return true;
      }
    }
    return false;
  };

  const getDeadlineText = (role: string) => {
    const matched = postedInternships.find(
      (p) => (p.title || '').trim().toLowerCase() === role.trim().toLowerCase()
    );
    if (matched?.applicationDeadline) {
      return new Date(matched.applicationDeadline).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return null;
  };

  const filteredRoles = uniqueRoles.filter((role) => {
    const isClosed = checkIsClosed(role);
    if (statusFilter === 'ACTIVE') return !isClosed;
    if (statusFilter === 'END') return isClosed;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {filteredRoles.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#081330', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
          No internships match the selected filter ({statusFilter}).
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredRoles.map((role) => {
            const roleApps = applicationsByRole[role] || [];
            const isSelected = selectedRole === role;
            const isClosed = checkIsClosed(role);
            const deadlineText = getDeadlineText(role);

            const selectedCount = roleApps.filter(
              (a) => (a.status || '').toUpperCase() === 'SELECTED'
            ).length;
            const normalizeRole = (value: unknown) =>
              String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
            const normalizedRole = normalizeRole(role);
            const postedInternship = postedInternships.find((internship) =>
              normalizeRole(internship.title || internship.internshipTitle) === normalizedRole
            );
            const openingValue = Number(postedInternship?.openings ?? roleApps[0]?.openings ?? roleApps[0]?.postedInternship?.openings ?? 1);
            const totalOpenings = Number.isFinite(openingValue) ? Math.max(0, openingValue) : 1;
            const pendingOpenings = Math.max(0, totalOpenings - selectedCount);
            const overCapacity = Math.max(0, selectedCount - totalOpenings);
            const pendingCount = roleApps.filter((a) => {
              const st = (a.status || '').toUpperCase();
              return st === 'APPLIED' || st === 'UNDER_REVIEW' || st === 'SHORTLISTED' || st === 'INTERVIEW';
            }).length;

            const roleInitial = role ? role.charAt(0).toUpperCase() : 'I';

            return (
              <div
                key={role}
                onClick={() => onSelectRole(isSelected ? null : role)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(180deg, #0e1e48 0%, #081330 100%)'
                    : '#081330',
                  border: isSelected
                    ? '2px solid #38bdf8'
                    : isClosed
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  padding: '24px',
                  minHeight: '310px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected
                    ? '0 12px 28px -4px rgba(56, 189, 248, 0.25)'
                    : '0 4px 20px -2px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Header Row: Icon Avatar, Role Title, Deadline & Status Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: isSelected
                          ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                          : isClosed
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          : 'linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '18px',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)',
                      }}
                    >
                      {roleInitial}
                    </div>

                    <span
                      style={{
                        background: isClosed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isClosed ? '#f87171' : '#34d399',
                        border: isClosed ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isClosed ? (
                        '🔴 Closed'
                      ) : (
                        <>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#34d399',
                            }}
                          />
                          Active
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1.3,
                        letterSpacing: '-0.2px',
                      }}
                    >
                      {role}
                    </h4>
                    {deadlineText && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: isClosed ? '#f87171' : '#94a3b8',
                          fontWeight: 600,
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Clock size={12} /> Deadline: {deadlineText}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Metric Panel */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '8px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '12px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#38bdf8' }}>
                      {roleApps.length}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>
                      Total
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#34d399' }}>
                      {selectedCount}
                    </div>
                    <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 700, marginTop: '2px' }}>
                      Accepted
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#fbbf24' }}>
                      {pendingCount}
                    </div>
                    <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 700, marginTop: '2px' }}>
                      Pending
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: overCapacity > 0 ? '#fb7185' : '#a3e635' }}>
                      {pendingOpenings}
                    </div>
                    <div style={{ fontSize: '10px', color: overCapacity > 0 ? '#fb7185' : '#a3e635', fontWeight: 700, marginTop: '2px' }}>
                      Openings left
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isSelected ? '#38bdf8' : '#94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected ? '✓ Role Selected' : 'View Applicants'} →
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {roleApps.length} Apps
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
