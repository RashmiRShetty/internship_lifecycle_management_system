import React from 'react';
import { Video } from 'lucide-react';
import { Modal, ModalHeader, FormField, PrimaryButton, SecondaryButton } from '../ui';

interface RequestMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: {
    title: string;
    description: string;
    startTime: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; startTime: string }>>;
  facultyEmail?: string;
  submitting?: boolean;
}

export const RequestMeetingModal: React.FC<RequestMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  facultyEmail,
  submitting = false,
}) => {
  if (!isOpen) return null;

  const minDateTime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title="Request a Meeting"
        sub={facultyEmail ? `Send a meeting request to ${facultyEmail}` : 'Propose a 1-on-1 meeting with your faculty supervisor'}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} className="p-6 space-y-4 font-sans text-slate-100">
        <FormField label="Meeting Title" required>
          <input
            type="text"
            required
            placeholder="e.g. Project Architecture Sync"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-semibold text-white bg-slate-900 focus:outline-none focus:border-cyan-400 transition placeholder-slate-500"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </FormField>

        <FormField label="Proposed Date & Time" required hint="Must be at least 30 minutes in advance">
          <input
            type="datetime-local"
            required
            min={minDateTime}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-semibold text-white bg-slate-900 focus:outline-none focus:border-cyan-400 transition"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
          />
        </FormField>

        <FormField label="Agenda / Topic Notes" hint="Briefly describe what you'd like to discuss">
          <textarea
            rows={3}
            placeholder="Describe any questions, blockers, or topics for discussion..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 text-xs font-medium text-white bg-slate-900 focus:outline-none focus:border-cyan-400 transition resize-y placeholder-slate-500"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={submitting}>
            <Video className="w-3.5 h-3.5" />
            {submitting ? 'Sending Request...' : 'Send Meeting Request'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

export default RequestMeetingModal;
