import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReason: (reason: string) => void;
  studentName?: string;
}

const REJECTION_REASONS = [
  'We have decided to proceed with other candidates whose qualifications are more suitable for this role',
  'Required technical skills not matched',
  'Minimum percentage not achieved',
  'Profile incomplete',
  'Resume not uploaded',
  'Position already filled',
  'Other (Custom reason)'
];

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onSubmitReason,
  studentName = 'Student Applicant'
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other (Custom reason)' ? customReason.trim() : selectedReason;
    if (!finalReason) return;
    onSubmitReason(finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-900">Rejection Reason</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Please select a mandatory reason for declining <strong>{studentName}</strong>. This feedback will be displayed transparently on the student's dashboard.
        </p>

        {/* Reason Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {REJECTION_REASONS.map((reason, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                  selectedReason === reason
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                {reason}
              </label>
            ))}
          </div>

          {/* Custom Reason Textarea */}
          {selectedReason === 'Other (Custom reason)' && (
            <textarea
              required
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter specific feedback or rejection reason..."
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              rows={3}
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
