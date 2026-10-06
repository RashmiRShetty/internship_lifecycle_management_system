import React from 'react';
import { Modal, ModalHeader, SecondaryButton, Pill } from '../ui';
import { toTitleCase } from '../../../utils/matchHelpers';

interface InternshipDetailModalProps {
  internship: any;
  matchResult?: any;
  onClose: () => void;
  onApply: () => void;
  isApplying?: boolean;
  isApplied?: boolean;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  matchResult,
  onClose,
  onApply,
  isApplying = false,
  isApplied = false,
}) => {
  if (!internship) return null;

  const matchedSkills: string[] = matchResult?.matchedSkills || [];
  const missingSkills: string[] = matchResult?.missingSkills || [];

  const isClosed = (() => {
    if (internship.status === 'CLOSED') return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (internship.applicationDeadline && new Date(internship.applicationDeadline) < today) return true;
    if (internship.startDate && new Date(internship.startDate) <= today) return true;
    return false;
  })();

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader
        title={toTitleCase(internship.title)}
        sub={`${internship.location || 'Location specified'} · ${internship.mode || 'Work mode'}`}
        onClose={onClose}
      />
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-sans text-slate-100">
        {/* Match score banner intentionally hidden from student view; faculty-only scoring remains in faculty modules */}
        {isClosed && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
            <span>🔴 Applications are closed for this role (Deadline passed or internship started)</span>
            <Pill color="red">Closed</Pill>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#06163d]/90 border border-sky-500/30 text-center">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-0.5">Type</div>
            <div className="text-xs font-black text-white">{internship.internshipType || 'Paid'}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#06163d]/90 border border-sky-500/30 text-center">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-0.5">Duration</div>
            <div className="text-xs font-black text-white">{internship.duration || 'Flexible'}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#06163d]/90 border border-sky-500/30 text-center">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-0.5">Stipend</div>
            <div className="text-xs font-black text-amber-400">{internship.stipend || 'Unpaid'}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#06163d]/90 border border-sky-500/30 text-center">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-0.5">Openings</div>
            <div className="text-xs font-black text-white">{internship.openings || '1'}</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">Description &amp; Responsibilities</h4>
          <div className="text-xs text-slate-300 leading-relaxed bg-[#06163d]/90 p-4 rounded-2xl border border-sky-500/30 whitespace-pre-wrap font-medium">
            {internship.description || 'No detailed description provided.'}
          </div>
        </div>

        {/* Eligibility */}
        {internship.eligibilityCriteria && (
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">Eligibility Criteria</h4>
            <div className="text-xs text-slate-300 leading-relaxed bg-[#06163d]/90 p-4 rounded-2xl border border-sky-500/30 font-medium">
              {internship.eligibilityCriteria}
            </div>
          </div>
        )}

        {/* Skills overlap */}
        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Skill Alignment Analysis</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedSkills.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30">
                  <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block mb-2">
                    ✓ Matched Skills ({matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#06163d] text-cyan-300 border border-cyan-500/30">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {missingSkills.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                  <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block mb-2">
                    ! Missing Skills ({missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#06163d] text-rose-300 border border-rose-500/30">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {internship.skillsRequired && (
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(internship.skillsRequired)
                ? internship.skillsRequired
                : String(internship.skillsRequired).split(',')
              ).map((sk: string) => {
                const clean = String(sk).trim();
                if (!clean) return null;
                return (
                  <span key={clean} className="px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 font-extrabold text-xs border border-cyan-500/30">
                    {clean}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {internship.skillsPreferred && (
          <div>
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">Preferred Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(internship.skillsPreferred)
                ? internship.skillsPreferred
                : String(internship.skillsPreferred).split(',')
              ).map((sk: string) => {
                const clean = String(sk).trim();
                if (!clean) return null;
                return (
                  <span key={clean} className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-400 font-extrabold text-xs border border-amber-500/30">
                    {clean}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 p-4 px-6 border-t border-sky-500/30 bg-[#0a1e4e]/90">
        <SecondaryButton onClick={onClose}>Close</SecondaryButton>
        <button
          onClick={() => {
            if (!isApplied && !isClosed) onApply();
          }}
          disabled={isApplied || isClosed || isApplying}
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-extrabold text-xs transition shadow-xs ${
            isApplied
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 cursor-not-allowed'
              : isClosed
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white shadow-lg shadow-cyan-500/20'
          }`}
        >
          {isApplied ? '✓ Application Submitted' : isClosed ? '🔴 Applications Closed' : isApplying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </Modal>
  );
};

export default InternshipDetailModal;
