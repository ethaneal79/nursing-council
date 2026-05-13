import React from 'react';
import { COLORS, S } from '../../styles/theme';

export default function Footer({ setPage }) {
  return (
    <footer style={S.footer}>
      <div style={S.footerInner}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: COLORS.white, marginBottom: 10 }}>
              Meghalaya State Nursing Council
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.65 }}>
              A statutory body under the Government of Meghalaya, regulating the nursing profession across the state under the Indian Nursing Council Act 1947.
            </p>
            <p style={{ fontSize: 12, marginTop: 12, opacity: 0.5 }}>📍 Shillong, Meghalaya – 793001</p>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accentLight, marginBottom: 10, letterSpacing: 0.5 }}>QUICK LINKS</div>
            {[["Home", "home"], ["About Us", "about"], ["New Registration", "register"], ["Renewal", "renew"], ["Verify Certificate", "verify"]].map(([label, id]) => (
              <div key={id} style={{ padding: "4px 0", fontSize: 13, opacity: 0.7, cursor: "pointer" }} onClick={() => setPage(id)}>
                › {label}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accentLight, marginBottom: 10, letterSpacing: 0.5 }}>SERVICES</div>
            {["New Registration", "License Renewal", "Certificate Verification", "Track Application", "Search Registration"].map((s) => (
              <div key={s} style={{ padding: "4px 0", fontSize: 13, opacity: 0.7 }}>› {s}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accentLight, marginBottom: 10, letterSpacing: 0.5 }}>CONTACT</div>
            <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.8 }}>
              <div>📞 +91-364-222-XXXX</div>
              <div>📧 msnc@meghalaya.gov.in</div>
              <div style={{ marginTop: 8 }}>Mon – Fri</div>
              <div>10:00 AM – 4:00 PM</div>
            </div>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            opacity: 0.55,
          }}
        >
          <span>Copyright © 2026 Meghalaya State Nursing Council | All Rights Reserved</span>
          <span>Designed & Developed for Government of Meghalaya</span>
        </div>
      </div>
    </footer>
  );
}