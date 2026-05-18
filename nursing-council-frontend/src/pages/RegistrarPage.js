import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../styles/theme';
import {
  registrarGetApplications,
  registrarApprove,
  registrarReject,
  registrarComplete,
} from '../services/api';

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  SUBMITTED:          { bg: '#fff8e1', color: '#b45309', label: 'Submitted',      dot: '#f59e0b' },
  DOCUMENTS_VERIFIED: { bg: '#ecfdf5', color: '#065f46', label: 'Docs Verified',  dot: '#059669' },
  COUNCIL_REVIEW:     { bg: '#ede9fe', color: '#4c1d95', label: 'Council Review', dot: '#7c3aed' },
  COMPLETED:          { bg: '#dbeafe', color: '#1e40af', label: 'Completed',       dot: '#2563eb' },
  REJECTED:           { bg: '#fef2f2', color: '#991b1b', label: 'Rejected',        dot: '#dc2626' },
};

const PIPELINE_STEPS = [
  { key: 'SUBMITTED',          label: 'Submitted',    icon: '📨', who: 'Applicant' },
  { key: 'DOCUMENTS_VERIFIED', label: 'Docs Verified', icon: '✅', who: 'DA' },
  { key: 'COUNCIL_REVIEW',     label: 'Council',      icon: '🏛',  who: 'Registrar' },
  { key: 'COMPLETED',          label: 'Completed',    icon: '🎓', who: 'Registrar' },
];

const fmt   = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTs = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── helpers ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { bg: '#f3f4f6', color: '#374151', label: status, dot: '#9ca3af' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: m.bg, color: m.color,
      borderRadius: 999, fontSize: 11, padding: '4px 12px', fontWeight: 700,
      letterSpacing: 0.4, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

function PipelineBar({ status }) {
  const currentIdx = PIPELINE_STEPS.findIndex(s => s.key === status);
  const rejected   = status === 'REJECTED';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%' }}>
      {PIPELINE_STEPS.map((step, i) => {
        const done    = !rejected && i <= currentIdx;
        const current = !rejected && i === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: done ? (current ? COLORS.primary : '#bbf7d0') : '#f1f5f9',
                color: done ? (current ? '#fff' : '#065f46') : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14,
                border: current ? `3px solid ${COLORS.primary}` : done ? '2px solid #86efac' : '2px solid #e2e8f0',
                boxShadow: current ? `0 0 0 5px rgba(30,64,175,0.12)` : 'none',
                transition: 'all 0.2s',
              }}>
                {done && !current ? '✓' : step.icon}
              </div>
              <span style={{
                fontSize: 9, marginTop: 5, fontWeight: current ? 800 : 500,
                color: done ? (current ? COLORS.primary : '#374151') : '#9ca3af',
                textAlign: 'center', lineHeight: 1.2,
              }}>{step.label}</span>
              <span style={{ fontSize: 8, color: '#94a3b8', marginTop: 1 }}>{step.who}</span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{
                height: 2, flex: 1, marginTop: 19,
                background: done && i < currentIdx ? 'linear-gradient(90deg, #86efac, #4ade80)' : '#e2e8f0',
                borderRadius: 1,
              }} />
            )}
          </React.Fragment>
        );
      })}
      {rejected && (
        <div style={{ marginLeft: 16, marginTop: 8 }}>
          <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 20,
            fontSize: 10, padding: '3px 10px', fontWeight: 700 }}>REJECTED</span>
        </div>
      )}
    </div>
  );
}

// ─── Applicant Modal (centered) ───────────────────────────────────────────────

function ApplicantModal({ app, token, onClose, onDone }) {
  const [action,  setAction]  = useState(null);
  const [reason,  setReason]  = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState(null);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!app) return null;

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      if (action === 'approve') {
        await registrarApprove(token, app.referenceNumber, { adminNotes: notes });
      } else if (action === 'reject') {
        await registrarReject(token, app.referenceNumber, { rejectionReason: reason, adminNotes: notes });
      } else if (action === 'complete') {
        await registrarComplete(token, app.referenceNumber);
      }
      onDone(`Application ${app.referenceNumber} updated successfully.`);
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  const InfoChip = ({ icon, label, value, mono, highlight }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '10px 14px', background: highlight ? '#f0f9ff' : '#f8fafc',
      borderRadius: 10, border: `1px solid ${highlight ? '#bae6fd' : '#e2e8f0'}`,
    }}>
      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {icon} {label}
      </span>
      <span style={{
        fontSize: 13, color: highlight ? '#0369a1' : '#0f172a', fontWeight: 700,
        fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all',
      }}>
        {value || '—'}
      </span>
    </div>
  );

  const actionConfig = {
    approve:  { label: '📤 Send for Council Approval', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
    reject:   { label: '✗ Reject Application',         color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    complete: { label: '✓ Mark as Completed — Certificate will be issued', color: '#059669', bg: '#ecfdf5', border: '#86efac' },
  };

  const headerGradient = {
    DOCUMENTS_VERIFIED: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #4c1d95 100%)',
    COUNCIL_REVIEW:     'linear-gradient(135deg, #0f172a 0%, #2e1065 60%, #7c3aed 100%)',
    COMPLETED:          'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)',
    REJECTED:           'linear-gradient(135deg, #0f172a 0%, #450a0a 60%, #991b1b 100%)',
    SUBMITTED:          'linear-gradient(135deg, #0f172a 0%, #1c1917 60%, #92400e 100%)',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform: translateY(28px) scale(0.97) } to { opacity:1; transform: translateY(0) scale(1) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24,
          width: '100%', maxWidth: 820,
          maxHeight: '93vh', overflowY: 'auto',
          boxShadow: '0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.24s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* header */}
        <div style={{
          padding: '28px 32px 26px',
          background: headerGradient[app.status] || headerGradient.SUBMITTED,
          borderRadius: '24px 24px 0 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180,
            borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', bottom:-30, left:80, width:120, height:120,
            borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />

          <button onClick={onClose} style={{
            position: 'absolute', top: 18, right: 18,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', borderRadius: '50%', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer',
          }}>×</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
            <div style={{
              width: 66, height: 66, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 27, fontWeight: 900, color: '#fff', flexShrink: 0,
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
            }}>
              {(app.applicantName || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 }}>
                Registrar · Application Review
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                {app.applicantName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                <code style={{ fontSize: 12, color: '#c4b5fd' }}>{app.referenceNumber}</code>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <StatusBadge status={app.status} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px' }}>
            <PipelineBar status={app.status} />
          </div>
        </div>

        {/* body */}
        <div style={{ padding: '28px 32px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                👤 Applicant
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InfoChip icon="📛" label="Full Name"      value={app.applicantName} />
                <InfoChip icon="📧" label="Email"          value={app.applicantEmail} />
                <InfoChip icon="📱" label="Mobile"         value={app.applicantMobile} />
                <InfoChip icon="🪪" label="Reg. No."       value={app.registrationNumber} mono highlight />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                📄 Application
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InfoChip icon="🗂"  label="Type"          value={app.applicationType?.replace(/_/g, ' ')} />
                <InfoChip icon="🎓"  label="Course"        value={app.courseType?.replace(/_/g, ' ')} />
                <InfoChip icon="📅"  label="Submitted"     value={fmtTs(app.submittedAt)} />
                <InfoChip icon="🔄"  label="Last Updated"  value={fmtTs(app.lastUpdatedAt)} />
              </div>
            </div>
          </div>

          {app.rejectionReason && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
              border: '1px solid #fecaca', borderLeft: '4px solid #dc2626',
              borderRadius: 14, padding: '16px 20px', marginBottom: 22,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                ✗ Rejection Reason
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', lineHeight: 1.7 }}>{app.rejectionReason}</p>
            </div>
          )}

          {/* DOCUMENTS_VERIFIED actions */}
          {app.status === 'DOCUMENTS_VERIFIED' && (
            <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#374151',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                ⚡ Registrar Decision
              </div>
              {!action ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setAction('approve')} style={{
                    flex: 1, padding: '16px 0',
                    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed',
                    border: '2px solid #c4b5fd', borderRadius: 12, fontWeight: 800,
                    fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.15)',
                  }}>📤 Send for Council Approval</button>
                  <button onClick={() => setAction('reject')} style={{
                    flex: 1, padding: '16px 0',
                    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', color: '#dc2626',
                    border: '2px solid #fecaca', borderRadius: 12, fontWeight: 800,
                    fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220,38,38,0.12)',
                  }}>✗ Reject Application</button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div style={{
                    background: actionConfig[action].bg,
                    border: `1px solid ${actionConfig[action].border}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 16,
                    color: actionConfig[action].color, fontWeight: 800, fontSize: 13,
                  }}>{actionConfig[action].label}</div>

                  {action === 'reject' && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, display: 'block',
                        marginBottom: 6, color: '#374151' }}>
                        Rejection Reason <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <textarea required rows={3} value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="State the reason for rejection…"
                        style={{ width: '100%', padding: '10px 13px',
                          border: '1px solid #fecaca', background: '#fff',
                          borderRadius: 10, fontSize: 13, resize: 'vertical',
                          boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', lineHeight: 1.6 }} />
                    </div>
                  )}
                  {action !== 'complete' && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, display: 'block',
                        marginBottom: 6, color: '#374151' }}>
                        Internal Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                      </label>
                      <textarea rows={2} value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Internal notes…"
                        style={{ width: '100%', padding: '10px 13px',
                          border: '1px solid #e2e8f0', background: '#fff',
                          borderRadius: 10, fontSize: 13, resize: 'vertical',
                          boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', lineHeight: 1.6 }} />
                    </div>
                  )}
                  {err && (
                    <div style={{ background: '#fef2f2', color: '#dc2626',
                      border: '1px solid #fecaca', borderRadius: 10,
                      padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{err}</div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => { setAction(null); setErr(null); }} style={{
                      flex: 1, padding: '13px 0', border: '1px solid #e2e8f0',
                      borderRadius: 12, background: '#fff', cursor: 'pointer',
                      fontWeight: 700, fontSize: 14, color: '#374151',
                    }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{
                      flex: 2, padding: '13px 0',
                      background: action === 'reject'
                        ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                        : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      color: '#fff', border: 'none', borderRadius: 12,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 800, fontSize: 14, opacity: loading ? 0.75 : 1,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }}>{loading ? 'Processing…' : 'Confirm'}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* COUNCIL_REVIEW actions */}
          {app.status === 'COUNCIL_REVIEW' && (
            <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#374151',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                ⚡ Registrar Decision
              </div>
              <form onSubmit={submit}>
                {action !== 'complete' && (
                  <button type="button" onClick={() => setAction('complete')} style={{
                    width: '100%', padding: '16px 0',
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#059669',
                    border: '2px solid #86efac', borderRadius: 12, fontWeight: 800,
                    fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5,150,105,0.15)',
                  }}>✓ Mark as Completed</button>
                )}
                {action === 'complete' && (
                  <>
                    <div style={{ background: '#ecfdf5', border: '1px solid #86efac',
                      borderRadius: 12, padding: '12px 16px', marginBottom: 14,
                      color: '#059669', fontWeight: 800, fontSize: 13 }}>
                      ✓ Mark as Completed — Certificate will be issued
                    </div>
                    {err && (
                      <div style={{ background: '#fef2f2', color: '#dc2626',
                        border: '1px solid #fecaca', borderRadius: 10,
                        padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{err}</div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => { setAction(null); setErr(null); }} style={{
                        flex: 1, padding: '13px 0', border: '1px solid #e2e8f0',
                        borderRadius: 12, background: '#fff', cursor: 'pointer',
                        fontWeight: 700, fontSize: 14, color: '#374151',
                      }}>Cancel</button>
                      <button type="submit" disabled={loading} style={{
                        flex: 2, padding: '13px 0',
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        color: '#fff', border: 'none', borderRadius: 12,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 800, fontSize: 14, opacity: loading ? 0.75 : 1,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                      }}>{loading ? 'Processing…' : '✓ Confirm Completion'}</button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          {/* Read-only states */}
          {['COMPLETED', 'REJECTED', 'SUBMITTED'].includes(app.status) && (
            <div style={{ background: '#f8fafc', borderRadius: 14, padding: '20px 22px',
              fontSize: 13, color: '#64748b', textAlign: 'center',
              border: '1px dashed #cbd5e1', lineHeight: 1.7 }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>
                {app.status === 'COMPLETED' ? '🎓' : app.status === 'REJECTED' ? '✗' : '⏳'}
              </div>
              {app.status === 'SUBMITTED'
                ? 'This application is waiting for the Dealing Assistant to verify documents first.'
                : 'This application has been finalised and requires no further action.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      flex: 1, minWidth: 130, background: '#fff',
      border: '1px solid #e5e7eb', borderTop: `3px solid ${color}`,
      borderRadius: 14, padding: '16px 18px',
    }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function RegistrarPage({ token }) {
  const [apps, setApps]         = useState([]);
  const [modal, setModal]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [msg, setMsg]           = useState(null);
  const [loading, setLoading]   = useState(false);

const loadApps = useCallback(async () => {
  setLoading(true);

  try {
    const res = await registrarGetApplications(token);

    console.log("REGISTRAR API:", res);

    setApps(Array.isArray(res) ? res : res.data || []);

  } catch (e) {
    setMsg({ type: 'error', text: e.message });
    setApps([]);
  }

  setLoading(false);
}, [token]);

  useEffect(() => { loadApps(); }, [loadApps]);

  const counts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.referenceNumber?.toLowerCase().includes(q) ||
      a.applicantName?.toLowerCase().includes(q) ||
      a.applicantMobile?.includes(q) ||
      a.applicantEmail?.toLowerCase().includes(q);
    return matchSearch && (!filterStatus || a.status === filterStatus);
  });

  function onModalDone(successMsg) {
    setModal(null);
    setMsg({ type: 'success', text: successMsg });
    loadApps();
  }

  const TH = ['Ref No.', 'Applicant', 'Type', 'Course', 'Submitted', 'Status', 'Actions'];

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 20px' }}>
      <h2 style={{ color: COLORS.primary, fontFamily: 'EB Garamond', fontSize: 26, marginBottom: 4 }}>
        Registrar Dashboard
      </h2>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        Review DA-verified applications — send for council approval, reject, or complete
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Total"          value={apps.length}                       color="#111827" icon="📊" />
        <StatCard label="Docs Verified"  value={counts['DOCUMENTS_VERIFIED'] || 0} color="#059669" icon="✅" />
        <StatCard label="Council Review" value={counts['COUNCIL_REVIEW'] || 0}     color="#7c3aed" icon="🏛" />
        <StatCard label="Completed"      value={counts['COMPLETED'] || 0}           color="#2563eb" icon="🎓" />
        <StatCard label="Rejected"       value={counts['REJECTED'] || 0}            color="#dc2626" icon="✗" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '12px 20px', marginBottom: 24, display: 'flex',
        alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ color: '#9ca3af', fontWeight: 600 }}>Workflow:</span>
        {['SUBMITTED','→','DOCUMENTS_VERIFIED','→','COUNCIL_REVIEW','→','COMPLETED'].map((s, i) => (
          <span key={i} style={{
            color: s === '→' ? '#d1d5db' : (STATUS_META[s]?.color || '#374151'),
            fontWeight: s === '→' ? 400 : 700,
          }}>
            {s === '→' ? s : (STATUS_META[s]?.label || s)}
          </span>
        ))}
      </div>

      {msg && (
        <div style={{
          background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color:      msg.type === 'success' ? '#059669' : '#dc2626',
          border: `1px solid ${msg.type === 'success' ? '#6ee7b7' : '#fecaca'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {msg.text}
          <button onClick={() => setMsg(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit',
          }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          placeholder="Search by name, ref no., mobile…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '8px 14px',
            border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb',
            borderRadius: 8, fontSize: 13, color: '#374151' }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 14 }}>
        {loading ? 'Loading…' : `${filtered.length} application${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff',
          borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {TH.map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left',
                  fontSize: 11, fontWeight: 700, color: '#6b7280',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.referenceNumber} onClick={() => setModal(a)}
                style={{ borderTop: '1px solid #f3f4f6',
                  background: i % 2 === 0 ? '#fff' : '#fafbfd',
                  cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfd'}
              >
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700,
                  fontFamily: 'monospace', color: COLORS.primary }}>{a.referenceNumber}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{a.applicantName}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.applicantEmail}</div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{a.applicationType?.replace(/_/g, ' ')}</td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{a.courseType?.replace(/_/g, ' ') || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#9ca3af' }}>{fmt(a.submittedAt)}</td>
                <td style={{ padding: '10px 14px' }}><StatusBadge status={a.status} /></td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {a.status === 'DOCUMENTS_VERIFIED' && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setModal(a); }} style={{
                          padding: '5px 12px', background: '#7c3aed', color: '#fff',
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        }}>Approve</button>
                        <button onClick={e => { e.stopPropagation(); setModal(a); }} style={{
                          padding: '5px 12px', background: '#fef2f2', color: '#dc2626',
                          border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        }}>Reject</button>
                      </>
                    )}
                    {a.status === 'COUNCIL_REVIEW' && (
                      <button onClick={e => { e.stopPropagation(); setModal(a); }} style={{
                        padding: '5px 12px', background: '#ecfdf5', color: '#059669',
                        border: '1px solid #6ee7b7', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      }}>Complete</button>
                    )}
                    {!['DOCUMENTS_VERIFIED', 'COUNCIL_REVIEW'].includes(a.status) && (
                      <button onClick={e => { e.stopPropagation(); setModal(a); }} style={{
                        padding: '5px 12px', background: '#f3f4f6', color: '#374151',
                        border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      }}>View</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  No applications match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ApplicantModal app={modal} token={token} onClose={() => setModal(null)} onDone={onModalDone} />
      )}
    </div>
  );
}