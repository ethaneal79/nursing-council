import React, { useState, useEffect , useCallback} from 'react';
import { COLORS } from '../styles/theme';
import { daGetAllApplications, daGetUnprocessed, daUpdateStatus, daGetReport } from '../services/api';

const STATUS_COLORS = {
  SUBMITTED: { bg: COLORS.warningBg, color: COLORS.warning },
  DOCUMENTS_VERIFIED: { bg: COLORS.successBg, color: COLORS.success },
  COUNCIL_REVIEW: { bg: '#e8eaf6', color: '#3949ab' },
  COMPLETED: { bg: COLORS.successBg, color: COLORS.success },
  REJECTED: { bg: COLORS.dangerBg, color: COLORS.danger },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: COLORS.lightGray, color: COLORS.text };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, fontSize: 11, padding: '2px 8px', fontWeight: 600 }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default function DealingAssistantPage({ token }) {
  const [tab, setTab] = useState('unprocessed');
  const [apps, setApps] = useState([]);
  const [report, setReport] = useState(null);
  const [selected, setSelected] = useState(null);
  const [actionData, setActionData] = useState({ status: 'DOCUMENTS_VERIFIED', rejectionReason: '', adminNotes: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  
const loadUnprocessed = useCallback(async () => {
  try {
    const res = await daGetUnprocessed(token);

    console.log("UNPROCESSED:", res);

    setApps(Array.isArray(res.data) ? res.data : []);
  } catch (e) {
    setMsg({ type: 'error', text: e.message });
  }
}, [token]);

const loadAll = useCallback(async () => {
  try {
    const res = await daGetAllApplications(token);

    console.log("ALL APPS:", res);

    setApps(Array.isArray(res.data) ? res.data : []);
  } catch (e) {
    setMsg({ type: 'error', text: e.message });
  }
}, [token]);

const loadReport = useCallback(async () => {
  try {
    const res = await daGetReport(token);

    console.log("REPORT:", res);

    setReport(res.data || {});
  } catch (e) {
    setMsg({ type: 'error', text: e.message });
  }
}, [token]);

useEffect(() => {
    if (tab === 'unprocessed') loadUnprocessed();
    else if (tab === 'all') loadAll();
    else if (tab === 'reports') loadReport();
  }, [tab, loadAll, loadReport, loadUnprocessed]);


  async function handleAction(e) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true); setMsg(null);
    try {
      await daUpdateStatus(token, selected.referenceNumber, actionData);
      setMsg({ type: 'success', text: `Application ${selected.referenceNumber} updated.` });
      setSelected(null);
      if (tab === 'unprocessed') loadUnprocessed(); else loadAll();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setLoading(false);
  }

  const tabs = [
    { id: 'unprocessed', label: '🔴 Unprocessed' },
    { id: 'all', label: '📋 All Applications' },
    { id: 'reports', label: '📊 Reports' },
  ];

  const ReportRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ color: COLORS.textMuted, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h2 style={{ color: COLORS.primary, fontFamily: 'EB Garamond', fontSize: 26, marginBottom: 6 }}>
        Dealing Assistant Dashboard
      </h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24, fontSize: 14 }}>
        Review applications — accept or reject submitted cases
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: `2px solid ${COLORS.border}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 14,
            background: tab === t.id ? COLORS.primary : 'transparent',
            color: tab === t.id ? '#fff' : COLORS.textMuted,
            borderRadius: '6px 6px 0 0', fontWeight: tab === t.id ? 600 : 400,
            marginBottom: -2
          }}>{t.label}</button>
        ))}
      </div>

      {msg && (
        <div style={{
          background: msg.type === 'success' ? COLORS.successBg : COLORS.dangerBg,
          color: msg.type === 'success' ? COLORS.success : COLORS.danger,
          border: `1px solid ${msg.type === 'success' ? COLORS.success : COLORS.danger}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14
        }}>{msg.text}</div>
      )}

      {/* Action modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 460, maxWidth: '95vw' }}>
            <h3 style={{ marginBottom: 4, color: COLORS.primary }}>Update Application</h3>
            <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 20 }}>
              Ref: <strong>{selected.referenceNumber}</strong> — {selected.applicantName}
            </p>
            <form onSubmit={handleAction}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Action</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { val: 'DOCUMENTS_VERIFIED', label: '✓ Accept', color: COLORS.success },
                    { val: 'REJECTED', label: '✗ Reject', color: COLORS.danger },
                  ].map(opt => (
                    <button type="button" key={opt.val}
                      onClick={() => setActionData(p => ({ ...p, status: opt.val }))}
                      style={{
                        flex: 1, padding: '10px', border: `2px solid ${actionData.status === opt.val ? opt.color : COLORS.border}`,
                        borderRadius: 8, background: actionData.status === opt.val ? opt.color : '#fff',
                        color: actionData.status === opt.val ? '#fff' : COLORS.text,
                        fontWeight: 600, cursor: 'pointer', fontSize: 14
                      }}>{opt.label}</button>
                  ))}
                </div>
              </div>
              {actionData.status === 'REJECTED' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Rejection Reason *</label>
                  <textarea required rows={3}
                    value={actionData.rejectionReason}
                    onChange={e => setActionData(p => ({ ...p, rejectionReason: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                    placeholder="Reason for rejection..."
                  />
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                <textarea rows={2}
                  value={actionData.adminNotes}
                  onChange={e => setActionData(p => ({ ...p, adminNotes: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                  placeholder="Internal notes..."
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setSelected(null)} style={{
                  flex: 1, padding: 10, border: `1px solid ${COLORS.border}`, borderRadius: 8,
                  background: '#fff', cursor: 'pointer', fontWeight: 600
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: 10, background: COLORS.primary, color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
                }}>{loading ? 'Saving...' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application list (unprocessed + all tabs) */}
      {(tab === 'unprocessed' || tab === 'all') && (
        <div>
          <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 14 }}>
            {apps.length} application{apps.length !== 1 ? 's' : ''} found
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <thead>
              <tr style={{ background: COLORS.lightGray }}>
                {['Ref No.', 'Applicant', 'Type', 'Submitted', 'Status', 'Action'].map(h => (
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
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{a.applicantMobile}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{a.applicationType?.replace('_', ' ')}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: COLORS.textMuted }}>
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding: '10px 14px' }}>
                    {a.status === 'SUBMITTED' && (
                      <button onClick={() => { setSelected(a); setActionData({ status: 'DOCUMENTS_VERIFIED', rejectionReason: '', adminNotes: '' }); }}
                        style={{
                          padding: '6px 14px', background: COLORS.primary, color: '#fff',
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
                        }}>Process</button>
                    )}
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: COLORS.textMuted }}>
                  {tab === 'unprocessed' ? '✓ No unprocessed applications' : 'No applications found'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && report && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { title: 'By Status', data: report.byStatus },
            { title: 'By Type', data: report.byType },
            { title: 'By Course', data: report.byCourse },
          ].map(section => (
            <div key={section.title} style={{ flex: 1, minWidth: 240, background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
              <h4 style={{ marginBottom: 14, color: COLORS.primary, fontSize: 15 }}>{section.title}</h4>
              {Object.entries(section.data || {}).map(([k, v]) => (
                <ReportRow key={k} label={k.replace(/([A-Z])/g, ' $1').trim()} value={v} />
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
                <span style={{ fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>{report.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}