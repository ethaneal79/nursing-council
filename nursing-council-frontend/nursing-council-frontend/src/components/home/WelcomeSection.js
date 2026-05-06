import React from 'react';
import { COLORS, S } from '../../styles/theme';

export default function WelcomeSection() {
  return (
    <div>
      <div style={S.sectionTitle}>Welcome to MSNC</div>
      <div style={{ height: 3, width: 50, background: COLORS.accent, margin: "8px 0 20px" }} />
      <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.textMuted, marginBottom: 14 }}>
        Dear Colleagues and Friends,
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.text, marginBottom: 14 }}>
        I am humbled, honoured and privileged to serve as President of the Meghalaya State Nursing Council — a statutory body established for the regulation of the nursing profession in the State of Meghalaya. I am deeply committed to contributing to the betterment of services provided by this Council.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.text, marginBottom: 20 }}>
        It is my vision to ensure that all nursing professionals in Meghalaya can access registration and renewal services digitally, reducing paperwork and travel. This portal is the first step towards a fully transparent, efficient, and accessible council for all nurses across our state's twelve districts.
      </p>
      <div
        style={{
          borderLeft: `4px solid ${COLORS.accent}`,
          paddingLeft: 16,
          fontFamily: "'EB Garamond', serif",
          fontSize: 17,
          color: COLORS.primary,
          fontStyle: "italic",
        }}
      >
        "I am confident that my actions will speak louder than my words, and all nursing professionals in Meghalaya will appreciate the efforts we have put forth."
      </div>
    </div>
  );
}