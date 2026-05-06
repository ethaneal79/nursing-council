import React from 'react';
import { COLORS, S } from '../../styles/theme';

export default function HeroSection({ setPage }) {
  return (
    <div style={S.hero}>
      <div style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, borderRadius: "50%", border: "40px solid rgba(255,255,255,0.04)", zIndex: 0 }} />
      <div style={{ position: "absolute", right: 60, bottom: -80, width: 200, height: 200, borderRadius: "50%", border: "30px solid rgba(200,168,75,0.08)", zIndex: 0 }} />
      <div style={S.heroInner}>
        <div style={{ flex: 1 }}>
          <span style={S.heroBadge}>Government of Meghalaya</span>
          <h1 style={S.heroTitle}>Meghalaya State<br />Nursing Council</h1>
          <p style={S.heroSub}>
            A statutory body under the Government of Meghalaya, regulating nursing professionals across the state. Online registration, renewal, and certificate verification now available.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button style={S.btn("primary")} onClick={() => setPage("register")}>
              Apply for Registration →
            </button>
            <button
              style={{ ...S.btn("secondary"), borderColor: "rgba(255,255,255,0.4)", color: COLORS.white }}
              onClick={() => setPage("verify")}
            >
              Verify Certificate
            </button>
          </div>
        </div>
        <div
          style={{
            flex: "0 0 260px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "1.5rem",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accentLight, marginBottom: 14, letterSpacing: 0.5 }}>
            COUNCIL AT A GLANCE
          </div>
          {[
            ["3,240+", "Registered Nurses"],
            ["12", "Districts Covered"],
            ["5–7 days", "Avg. Processing Time"],
            ["100%", "Online Services"],
          ].map(([val, label]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>{label}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.accentLight }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}