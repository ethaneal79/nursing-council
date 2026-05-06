import React, { useState } from 'react';
import { COLORS, S } from '../styles/theme';
import { FormGroup } from '../components/common/FormGroup';
import { Input } from '../components/common/Input';
import { SectionCard } from '../components/common/SectionCard';
import { verifyCertificate } from '../services/api';

export default function VerifyPage() {
  const [regNo, setRegNo]     = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);   // VerificationResponse
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!regNo.trim()) {
      setError('Please enter a registration number.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(false);
    try {
      const res = await verifyCertificate(regNo.trim(), name.trim() || undefined);
      setResult(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isActive = result?.valid && result?.status === 'Active';
  const isExpired = result?.valid && result?.status === 'Expired';

  return (
    <div style={S.section}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={S.sectionTitle}>Verify Certificate</div>
        <div style={{ height: 3, width: 50, background: COLORS.accent, margin: '8px 0 16px' }} />
        <p style={{ fontSize: 14, color: COLORS.textMuted }}>
          Instantly verify the authenticity of a nursing certificate issued by Meghalaya State Nursing Council.
          Enter the registration number printed on the certificate.
        </p>
      </div>

      {/* ── Search card ──────────────────────────────────────────────────── */}
      <SectionCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormGroup label="Registration number" required>
            <Input
              placeholder="e.g. MSNC/GNM/2019/001234"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </FormGroup>
          <FormGroup label="Full name (optional — narrows search)">
            <Input
              placeholder="Nurse's full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
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
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Verifying…' : '🔍 Verify Certificate'}
          </button>
        </div>
      </SectionCard>

      {/* ── Result: not found ─────────────────────────────────────────────── */}
      {searched && result && !result.valid && (
        <SectionCard style={{ marginTop: 24, textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 700, color: COLORS.danger, marginBottom: 8 }}>
            Certificate Not Found
          </div>
          <p style={{ fontSize: 14, color: COLORS.textMuted, maxWidth: 400, margin: '0 auto' }}>
            No certificate matching the provided details was found in the MSNC register.
            Please double-check the registration number and try again, or contact the council office.
          </p>
        </SectionCard>
      )}

      {/* ── Result: valid ─────────────────────────────────────────────────── */}
      {searched && result?.valid && (
        <SectionCard style={{ marginTop: 24 }}>
          {/* Header badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isActive ? COLORS.successBg : COLORS.dangerBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              {isActive ? '✅' : '⚠️'}
            </div>
            <div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 700, color: isActive ? COLORS.success : COLORS.danger }}>
                {isActive ? 'Certificate Verified — Active' : 'Certificate Found — Expired'}
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                This certificate is registered with Meghalaya State Nursing Council
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: 'hidden' }}>
            {[
              ['Registration Number', result.registrationNumber],
              ['Full Name',           result.name],
              ['Course',              result.course],
              ['Institution',         result.institution],
              ['Valid Until',         result.validUntil ? new Date(result.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
              ['Status',              result.status],
            ].map(([label, value], idx) => (
              <div key={label} style={{
                padding: '14px 18px',
                background: idx % 4 < 2 ? COLORS.white : COLORS.lightGray,
                borderBottom: idx < 4 ? `1px solid ${COLORS.border}` : 'none',
                borderRight: idx % 2 === 0 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: label === 'Status' ? (isActive ? COLORS.success : COLORS.danger) : COLORS.text,
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {isExpired && (
            <div style={{ background: '#fef9e7', border: `1px solid #f9e04b`, borderRadius: 6, padding: '10px 14px', marginTop: 16, fontSize: 13, color: '#7d6608' }}>
              ⚠️ This certificate has expired. The nurse must renew their registration to practice legally.
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
