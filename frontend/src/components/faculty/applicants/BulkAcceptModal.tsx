import React from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

interface BulkAcceptModalProps {
  show: boolean;
  onClose: () => void;
  selectedRole: string | null;
  bulkThreshold: number;
  setBulkThreshold: (val: number) => void;
  bulkRejectionReason: string;
  setBulkRejectionReason: (val: string) => void;
  bulkProcessing: boolean;
  eligibleAcceptCount: number;
  eligibleRejectCount: number;
  onConfirm: () => void;
}

export const BulkAcceptModal: React.FC<BulkAcceptModalProps> = ({
  show,
  onClose,
  selectedRole,
  bulkThreshold,
  setBulkThreshold,
  bulkRejectionReason,
  setBulkRejectionReason,
  bulkProcessing,
  eligibleAcceptCount,
  eligibleRejectCount,
  onConfirm,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(6px)',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '22px',
          overflow: 'hidden',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
                AI Match Bulk Shortlist
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>
                Role: <strong style={{ color: '#4f46e5' }}>{selectedRole || 'All Roles'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Threshold Slider Row */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Match Threshold
              </span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#16a34a', background: '#dcfce7', padding: '2px 10px', borderRadius: '8px' }}>
                ≥ {bulkThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={95}
              step={5}
              value={bulkThreshold}
              onChange={(e) => setBulkThreshold(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#16a34a', cursor: 'pointer', height: '6px' }}
            />
          </div>

          {/* Accept / Reject Split Metric Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d' }}>{eligibleAcceptCount}</div>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 800, marginTop: '2px' }}>Will SHORTLIST (≥ {bulkThreshold}%)</div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626' }}>{eligibleRejectCount}</div>
              <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 800, marginTop: '2px' }}>Will REJECT (&lt; {bulkThreshold}%)</div>
            </div>
          </div>

          {/* Rejection Reason Text Area */}
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              Auto-Rejection Reason
            </label>
            <textarea
              rows={3}
              value={bulkRejectionReason}
              onChange={(e) => setBulkRejectionReason(e.target.value)}
              placeholder="Thank you for your application. We have decided to proceed with other candidates whose qualifications are more suitable for this role..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                background: '#ffffff',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '14px 22px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={bulkProcessing || (eligibleAcceptCount === 0 && eligibleRejectCount === 0)}
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              opacity: bulkProcessing || (eligibleAcceptCount === 0 && eligibleRejectCount === 0) ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={15} />{' '}
            {bulkProcessing
              ? 'Processing...'
              : `Confirm (${eligibleAcceptCount} Shortlist, ${eligibleRejectCount} Reject)`}
          </button>
        </div>
      </div>
    </div>
  );
};
