import React, { useState } from 'react';
import { COLORS, S } from '../styles/theme';
import { FormGroup } from '../components/common/FormGroup';
import { Input } from '../components/common/Input';
import { SectionCard } from '../components/common/SectionCard';
import { trackApplicationStatus } from '../services/api';

const STATUS_ORDER = [
  'SUBMITTED',
  'DOCUMENTS_VERIFIED',
  'COUNCIL_REVIEW',
  'CERTIFICATE_GENERATION',
  'COMPLETED',
];

export default function StatusPage() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [mobile, setMobile]                   = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [result, setResult]                   = useState(null);

  const handleTrack = async () => {
    if (!referenceNumber.trim() || !mobile.trim()) {
      setError('Please enter both your reference number and mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await trackApplicationStatus(referenceNumber.trim(), mobile.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Could not retrieve application status. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = result
    ? STATUS_ORDER.indexOf(result.status)
    : -1;

  return (
    <div style={S.section}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={S.sectionTitle}>Track Application Status</div>
        <div style={{ height: 3, width: 50, background: COLORS.accent, margin: '8px 0 16px' }} />
        <p style={{ fontSize: 14, color: COLORS.textMuted }}>
          Enter your application reference number and the mobile number you registered with to check the current status.
        </p>
      </div>

      {/* ── Search card ──────────────────────────────────────────────────── */}
      <SectionCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormGroup label="Application reference number" required>
            <Input
              placeholder="e.g. MSNC-2026-04821"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </FormGroup>
          <FormGroup label="Registered mobile number" required>
            <Input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </FormGroup>
        </div>

        {error && (
          <div style={{ background: COLORS.dangerBg, border: `1px solid #f1948a`, borderRadius: 6, padding: '10px 14px', marginBottom: 12, color: COLORS.danger, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <button
            style={{ ...S.btn('primary'), cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            onClick={handleTrack}
            disabled={loading}
          >
            {loading ? 'Searching…' : '🔍 Track Status'}
          </button>
        </div>
      </SectionCard>

      {/* ── Result card ──────────────────────────────────────────────────── */}
      {result && (
        <SectionCard style={{ marginTop: 24 }}>
          {/* Summary row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 700, color: COLORS.primary }}>
                {result.applicantName}
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
                Reference: <strong>{result.referenceNumber}</strong> &nbsp;|&nbsp;
                Type: <strong>{result.applicationType === 'NEW_REGISTRATION' ? 'New Registration' : 'Renewal'}</strong>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                Submitted: {new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <StatusBadge status={result.status} />
          </div>

          {/* Progress stepper */}
          {result.status !== 'REJECTED' ? (
            <div style={{ position: 'relative' }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute', top: 16, left: 16, right: 16, height: 3,
                background: COLORS.border, zIndex: 0,
              }} />
              <div style={{
                position: 'absolute', top: 16, left: 16, height: 3, zIndex: 1,
                background: COLORS.success,
                width: currentIdx >= 0
                  ? `${(currentIdx / (STATUS_ORDER.length - 1)) * (100 - (32 / 5))}%`
                  : '0%',
                transition: 'width 0.6s ease',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {(result.statusSteps || []).map((step, idx) => {
                  const done = step.completed;
                  const active = STATUS_ORDER[currentIdx] === step.status;
                  return (
                    <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: done ? COLORS.success : COLORS.white,
                        border: `3px solid ${done ? COLORS.success : active ? COLORS.primary : COLORS.border}`,
                        color: done ? COLORS.white : active ? COLORS.primary : COLORS.textMuted,
                        fontWeight: 700, fontSize: 13,
                        boxShadow: active ? `0 0 0 4px ${COLORS.primaryLight}` : 'none',
                        transition: 'all 0.3s',
                      }}>
                        {done ? '✓' : idx + 1}
                      </div>
                      <div style={{ fontSize: 11, textAlign: 'center', marginTop: 6, maxWidth: 90, color: done ? COLORS.success : active ? COLORS.primary : COLORS.textMuted, fontWeight: active ? 700 : 400 }}>
                        {step.label}
                      </div>
                      {step.completedAt && (
                        <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
                          {new Date(step.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background: COLORS.dangerBg, border: `1px solid #f1948a`, borderRadius: 6, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>❌</div>
              <div style={{ fontWeight: 700, color: COLORS.danger }}>Application Rejected</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 6 }}>
                Please contact the council office for further details.
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    SUBMITTED:              { label: 'Submitted',              bg: '#eaf4fb', color: '#2980b9' },
    DOCUMENTS_VERIFIED:     { label: 'Docs Verified',          bg: '#eafaf1', color: '#27ae60' },
    COUNCIL_REVIEW:         { label: 'Under Review',           bg: '#fef9e7', color: '#d4ac0d' },
    CERTIFICATE_GENERATION: { label: 'Generating Certificate', bg: '#fef5e7', color: '#e67e22' },
    COMPLETED:              { label: 'Completed',              bg: '#eafaf1', color: '#1e8449' },
    REJECTED:               { label: 'Rejected',               bg: '#fdf2f2', color: '#c0392b' },
  }[status] || { label: status, bg: COLORS.lightGray, color: COLORS.textMuted };

  return (
    <span style={{ background: config.bg, color: config.color, border: `1.5px solid ${config.color}30`, padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
      {config.label}
    </span>
  );
}
