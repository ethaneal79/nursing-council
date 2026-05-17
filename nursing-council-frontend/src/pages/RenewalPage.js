import React, { useState } from 'react';
import { COLORS, S } from '../styles/theme';
import { FormGroup } from '../components/common/FormGroup';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StepIndicator } from '../components/common/StepIndicator';
import { SectionCard } from '../components/common/SectionCard';
import { BtnRow } from '../components/common/BtnRow';
import {
  verifyNurseForRenewal,
  submitRenewal,
  uploadRenewalDocument,
} from '../services/api';

const PAYMENT_OPTIONS = [
  { value: 'UPI',          label: 'UPI / QR Code' },
  { value: 'NET_BANKING',  label: 'Net Banking' },
  { value: 'CARD',         label: 'Debit / Credit Card' },
  { value: 'DEMAND_DRAFT', label: 'Demand Draft' },
];

const initialForm = {
  registrationNumber: '', mobile: '', fullName: '', dateOfBirth: '',
  refresherCourseTitle: '', refresherYearAttended: '', refresherOrganisingBody: '', refresherDuration: '',
  paymentMethod: 'UPI', transactionRef: '',
};

export default function RenewalPage() {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState(initialForm);
  const [verifiedNurse, setVerifiedNurse] = useState(null);
  const [files, setFiles]       = useState({ refresher: null, idProof: null });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [result, setResult]     = useState(null);

  const steps     = ['Verify registration', 'Refresher course details', 'Payment'];
  const completed = Array.from({ length: step - 1 }, (_, i) => i + 1);
  const set       = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const back      = () => { setError(''); setStep((s) => Math.max(s - 1, 1)); };

  const validateStep = () => {

  // STEP 1
  if (step === 1) {

    if (!form.registrationNumber.trim()) {
      setError('Registration number is required');
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(form.mobile)) {
      setError('Mobile number must be 10 digits');
      return false;
    }

    if (!form.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!form.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
  }

  // STEP 2
  if (step === 2) {

    if (!form.refresherCourseTitle.trim()) {
      setError('Course title is required');
      return false;
    }

    if (!form.refresherYearAttended) {
      setError('Year attended is required');
      return false;
    }

    const year = Number(form.refresherYearAttended);

    if (
      year < 1950 ||
      year > new Date().getFullYear()
    ) {
      setError('Enter valid year attended');
      return false;
    }

    if (!form.refresherOrganisingBody.trim()) {
      setError('Organising body is required');
      return false;
    }

    if (!form.refresherDuration.trim()) {
      setError('Duration is required');
      return false;
    }

    // FILE CHECKS

    if (!files.refresher) {
      setError('Refresher certificate is required');
      return false;
    }

    if (!files.idProof) {
      setError('ID proof is required');
      return false;
    }
  }

  // STEP 3
  if (step === 3) {

    if (!form.paymentMethod) {
      setError('Select payment method');
      return false;
    }

    if (
      form.paymentMethod !== 'DEMAND_DRAFT' &&
      !form.transactionRef.trim()
    ) {
      setError('Transaction reference is required');
      return false;
    }
  }

  setError('');
  return true;
};
  // ── Step 1: verify ────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!validateStep()) {
    return;
  }
    setLoading(true);
    setError('');
    try {
      const res = await verifyNurseForRenewal(form.registrationNumber, form.mobile, form.fullName);
      setVerifiedNurse(res.data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await submitRenewal({
        registrationNumber:      form.registrationNumber,
        mobile:                  form.mobile,
        fullName:                form.fullName,
        dateOfBirth:             form.dateOfBirth,
        refresherCourseTitle:    form.refresherCourseTitle || undefined,
        refresherYearAttended:   form.refresherYearAttended ? Number(form.refresherYearAttended) : undefined,
        refresherOrganisingBody: form.refresherOrganisingBody || undefined,
        refresherDuration:       form.refresherDuration || undefined,
        paymentMethod:           form.paymentMethod,
        transactionRef:          form.transactionRef || undefined,
      });

      const refNumber = res.data.referenceNumber;

      if (files.refresher) {
        await uploadRenewalDocument(refNumber, 'REFRESHER_CERTIFICATE', files.refresher);
      }
      if (files.idProof) {
        await uploadRenewalDocument(refNumber, 'ID_PROOF_RENEWAL', files.idProof);
      }

      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (result) {
    return (
      <div style={S.section}>
        <SectionCard style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 26, fontWeight: 600, color: COLORS.success, marginBottom: 8 }}>
            Renewal Submitted!
          </div>
          <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 20 }}>
            Renewal reference:{' '}
            <strong style={{ color: COLORS.primary }}>{result.referenceNumber}</strong>.{' '}
            Your updated certificate will be dispatched to your registered email upon approval.
          </p>
          <button style={S.btn('primary')} onClick={() => { setResult(null); setStep(1); setForm(initialForm); setVerifiedNurse(null); }}>
            Submit another renewal
          </button>
        </SectionCard>
      </div>
    );
  }

  return (
    <div style={S.section}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={S.sectionTitle}>License Renewal</div>
        <div style={{ height: 3, width: 50, background: COLORS.accent, margin: '8px 0 16px' }} />
        <p style={{ fontSize: 14, color: COLORS.textMuted }}>Renew your nursing registration — completely online</p>
      </div>

      <StepIndicator steps={steps} currentStep={step} completedSteps={completed} />

      {error && (
        <div style={{ background: COLORS.dangerBg, border: `1px solid #f1948a`, borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: COLORS.danger, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* ── Step 1: Verify ─────────────────────────────────────────────── */}
      {step === 1 && (
        <SectionCard>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 16 }}>
            Verify Your Registration
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Registration number" required>
              <Input placeholder="e.g. MSNC/GNM/2019/001234" value={form.registrationNumber} onChange={set('registrationNumber')} />
            </FormGroup>
            <FormGroup label="Registered mobile number" required>
              <Input type="tel" placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={set('mobile')} />
            </FormGroup>
            <FormGroup label="Full name" required>
              <Input placeholder="As per original certificate" value={form.fullName} onChange={set('fullName')} />
            </FormGroup>
            <FormGroup label="Date of birth" required>
              <Input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </FormGroup>
          </div>
          <BtnRow>
            <button
              style={{ ...S.btn('primary'), cursor: loading ? 'not-allowed' : 'pointer' }}
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>
          </BtnRow>
        </SectionCard>
      )}

      {/* ── Step 2: Refresher course ─────────────────────────────────────── */}
      {step === 2 && (
        <SectionCard>
          {verifiedNurse && (
            <div style={{ background: COLORS.successBg, border: `1px solid #82e0aa`, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              ✅ Verified: <strong>{verifiedNurse.name}</strong> — {verifiedNurse.course} — Status: <strong>{verifiedNurse.status}</strong>
            </div>
          )}
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>
            Refresher / Continuing Education Details
          </div>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
            Provide details of any refresher courses or CME programmes completed since your last renewal.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Course / CME title" required>
              <Input placeholder="e.g. Advanced wound care workshop" value={form.refresherCourseTitle} onChange={set('refresherCourseTitle')} />
            </FormGroup>
            <FormGroup label="Year attended" required>
              <Input type="number" placeholder="e.g. 2025" value={form.refresherYearAttended} onChange={set('refresherYearAttended')} />
            </FormGroup>
            <FormGroup label="Organising body" required>
              <Input placeholder="Hospital / institution name" value={form.refresherOrganisingBody} onChange={set('refresherOrganisingBody')} />
            </FormGroup>
            <FormGroup label="Duration (months/ years)" required>
              <Input placeholder="e.g. 6 months / 2 years" value={form.refresherDuration} onChange={set('refresherDuration')} />
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Upload refresher course certificate" required>
              <label style={{ ...S.fileUpload, cursor: 'pointer', display: 'block' }}>
                <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>📎</span>
                {files.refresher
                  ? <span style={{ color: COLORS.success, fontWeight: 600, fontSize: 13 }}>✓ {files.refresher.name}</span>
                  : 'Click to upload (PDF or JPG)'}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setFiles((f) => ({ ...f, refresher: e.target.files[0] }))} />
              </label>
            </FormGroup>
            <FormGroup label="Upload updated ID proof" required>
              <label style={{ ...S.fileUpload, cursor: 'pointer', display: 'block' }}>
                <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>📎</span>
                {files.idProof
                  ? <span style={{ color: COLORS.success, fontWeight: 600, fontSize: 13 }}>✓ {files.idProof.name}</span>
                  : 'Click to upload'}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setFiles((f) => ({ ...f, idProof: e.target.files[0] }))} />
              </label>
            </FormGroup>
          </div>
          <BtnRow>
            <button style={S.btn('secondary')} onClick={back}>← Back</button>
            <button style={S.btn('primary')} onClick={() => { if (!validateStep()) {
    return;
  }
 setStep(3); }}>Continue →</button>
          </BtnRow>
        </SectionCard>
      )}

      {/* ── Step 3: Payment ──────────────────────────────────────────────── */}
      {step === 3 && (
        <SectionCard>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 16 }}>
            Renewal Fee Payment
          </div>
          <div style={{ background: COLORS.lightGray, borderRadius: 6, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <tbody>
                {[['Renewal fee', '₹800.00'], ['Processing charge', '₹50.00']].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '6px 0', color: COLORS.textMuted }}>{k}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right' }}>{v}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${COLORS.border}`, fontWeight: 700 }}>
                  <td style={{ padding: '8px 0' }}>Total payable</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: COLORS.primary, fontSize: 16 }}>₹850.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Payment method" required>
              <Select value={form.paymentMethod} onChange={set('paymentMethod')}>
                {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="UPI ID / Transaction reference">
              <Input placeholder="UTR number or UPI transaction ID" value={form.transactionRef} onChange={set('transactionRef')} />
            </FormGroup>
          </div>
          <BtnRow>
            <button style={S.btn('secondary')} onClick={back}>← Back</button>
            <button
              style={{ ...S.btn('primary'), background: loading ? COLORS.textMuted : COLORS.success, cursor: loading ? 'not-allowed' : 'pointer' }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit Renewal ✓'}
            </button>
          </BtnRow>
        </SectionCard>
      )}
    </div>
  );
}
