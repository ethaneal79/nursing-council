import React, { useState } from 'react';
import { COLORS, S } from '../styles/theme';
import { FormGroup } from '../components/common/FormGroup';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { StepIndicator } from '../components/common/StepIndicator';
import { SectionCard } from '../components/common/SectionCard';
import { BtnRow } from '../components/common/BtnRow';
import {
  submitRegistration,
  uploadRegistrationDocument,
} from '../services/api';

// Document slots required on step 3
const DOCUMENT_SLOTS = [
  { key: 'PHOTOGRAPH',               label: 'Passport-size photograph',         required: true  },
  { key: 'IDENTITY_PROOF',           label: 'Identity proof (Aadhaar / Voter ID)', required: true  },
  { key: 'COURSE_CERTIFICATE',       label: 'Nursing course certificate',        required: true  },
  { key: 'MARKSHEET',                label: 'Marksheet / Transcript',            required: true  },
  { key: 'INTERNSHIP_CERTIFICATE',   label: 'Internship completion certificate', required: true  },
  { key: 'CHARACTER_CERTIFICATE',    label: 'Character certificate',             required: false },
];

const COURSE_OPTIONS = [
  { value: 'GNM',            label: 'GNM (General Nursing & Midwifery)' },
  { value: 'BSC_NURSING',    label: 'B.Sc Nursing' },
  { value: 'POST_BASIC_BSC', label: 'Post Basic B.Sc Nursing' },
  { value: 'MSC_NURSING',    label: 'M.Sc Nursing' },
  { value: 'ANM',            label: 'ANM (Auxiliary Nurse Midwifery)' },
];

const PAYMENT_OPTIONS = [
  { value: 'UPI',           label: 'UPI / QR Code' },
  { value: 'NET_BANKING',   label: 'Net Banking' },
  { value: 'CARD',          label: 'Debit / Credit Card' },
  { value: 'DEMAND_DRAFT',  label: 'Demand Draft' },
];

const initialForm = {
  // Step 1
  fullName: '', dateOfBirth: '', gender: '', nationality: 'Indian',
  email: '', mobile: '', permanentAddress: '',
  // Step 2
  courseName: '', yearOfPassing: '', institutionName: '',
  universityOrBoard: '', examRollNumber: '', previousCouncilRegNo: '',
  // Step 4
  paymentMethod: 'UPI', transactionRef: '',
};

export default function RegisterPage() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState(initialForm);
  const [files, setFiles] = useState({});          // { PHOTOGRAPH: File, … }
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);    // ApplicationResponse

  const steps     = ['Personal details', 'Course details', 'Upload documents', 'Pay fee'];
  const completed = Array.from({ length: step - 1 }, (_, i) => i + 1);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validateStep = () => {

  // STEP 1 — PERSONAL DETAILS
  if (step === 1) {

    if (!form.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!form.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }

    if (!form.gender) {
      setError('Please select gender');
      return false;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      setError('Enter valid email address');
      return false;
    }

    const mobileRegex =
      /^[0-9]{10}$/;

    if (!mobileRegex.test(form.mobile)) {
      setError('Mobile number must be 10 digits');
      return false;
    }

    if (!form.permanentAddress.trim()) {
      setError('Permanent address is required');
      return false;
    }
  }

  // STEP 2 — COURSE DETAILS
  if (step === 2) {

    if (!form.courseName) {
      setError('Please select course');
      return false;
    }

    if (!form.yearOfPassing) {
      setError('Year of passing is required');
      return false;
    }

    const year = Number(form.yearOfPassing);

    if (
      year < 1950 ||
      year > new Date().getFullYear()
    ) {
      setError('Enter valid year of passing');
      return false;
    }

    if (!form.institutionName.trim()) {
      setError('Institution name is required');
      return false;
    }

    if (!form.universityOrBoard.trim()) {
      setError('University/Board is required');
      return false;
    }
    if (!form.examRollNumber.trim()) {
  setError('Examination roll number is required');
  return false;
}
  }

  // STEP 3 — DOCUMENTS
  if (step === 3) {

    const requiredDocs = [
      'PHOTOGRAPH',
      'IDENTITY_PROOF',
      'COURSE_CERTIFICATE',
      'MARKSHEET',
      'INTERNSHIP_CERTIFICATE'
    ];

    for (const doc of requiredDocs) {

      if (!files[doc]) {
        setError(`${doc.replaceAll('_', ' ')} is required`);
        return false;
      }

      const file = files[doc];

      // MAX 5 MB
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} exceeds 5 MB`);
        return false;
      }

      // FILE TYPE
      const allowed = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];

      if (!allowed.includes(file.type)) {
        setError(`${file.name} has invalid format`);
        return false;
      }
    }
  }

  // STEP 4 — PAYMENT
  if (step === 4) {

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
  const next = () => {

  setError('');

  if (validateStep()) {

    setStep((s) => Math.min(s + 1, 4));

  }
};
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 1)); };

  const handleFileChange = (docType) => (e) => {
    const file = e.target.files[0];
    if (file) setFiles((f) => ({ ...f, [docType]: file }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
  return;
}
    setLoading(true);
    setError('');
    try {
      // 1 – submit registration (personal + course + payment)
      const res = await submitRegistration({
        fullName:            form.fullName,
        dateOfBirth:         form.dateOfBirth,
        gender:              form.gender,
        nationality:         form.nationality,
        email:               form.email,
        mobile:              form.mobile,
        permanentAddress:    form.permanentAddress,
        courseName:          form.courseName,
        yearOfPassing:       Number(form.yearOfPassing),
        institutionName:     form.institutionName,
        universityOrBoard:   form.universityOrBoard,
        examRollNumber:      form.examRollNumber || undefined,
        previousCouncilRegNo: form.previousCouncilRegNo || undefined,
        paymentMethod:       form.paymentMethod,
        transactionRef:      form.transactionRef || undefined,
      });

      const refNumber = res.data.referenceNumber;

      // 2 – upload documents (fire-and-wait sequentially)
      for (const slot of DOCUMENT_SLOTS) {
        if (files[slot.key]) {
          await uploadRegistrationDocument(refNumber, slot.key, files[slot.key]);
        }
      }

      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
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
            Application Submitted Successfully!
          </div>
          <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 20 }}>
            Your reference number is{' '}
            <strong style={{ color: COLORS.primary }}>{result.referenceNumber}</strong>.{' '}
            You will be notified via email and SMS once your application is processed (5–7 working days).
          </p>
          <button style={S.btn('primary')} onClick={() => { setResult(null); setStep(1); setForm(initialForm); setFiles({}); }}>
            Submit another application
          </button>
        </SectionCard>
      </div>
    );
  }

  return (
    <div style={S.section}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={S.sectionTitle}>New Nurse Registration</div>
        <div style={{ height: 3, width: 50, background: COLORS.accent, margin: '8px 0 16px' }} />
        <p style={{ fontSize: 14, color: COLORS.textMuted }}>Complete all steps to register with Meghalaya State Nursing Council</p>
      </div>

      <StepIndicator steps={steps} currentStep={step} completedSteps={completed} />

      {error && (
        <div style={{ background: COLORS.dangerBg, border: `1px solid #f1948a`, borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: COLORS.danger, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* ── Step 1: Personal Details ─────────────────────────────────────── */}
      {step === 1 && (
        <SectionCard>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 16 }}>
            Step 1: Personal Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Full name" required>
              <Input placeholder="As per certificate" value={form.fullName} onChange={set('fullName')} />
            </FormGroup>
            <FormGroup label="Date of birth" required>
              <Input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </FormGroup>
            <FormGroup label="Gender" required>
              <Select value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormGroup>
            <FormGroup label="Nationality">
              <Input value={form.nationality} onChange={set('nationality')} />
            </FormGroup>
            <FormGroup label="Email address" required>
              <Input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
            </FormGroup>
            <FormGroup label="Mobile number" required>
              <Input type="tel" placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={set('mobile')} />
            </FormGroup>
          </div>
          <FormGroup label="Permanent address" required>
            <Textarea rows={2} placeholder="Full address, district, state, PIN code" value={form.permanentAddress} onChange={set('permanentAddress')} />
          </FormGroup>
          <BtnRow><button style={S.btn('primary')} onClick={next}>Continue →</button></BtnRow>
        </SectionCard>
      )}

      {/* ── Step 2: Course Details ───────────────────────────────────────── */}
      {step === 2 && (
        <SectionCard>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 16 }}>
            Step 2: Nursing Course Details
          </div>
          <div style={S.infoBox}>Please provide details of your qualifying nursing course and training institution.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Course name" required>
              <Select value={form.courseName} onChange={set('courseName')}>
                <option value="">Select course</option>
                {COURSE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Year of passing" required>
              <Input type="number" placeholder="e.g. 2023" value={form.yearOfPassing} onChange={set('yearOfPassing')} />
            </FormGroup>
            <FormGroup label="Institution name" required>
              <Input placeholder="Name of nursing school/college" value={form.institutionName} onChange={set('institutionName')} />
            </FormGroup>
            <FormGroup label="University/Board" required>
              <Input placeholder="Affiliated university or board" value={form.universityOrBoard} onChange={set('universityOrBoard')} />
            </FormGroup>
            <FormGroup label="Examination roll number" required>
              <Input placeholder="Roll number on marksheet" value={form.examRollNumber} onChange={set('examRollNumber')} />
            </FormGroup>
            <FormGroup label="Previous council reg. no.">
              <Input placeholder="If previously registered" value={form.previousCouncilRegNo} onChange={set('previousCouncilRegNo')} />
            </FormGroup>
          </div>
          <BtnRow>
            <button style={S.btn('secondary')} onClick={back}>← Back</button>
            <button style={S.btn('primary')} onClick={next}>Continue →</button>
          </BtnRow>
        </SectionCard>
      )}

      {/* ── Step 3: Upload Documents ─────────────────────────────────────── */}
      {step === 3 && (
        <SectionCard>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 16 }}>
            Step 3: Upload Documents
          </div>
          <div style={S.infoBox}>All documents must be clear scans or photos in PDF or JPG format. Maximum 5 MB per file.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {DOCUMENT_SLOTS.map(({ key, label, required }) => (
              <FormGroup key={key} label={label} required={required}>
                <label style={{ ...S.fileUpload, cursor: 'pointer', display: 'block' }}>
                  <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>📎</span>
                  {files[key] ? (
                    <span style={{ color: COLORS.success, fontWeight: 600, fontSize: 13 }}>✓ {files[key].name}</span>
                  ) : (
                    <span>Click to upload {required ? '(required)' : '(optional)'}</span>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange(key)} />
                </label>
              </FormGroup>
            ))}
          </div>
          <BtnRow>
            <button style={S.btn('secondary')} onClick={back}>← Back</button>
            <button style={S.btn('primary')} onClick={next}>Continue →</button>
          </BtnRow>
        </SectionCard>
      )}

      {/* ── Step 4: Payment ──────────────────────────────────────────────── */}
      {step === 4 && (
        <SectionCard>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 16 }}>
            Step 4: Registration Fee Payment
          </div>
          <div style={{ background: COLORS.lightGray, borderRadius: 6, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <tbody>
                {[['Registration fee', '₹1,500.00'], ['Processing charge', '₹50.00']].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '6px 0', color: COLORS.textMuted }}>{k}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right' }}>{v}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${COLORS.border}`, fontWeight: 700 }}>
                  <td style={{ padding: '8px 0' }}>Total payable</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: COLORS.primary, fontSize: 16 }}>₹1,550.00</td>
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
          <div style={S.infoBox}>
            After submitting, you will receive a confirmation on your registered email and mobile. Processing takes 5–7 working days.
          </div>
          <BtnRow>
            <button style={S.btn('secondary')} onClick={back}>← Back</button>
            <button
              style={{ ...S.btn('primary'), background: loading ? COLORS.textMuted : COLORS.success, cursor: loading ? 'not-allowed' : 'pointer' }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit Application ✓'}
            </button>
          </BtnRow>
        </SectionCard>
      )}
    </div>
  );
}
