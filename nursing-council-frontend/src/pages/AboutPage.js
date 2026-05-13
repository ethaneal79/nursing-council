import React from 'react';
import { COLORS, S } from '../styles/theme';
import { SectionCard } from '../components/common/SectionCard';

export default function AboutPage() {
  return (
    <div style={S.section}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={S.sectionTitle}>About the Council</div>
        <div style={{ height: 3, width: 50, background: COLORS.accent, margin: "8px 0 16px" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div>
          <SectionCard>
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 12 }}>
              About Meghalaya State Nursing Council
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.text, marginBottom: 12 }}>
              The Meghalaya State Nursing Council (MSNC) is a statutory body established under the Indian Nursing Council Act 1947, for the regulation of the nursing profession in the State of Meghalaya. The Council registers and regulates nurses, nursing midwives, and auxiliary nurse midwives (ANM) throughout the state.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.text, marginBottom: 12 }}>
              The council's primary objective is to maintain the minimum standard of nursing education and practice in the state, and to protect patients and the public by ensuring that all practising nurses are properly trained and registered.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.text }}>
              The council works in coordination with the Indian Nursing Council (INC), New Delhi, and the Government of Meghalaya, Department of Health & Family Welfare.
            </p>
          </SectionCard>
          <SectionCard>
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 12 }}>
              Functions of the Council
            </div>
            {[
              "Registration of qualified nurses, midwives, and ANMs in Meghalaya",
              "Prescription of standards for nursing education in the state",
              "Maintenance of registers of all registered nurses",
              "Granting of recognition to nursing educational institutions",
              "Issuing certificates of registration and renewal",
              "Cancellation of registration for misconduct or disqualification",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none" }}>
                <span style={{ color: COLORS.accent, fontWeight: 700, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </SectionCard>
        </div>
        <div>
          <SectionCard style={{ background: COLORS.primary, border: "none" }}>
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, fontWeight: 600, color: COLORS.accentLight, marginBottom: 14 }}>
              Council Address
            </div>
            {[
              ["📍", "Secretariat Hills, Shillong,\nMeghalaya – 793001"],
              ["📞", "+91-364-222 XXXX"],
              ["📧", "msnc@meghalaya.gov.in"],
              ["🕒", "Mon–Fri: 10:00 AM – 4:00 PM"],
            ].map(([icon, text]) => (
              <div key={icon} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{text}</span>
              </div>
            ))}
          </SectionCard>
          <SectionCard>
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, fontWeight: 600, color: COLORS.primary, marginBottom: 12 }}>
              Useful Links
            </div>
            {[
              "Indian Nursing Council (INC)",
              "Dept. of Health & Family Welfare, Meghalaya",
              "National Health Mission (NHM) Meghalaya",
              "Nursing Council of India Act 1947",
            ].map((l) => (
              <div key={l} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.primaryLight, cursor: "pointer" }}>
                🔗 {l}
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}