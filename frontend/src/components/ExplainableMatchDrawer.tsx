import React from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Target, Layers } from 'lucide-react';

export interface MatchBreakdownData {
  matchPercentage: number;
  recommendation: string;
  matchedRequirements: string[];
  missingRequirements: string[];
  requirements: string[];
  studentSkills?: string[];
  internshipSkills?: string[];
  preferredSkills?: string[];
  matchedPreferredSkills?: string[];
  missingPreferredSkills?: string[];
  bestMatchingSections?: Record<string, string>;
  similarityScores?: Record<string, number>;
  reason?: string;
  studentName?: string;
  internshipTitle?: string;
  aiEngine?: string;
}

interface ExplainableMatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: MatchBreakdownData | null;
}

export const ExplainableMatchDrawer: React.FC<ExplainableMatchDrawerProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  const pct = data.matchPercentage || 0;
  const badgeBg = pct >= 80 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    : pct >= 60 
    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
    : 'linear-gradient(135deg, #64748b 0%, #475569 100%)';

  const matchedCount = data.matchedRequirements?.length || 0;
  const missingCount = data.missingRequirements?.length || 0;
  const totalReqs = data.requirements?.length || (matchedCount + missingCount);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.2s ease'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          background: '#ffffff',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eef2ff', color: '#5b51ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
                Explainable AI Match
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                {data.internshipTitle ? `Position: ${data.internshipTitle}` : 'Skill & Requirement Analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: 'none',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Match Banner Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: '20px',
            padding: '22px 24px',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(49, 46, 129, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {data.studentName || 'Student Applicant'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', margin: '4px 0', letterSpacing: '-1px', lineHeight: 1.1 }}>
                {pct.toFixed(0)}% Match
              </div>
              <div style={{ fontSize: '12px', color: '#e0e7ff', marginTop: '6px', fontWeight: 500, lineHeight: 1.4 }}>
                {matchedCount} of {totalReqs} technical requirements matched.
              </div>
            </div>

            <div style={{
              background: badgeBg,
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 900,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {data.recommendation || 'Evaluated'}
            </div>
          </div>

          {/* Skills Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#7c3aed' }} />
                <span>Student Skills</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(data.studentSkills && data.studentSkills.length > 0) ? data.studentSkills.map((skill, idx) => (
                  <span
                    key={`student-skill-${idx}`}
                    style={{
                      background: '#f5f3ff',
                      color: '#5b21b6',
                      border: '1px solid #ddd6fe',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {skill}
                  </span>
                )) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No student skills provided.</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} style={{ color: '#2563eb' }} />
                <span>Required Skills</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(data.internshipSkills && data.internshipSkills.length > 0) ? data.internshipSkills.map((skill, idx) => (
                  <span
                    key={`internship-skill-${idx}`}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {skill}
                  </span>
                )) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No required skills provided.</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span>Preferred Skills</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(data.preferredSkills && data.preferredSkills.length > 0) ? data.preferredSkills.map((skill, idx) => (
                  <span
                    key={`preferred-skill-${idx}`}
                    style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {skill}
                  </span>
                )) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No preferred skills provided.</span>
                )}
              </div>
            </div>
          </div>

          {/* Matched Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#059669' }} />
              <span>Matched Requirements ({matchedCount})</span>
            </div>
            {matchedCount > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {data.matchedRequirements.map((req, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={13} style={{ color: '#059669' }} />
                    {req}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                No technical requirements matched yet.
              </p>
            )}
          </div>

          {/* Missing Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={16} style={{ color: missingCount > 0 ? '#dc2626' : '#059669' }} />
              <span>Missing Requirements ({missingCount})</span>
            </div>
            {missingCount > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {data.missingRequirements.map((req, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#fef2f2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <XCircle size={13} style={{ color: '#dc2626' }} />
                    {req}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Student satisfies 100% of extracted requirements!
              </div>
            )}
          </div>

          {/* Section Match Source Breakdown */}
          {data.bestMatchingSections && Object.keys(data.bestMatchingSections).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: '#5b51ef' }} />
                <span>Best Matching Profile Sections</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                {Object.entries(data.bestMatchingSections).map(([req, section], idx) => {
                  const score = data.similarityScores?.[req];
                  const isMatched = data.matchedRequirements.includes(req);
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '11px 16px', 
                        borderBottom: idx < Object.keys(data.bestMatchingSections!).length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={14} style={{ color: isMatched ? '#059669' : '#94a3b8' }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{req}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
                          {section}
                        </span>
                        {score !== undefined && (
                          <span style={{ fontSize: '12px', fontWeight: 900, color: isMatched ? '#059669' : '#64748b' }}>
                            {(score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 24px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
