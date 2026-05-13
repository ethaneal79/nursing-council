import React, { useState, useEffect, useCallback  } from 'react';
import { COLORS } from '../styles/theme';
import { registrarGetApplications, registrarApprove, registrarReject, registrarComplete } from '../services/api';

const STATUS_COLORS = {
  SUBMITTED: { bg: COLORS.warningBg, color: COLORS.warning },
  DOCUMENTS_VERIFIED: { bg: '#e3f9f5', color: '#0b7a6a' },
  COUNCIL_REVIEW: { bg: '#e8eaf6', color: '#3949ab' },
  COMPLETED: { bg: COLORS.successBg, color: COLORS.success },
  REJECTED: { bg: COLORS.dangerBg, color: COLORS.danger },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || {};
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, fontSize: 11, padding: '2px 8px', fontWeight: 600 }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default function RegistrarPage({ token }) {
  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject' | 'complete'
  const [rejectReason, setRejectReason] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);



const loadApps = useCallback(async () => {
  try {
    const res = await registrarGetApplications(token);

    console.log("REGISTRAR APPS:", res);

    setApps(res?.data || []);
  } catch (e) {
    setMsg({ type: 'error', text: e.message });
  }
}, [token]);

  useEffect(() => {
  loadApps();
}, [loadApps]);

  async function handleAction(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      if (action === 'approve') {
        await registrarApprove(token, selected.referenceNumber, { adminNotes: notes });
        setMsg({ type: 'success', text: `Application ${selected.referenceNumber} sent for council approval.` });
      } else if (action === 'reject') {
        await registrarReject(token, selected.referenceNumber, { rejectionReason: rejectReason, adminNotes: notes });
        setMsg({ type: 'success', text: `Application ${selected.referenceNumber} rejected.` });
      } else if (action === 'complete') {
        await registrarComplete(token, selected.referenceNumber);
        setMsg({ type: 'success', text: `Application ${selected.referenceNumber} marked as completed.` });
      }
      closeModal();
      loadApps();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setLoading(false);
  }

  function openModal(app, act) {
    setSelected(app); setAction(act);
    setRejectReason(''); setNotes('');
  }

  function closeModal() { setSelected(null); setAction(null); }

  const actionLabels = {
    approve: { label: 'Send for Approval', color: '#3949ab', emoji: '📤' },
    reject:  { label: 'Reject Application', color: COLORS.danger, emoji: '✗' },
    complete: { label: 'Mark as Completed', color: COLORS.success, emoji: '✓' },
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h2 style={{ color: COLORS.primary, fontFamily: 'EB Garamond', fontSize: 26, marginBottom: 6 }}>
        Registrar Dashboard
      </h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24, fontSize: 14 }}>
        Review verified applications — send for approval or reject
      </p>

      {msg && (
        <div style={{
          background: msg.type === 'success' ? COLORS.successBg : COLORS.dangerBg,
          color: msg.type === 'success' ? COLORS.success : COLORS.danger,
          border: `1px solid ${msg.type === 'success' ? COLORS.success : COLORS.danger}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14
        }}>{msg.text}</div>
      )}

      {/* Workflow legend */}
      <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13 }}>
        <span style={{ color: COLORS.textMuted }}>Workflow:</span>
        {['SUBMITTED', '→ DA verifies →', 'DOCUMENTS_VERIFIED', '→ Registrar →', 'COUNCIL_REVIEW', '→ Complete →', 'COMPLETED'].map((s, i) => (
          <span key={i} style={{ color: s.startsWith('→') ? COLORS.textMuted : (STATUS_COLORS[s]?.color || COLORS.text), fontWeight: s.startsWith('→') ? 400 : 600 }}>
            {s.startsWith('→') ? s : s.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {/* Action modal */}
      {selected && action && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 440, maxWidth: '95vw' }}>
            <h3 style={{ marginBottom: 4, color: actionLabels[action].color }}>
              {actionLabels[action].emoji} {actionLabels[action].label}
            </h3>
            <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 20 }}>
              Ref: <strong>{selected.referenceNumber}</strong> — {selected.applicantName}
            </p>
            <form onSubmit={handleAction}>
              {action === 'reject' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Rejection Reason *</label>
                  <textarea required rows={3} value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                    placeholder="State the reason for rejection..."
                  />
                </div>
              )}
              {action !== 'complete' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                  <textarea rows={2} value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                    placeholder="Internal notes..."
                  />
                </div>
              )}
              {action === 'complete' && (
                <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>
                  This will mark the application as completed and the certificate will be issued.
                </p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={closeModal} style={{
                  flex: 1, padding: 10, border: `1px solid ${COLORS.border}`, borderRadius: 8,
                  background: '#fff', cursor: 'pointer', fontWeight: 600
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: 10, background: actionLabels[action].color, color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
                }}>{loading ? 'Processing...' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications table */}
      <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 14 }}>
        {apps.length} application{apps.length !== 1 ? 's' : ''} pending review
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <thead>
          <tr style={{ background: COLORS.lightGray }}>
            {['Ref No.', 'Applicant', 'Type', 'Submitted', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apps.map((a, i) => (
            <tr key={a.referenceNumber} style={{ borderTop: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
              <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{a.referenceNumber}</td>
              <td style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.applicantName}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{a.applicantEmail}</div>
              </td>
              <td style={{ padding: '10px 14px', fontSize: 13 }}>{a.applicationType?.replace('_', ' ')}</td>
              <td style={{ padding: '10px 14px', fontSize: 12, color: COLORS.textMuted }}>
                {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}
              </td>
              <td style={{ padding: '10px 14px' }}><StatusBadge status={a.status} /></td>
              <td style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {a.status === 'DOCUMENTS_VERIFIED' && (
                    <>
                      <button onClick={() => openModal(a, 'approve')} style={{
                        padding: '5px 12px', background: '#3949ab', color: '#fff',
                        border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
                      }}>Approve</button>
                      <button onClick={() => openModal(a, 'reject')} style={{
                        padding: '5px 12px', background: COLORS.dangerBg, color: COLORS.danger,
                        border: `1px solid ${COLORS.danger}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
                      }}>Reject</button>
                    </>
                  )}
                  {a.status === 'COUNCIL_REVIEW' && (
                    <button onClick={() => openModal(a, 'complete')} style={{
                      padding: '5px 12px', background: COLORS.successBg, color: COLORS.success,
                      border: `1px solid ${COLORS.success}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
                    }}>Mark Complete</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {apps.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: COLORS.textMuted }}>
              No applications pending review
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
