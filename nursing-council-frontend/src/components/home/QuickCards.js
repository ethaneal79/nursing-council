import React, { useState } from 'react';
import { COLORS, S } from '../../styles/theme';

export default function QuickCards({ setPage }) {
  const [hovered, setHovered] = useState(null);

  const quickCards = [
    {
      id: "register",
      icon: "📝",
      title: "New Registration",
      desc: "Apply for first-time nurse registration",
    },
    {
      id: "renew",
      icon: "🔄",
      title: "Renewal",
      desc: "Renew your existing nursing license",
    },
    {
      id: "verify",
      icon: "✅",
      title: "Verify Certificate",
      desc: "Verify authenticity of a MSNC certificate",
    },
    {
      id: "status",
      icon: "🔍",
      title: "Track Application",
      desc: "Check your application status",
    },
  ];

  return (
    <div style={{ background: COLORS.offWhite, padding: "0 0 2.5rem" }}>
      <div style={S.section}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ ...S.sectionTitle, display: "block", borderBottom: "none", paddingBottom: 0 }}>Our Services</div>
          <div style={{ width: 60, height: 3, background: COLORS.accent, margin: "8px auto 0" }} />
          <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 10 }}>Access all council services online — fast, secure, and paperless</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {quickCards.map((c) => (
            <div
              key={c.id}
              style={S.card(hovered === c.id)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setPage(c.id)}
            >
              <div
                style={{
                  height: 120,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  marginBottom: 14,
                }}
              >
                {c.icon}
              </div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 4 }}>
                {c.title}
              </div>
              <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 12 }}>{c.desc}</p>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.primaryLight,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Proceed →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}