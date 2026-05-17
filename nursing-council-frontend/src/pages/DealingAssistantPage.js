import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../styles/theme';
import {
  daGetAllApplications,
  daGetUnprocessed,
  daUpdateStatus,
  daGetReport,
} from '../services/api';

// ─── status meta ──────────────────────────────────────────────────────────────

const STATUS_META = {
  SUBMITTED:          { bg: '#fff8e1', color: '#b45309', label: 'Submitted',      dot: '#f59e0b' },
  DOCUMENTS_VERIFIED: { bg: '#ecfdf5', color: '#065f46', label: 'Docs Verified',  dot: '#059669' },
  COUNCIL_REVIEW:     { bg: '#ede9fe', color: '#4c1d95', label: 'Council Review', dot: '#7c3aed' },
  COMPLETED:          { bg: '#dbeafe', color: '#1e40af', label: 'Completed',       dot: '#2563eb' },
  REJECTED:           { bg: '#fef2f2', color: '#991b1b', label: 'Rejected',        dot: '#dc2626' },
};

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
const fmt   = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTs = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── centred applicant modal ──────────────────────────────────────────────────

function ApplicantModal({ app, token, onClose, onSave }) {
  const [decision, setDecision] = useState('DOCUMENTS_VERIFIED');
  const [reason,   setReason]   = useState('');
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState(null);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!app) return null;
  const canProcess = app.status === 'SUBMITTED';

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await daUpdateStatus(token, app.referenceNumber, {
        status: decision,
        rejectionReason: reason,
        adminNotes: notes,
      });
      onSave();
    } catch (ex) {
      setErr(ex.message);
      setLoading(false);
    }
  }

  const InfoChip = ({ icon, label, value, mono, highlight }) => (
  <div style={{
    padding: '10px 12px',
    borderRadius: 12,
    background: highlight ? '#eff6ff' : '#f8fafc',
    border: `1px solid ${highlight ? '#bfdbfe' : '#e2e8f0'}`,
  }}>
    <div style={{
      fontSize: 10,
      color: '#94a3b8',
      fontWeight: 700,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}>
      {icon} {label}
    </div>

    <div style={{
      fontSize: 13,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: mono ? 'monospace' : 'inherit',
      wordBreak: 'break-word',
      lineHeight: 1.4,
    }}>
      {value || '—'}
    </div>
  </div>
);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform: translateY(24px) scale(0.98) } to { opacity:1; transform: translateY(0) scale(1) } }
      `}</style>

      <div
  onClick={e => e.stopPropagation()}
  style={{
    background: '#ffffff',
    borderRadius: 22,
    width: '100%',
    maxWidth: 620,
    maxHeight: '88vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(15,23,42,0.28)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
    border: '1px solid rgba(226,232,240,0.8)',
  }}
>
        {/* header */}
       <div style={{
  padding: '22px 24px',
  background: 'linear-gradient(135deg,#0f172a 0%, #1e40af 100%)',
  borderRadius: '22px 22px 0 0',
  position: 'relative',
}}>
  <button
    onClick={onClose}
    style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
    }}
  >
    ×
  </button>

  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  }}>
    <div style={{
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 800,
      fontSize: 20,
      flexShrink: 0,
    }}>
      {(app.applicantName || '?')[0].toUpperCase()}
    </div>

    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        fontWeight: 700,
      }}>
        Application Review
      </div>

      <h3 style={{
        margin: 0,
        color: '#fff',
        fontSize: 20,
        fontWeight: 800,
      }}>
        {app.applicantName}
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
        flexWrap: 'wrap',
      }}>
        <code style={{
          fontSize: 11,
          color: '#bfdbfe',
          fontWeight: 700,
        }}>
          {app.referenceNumber}
        </code>

        <StatusBadge status={app.status} />
      </div>
    </div>
  </div>
</div>

        {/* body */}
        <div style={{ padding: '22px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                👤 Applicant Information
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InfoChip icon="📛" label="Full Name"       value={app.applicantName} />
                <InfoChip icon="📧" label="Email"           value={app.applicantEmail} />
                <InfoChip icon="📱" label="Mobile"          value={app.applicantMobile} />
                <InfoChip icon="🪪" label="Reg. No."        value={app.registrationNumber} mono highlight />
                {app.gender      && <InfoChip icon="⚧"  label="Gender"       value={app.gender} />}
                {app.dateOfBirth && <InfoChip icon="🎂" label="Date of Birth" value={fmt(app.dateOfBirth)} />}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                📄 Application Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InfoChip icon="🗂"  label="Type"            value={app.applicationType?.replace(/_/g, ' ')} />
                <InfoChip icon="🎓"  label="Degree / Course" value={app.courseType?.replace(/_/g, ' ')} />
                <InfoChip icon="📅"  label="Submitted"       value={fmtTs(app.submittedAt)} />
                <InfoChip icon="🔄"  label="Last Updated"    value={fmtTs(app.lastUpdatedAt)} />
                {app.institution && <InfoChip icon="🏥" label="Institution" value={app.institution} />}
                {app.address     && <InfoChip icon="📍" label="Address"     value={app.address} />}
              </div>
            </div>
          </div>

          {app.rejectionReason && (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
              border: '1px solid #fecaca', borderLeft: '4px solid #dc2626',
              borderRadius: 14, padding: '16px 20px', marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                ✗ Rejection Reason
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', lineHeight: 1.7 }}>
                {app.rejectionReason}
              </p>
            </div>
          )}

          {canProcess ? (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: 16, padding: '22px 24px', border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#374151',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                ⚡ DA Decision
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                {[
                  { val: 'DOCUMENTS_VERIFIED', label: '✓  Accept Application', clr: '#059669', light: '#ecfdf5', ring: '#6ee7b7' },
                  { val: 'REJECTED',            label: '✗  Reject Application', clr: '#dc2626', light: '#fef2f2', ring: '#fecaca' },
                ].map(opt => (
                  <button type="button" key={opt.val}
                    onClick={() => setDecision(opt.val)}
                    style={{
  padding: '14px 0',
  fontWeight: 700,
  fontSize: 13,
  border: `2px solid ${decision === opt.val ? opt.clr : '#e2e8f0'}`,
  borderRadius: 12,
  cursor: 'pointer',
  background: decision === opt.val ? opt.light : '#fff',
  color: decision === opt.val ? opt.clr : '#64748b',
  transition: 'all 0.15s ease',
}}>{opt.label}</button>
                ))}
              </div>

              <form onSubmit={submit}>
                {decision === 'REJECTED' && (
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
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block',
                    marginBottom: 6, color: '#374151' }}>
                    Internal Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea rows={2} value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notes visible only to staff…"
                    style={{ width: '100%', padding: '10px 13px',
                      border: '1px solid #e2e8f0', background: '#fff',
                      borderRadius: 10, fontSize: 13, resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', lineHeight: 1.6 }} />
                </div>
                {err && (
                  <div style={{ background: '#fef2f2', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: 10,
                    padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{err}</div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={onClose} style={{
  flex: 1,
  padding: '12px 0',
  borderRadius: 12,
  border: '1px solid #dbe2ea',
  background: '#fff',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  color: '#374151',
}}>Cancel</button>
                  <button type="submit" disabled={loading} style={{
  flex: 2,
  padding: '12px 0',
  borderRadius: 12,
  border: 'none',
  cursor: loading ? 'not-allowed' : 'pointer',
  fontWeight: 800,
  fontSize: 13,
  color: '#fff',
  opacity: loading ? 0.7 : 1,
  background:
    decision === 'REJECTED'
      ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
      : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
  boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
}}>
                    {loading ? 'Saving…' : decision === 'REJECTED' ? '✗  Confirm Rejection' : '✓  Confirm Acceptance'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc', borderRadius: 14, padding: '18px 22px',
              fontSize: 13, color: '#64748b', textAlign: 'center',
              border: '1px dashed #cbd5e1', lineHeight: 1.6,
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>
                {app.status === 'COMPLETED' ? '🎓' : app.status === 'REJECTED' ? '✗' : '⏳'}
              </div>
              This application has already been processed by the DA.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── reports section ──────────────────────────────────────────────────────────

function ReportsSection({ report, allApps }) {
  const [reportTab, setReportTab] = useState('applicants');

  const byYear = {}, byDegree = {}, byCategory = {};
  allApps.forEach(a => {
    const year = a.submittedAt ? new Date(a.submittedAt).getFullYear() : 'Unknown';
    const deg  = a.courseType?.replace(/_/g, ' ') || 'Unknown';
    const cat  = a.applicationType?.replace(/_/g, ' ') || 'Unknown';
    const inc = (obj, key) => {
      if (!obj[key]) obj[key] = { total: 0, completed: 0, rejected: 0, pending: 0 };
      obj[key].total++;
      if      (a.status === 'COMPLETED') obj[key].completed++;
      else if (a.status === 'REJECTED')  obj[key].rejected++;
      else                               obj[key].pending++;
    };
    inc(byYear, year); inc(byDegree, deg); inc(byCategory, cat);
  });

  const summaryCards = report ? [
    { label: 'Total',          val: report.total,                    color: '#0f172a', icon: '📊' },
    { label: 'Submitted',      val: report.byStatus?.submitted,      color: '#b45309', icon: '📨' },
    { label: 'Docs Verified',  val: report.byStatus?.verified,       color: '#059669', icon: '✅' },
    { label: 'Council Review', val: report.byStatus?.review,         color: '#7c3aed', icon: '🏛' },
    { label: 'Completed',      val: report.byStatus?.completed,      color: '#2563eb', icon: '🎓' },
    { label: 'Rejected',       val: report.byStatus?.rejected,       color: '#dc2626', icon: '✗' },
    { label: 'New Reg.',       val: report.byType?.newRegistrations,  color: '#0284c7', icon: '🆕' },
    { label: 'Renewals',       val: report.byType?.renewals,          color: '#7c3aed', icon: '🔄' },
  ] : [];

  const thS = {
    padding: '11px 16px', fontSize: 11, fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.5, background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap', textAlign: 'left',
  };
  const tdS = { padding: '11px 16px', fontSize: 13, borderBottom: '1px solid #f3f4f6' };

  const BreakdownTable = ({ data, keyLabel, keys }) => (
    keys.length === 0 ? (
      <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24, fontSize: 13 }}>
        Load "All Applications" tab first to generate the breakdown.
      </p>
    ) : (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 10, overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={thS}>{keyLabel}</th>
              <th style={{ ...thS, textAlign: 'center' }}>Total</th>
              <th style={{ ...thS, textAlign: 'center' }}>Completed</th>
              <th style={{ ...thS, textAlign: 'center' }}>Pending</th>
              <th style={{ ...thS, textAlign: 'center' }}>Rejected</th>
              <th style={{ ...thS, textAlign: 'center' }}>Pass Rate</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k, i) => {
              const g = data[k];
              const rate = g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0;
              return (
                <tr key={k} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                  <td style={{ ...tdS, fontWeight: 700, color: COLORS.primary }}>{k}</td>
                  <td style={{ ...tdS, textAlign: 'center', fontWeight: 800 }}>{g.total}</td>
                  <td style={{ ...tdS, textAlign: 'center', color: '#059669', fontWeight: 700 }}>{g.completed}</td>
                  <td style={{ ...tdS, textAlign: 'center', color: '#b45309', fontWeight: 700 }}>{g.pending}</td>
                  <td style={{ ...tdS, textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{g.rejected}</td>
                  <td style={{ ...tdS, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <div style={{ width: 70, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${rate}%`, height: '100%', borderRadius: 3,
                          background: rate >= 70 ? '#059669' : rate >= 40 ? '#f59e0b' : '#dc2626' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', minWidth: 28 }}>{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );

  const REPORT_TABS = [
    { id: 'applicants', label: '👥 Applicants' },
    { id: 'year',       label: '📅 By Year' },
    { id: 'degree',     label: '🎓 By Degree' },
    { id: 'category',   label: '🗂 By Category' },
  ];

  return (
    <div>
      {report && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {summaryCards.map(c => (
            <div key={c.label} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 14, padding: '16px 18px', minWidth: 110, flex: 1,
              borderTop: `3px solid ${c.color}`,
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val ?? 0}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5, fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', gap: 4, background: '#f1f5f9',
        borderRadius: 12, padding: 4, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {REPORT_TABS.map(rt => (
          <button key={rt.id} onClick={() => setReportTab(rt.id)} style={{
            padding: '9px 18px', border: 'none', cursor: 'pointer', fontSize: 12,
            fontWeight: 700, borderRadius: 9, flex: 1,
            background: reportTab === rt.id ? '#fff' : 'transparent',
            color: reportTab === rt.id ? COLORS.primary : '#64748b',
            boxShadow: reportTab === rt.id ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}>{rt.label}</button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
        {reportTab === 'applicants' && (
          <>
            <h4 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              👥 Applicant Report
            </h4>
            {allApps.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24, fontSize: 13 }}>
                Load "All Applications" tab first.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Ref No.', 'Applicant', 'Mobile', 'Reg. No.', 'Type', 'Degree', 'Submitted', 'Status'].map(h => (
                        <th key={h} style={thS}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allApps.map((a, i) => (
                      <tr key={a.referenceNumber} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                        <td style={{ ...tdS, fontFamily: 'monospace', fontSize: 12,
                          color: COLORS.primary, fontWeight: 700 }}>{a.referenceNumber}</td>
                        <td style={tdS}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{a.applicantName}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.applicantEmail}</div>
                        </td>
                        <td style={{ ...tdS, fontSize: 12 }}>{a.applicantMobile || '—'}</td>
                        <td style={{ ...tdS, fontSize: 11, fontFamily: 'monospace', color: '#475569' }}>{a.registrationNumber || '—'}</td>
                        <td style={{ ...tdS, fontSize: 12 }}>{a.applicationType?.replace(/_/g, ' ') || '—'}</td>
                        <td style={{ ...tdS, fontSize: 12 }}>{a.courseType?.replace(/_/g, ' ') || '—'}</td>
                        <td style={{ ...tdS, fontSize: 11, color: '#64748b' }}>{fmt(a.submittedAt)}</td>
                        <td style={tdS}><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {reportTab === 'year' && (
          <>
            <h4 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>📅 Breakdown by Year</h4>
            <BreakdownTable data={byYear} keyLabel="Year" keys={Object.keys(byYear).sort((a, b) => b - a)} />
          </>
        )}
        {reportTab === 'degree' && (
          <>
            <h4 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>🎓 Breakdown by Degree</h4>
            <BreakdownTable data={byDegree} keyLabel="Degree" keys={Object.keys(byDegree).sort()} />
          </>
        )}
        {reportTab === 'category' && (
          <>
            <h4 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>🗂 Breakdown by Category</h4>
            <BreakdownTable data={byCategory} keyLabel="Category" keys={Object.keys(byCategory).sort()} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function DealingAssistantPage({ token }) {
  const [tab,          setTab]          = useState('unprocessed');
  const [apps,         setApps]         = useState([]);
  const [allApps,      setAllApps]      = useState([]);
  const [report,       setReport]       = useState(null);
  const [modal,        setModal]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [msg,          setMsg]          = useState(null);
  const [loading,      setLoading]      = useState(false);

  const loadUnprocessed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await daGetUnprocessed(token);
      setApps(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch (e) { setMsg({ type: 'error', text: e.message }); setApps([]); }
    setLoading(false);
  }, [token]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await daGetAllApplications(token);
      const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setApps(list); setAllApps(list);
    } catch (e) { setMsg({ type: 'error', text: e.message }); setApps([]); }
    setLoading(false);
  }, [token]);

  const loadReport = useCallback(async () => {
    try {
      const res = await daGetReport(token);
      setReport(res || {});
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    if (allApps.length === 0) {
      try {
        const res2 = await daGetAllApplications(token);
        setAllApps(Array.isArray(res2.data) ? res2.data : res2.data?.content || []);
      } catch (_) {}
    }
  }, [token, allApps.length]);

  useEffect(() => {
    setMsg(null);
    if (tab === 'unprocessed')  loadUnprocessed();
    else if (tab === 'all')     loadAll();
    else if (tab === 'reports') loadReport();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.referenceNumber?.toLowerCase().includes(q) ||
      a.applicantName?.toLowerCase().includes(q) ||
      a.applicantMobile?.includes(q) ||
      a.applicantEmail?.toLowerCase().includes(q);
    return matchSearch &&
      (!filterStatus || a.status === filterStatus) &&
      (!filterType   || a.applicationType === filterType);
  });

  function onActionDone() {
    setModal(null);
    setMsg({ type: 'success', text: 'Application updated successfully.' });
    if (tab === 'unprocessed') loadUnprocessed(); else loadAll();
  }

  const TABS = [
    { id: 'unprocessed', label: '🔴 Unprocessed' },
    { id: 'all',         label: '📋 All Applications' },
    { id: 'reports',     label: '📊 Reports' },
  ];
  const TH = ['Ref No.', 'Applicant', 'Type', 'Course', 'Submitted', 'Status', 'Action'];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      <h2 style={{ color: COLORS.primary, fontFamily: 'EB Garamond', fontSize: 26, marginBottom: 4 }}>
        Dealing Assistant Dashboard
      </h2>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
        Review submitted applications — verify documents, accept or reject
      </p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '2px solid #e5e7eb' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 22px', border: 'none', cursor: 'pointer', fontSize: 14,
            background: tab === t.id ? COLORS.primary : 'transparent',
            color: tab === t.id ? '#fff' : '#64748b',
            borderRadius: '6px 6px 0 0', fontWeight: tab === t.id ? 700 : 400,
            marginBottom: -2, transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {msg && (
        <div style={{
          background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color:      msg.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${msg.type === 'success' ? '#6ee7b7' : '#fecaca'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 16, color: 'inherit' }}>×</button>
        </div>
      )}

      {(tab === 'unprocessed' || tab === 'all') && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <input
              placeholder="Search by name, ref no., mobile…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 220, padding: '8px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
            />
            {tab === 'all' && (
              <>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                  <option value="">All Statuses</option>
                  {Object.keys(STATUS_META).map(s => (
                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                  ))}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                  <option value="">All Types</option>
                  <option value="NEW_REGISTRATION">New Registration</option>
                  <option value="RENEWAL">Renewal</option>
                </select>
              </>
            )}
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
            {loading ? 'Loading…' : `${filtered.length} application${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff',
              borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {TH.map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
                      letterSpacing: 0.5, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.referenceNumber}
                    style={{ borderTop: '1px solid #f3f4f6', cursor: 'pointer',
                      background: i % 2 === 0 ? '#fff' : '#fafbfd', transition: 'background 0.1s' }}
                    onClick={() => setModal(a)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfd'}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700,
                      fontFamily: 'monospace', color: COLORS.primary }}>{a.referenceNumber}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{a.applicantName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.applicantMobile}</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>{a.applicationType?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>{a.courseType?.replace(/_/g, ' ') || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>{fmt(a.submittedAt)}</td>
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={a.status} /></td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={e => { e.stopPropagation(); setModal(a); }} style={{
                        padding: '6px 16px',
                        background: a.status === 'SUBMITTED' ? COLORS.primary : '#f1f5f9',
                        color: a.status === 'SUBMITTED' ? '#fff' : '#374151',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {a.status === 'SUBMITTED' ? 'Process' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    {tab === 'unprocessed' ? '✓ No unprocessed applications' : 'No applications match your filters'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reports' && <ReportsSection report={report} allApps={allApps} />}

      {modal && (
        <ApplicantModal app={modal} token={token} onClose={() => setModal(null)} onSave={onActionDone} />
      )}
    </div>
  );
}