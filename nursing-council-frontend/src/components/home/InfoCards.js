import React from 'react';
import { COLORS, S } from '../../styles/theme';
export default function InfoCards() {
  const infoItems = [
    {
      icon: "🏛️",
      title: "About Us",
      body: "Meghalaya State Nursing Council is a statutory body established under the Indian Nursing Council Act 1947, for regulation of the nursing profession across the state of Meghalaya.",
    },
    {
      icon: "🎯",
      title: "Mission",
      body: "Learner-centred quality education, skill upgradation, and training to all by using innovative technologies, ensuring integrated development of nursing professionals.",
    },
    {
      icon: "🏢",
      title: "Infrastructure",
      body: "The council operates from Shillong with district representatives across all 12 districts of Meghalaya, providing accessible services to every registered nurse.",
    },
  ];

  return (
    <div style={{ background: COLORS.lightGray }}>
      <div style={S.section}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {infoItems.map((item) => (
            <div key={item.title} style={{ ...S.card(false), textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>
                {item.title}
              </div>
              <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.7 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}