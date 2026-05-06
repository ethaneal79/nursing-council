import React from 'react';
import { COLORS, S } from '../../styles/theme';

export default function Navbar({ page, setPage, navItems }) {
  return (
    <nav style={S.navbar}>
      <div style={S.navInner}>
        <div style={S.navLogo}>
          <div style={S.logoCircle}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, lineHeight: 1 }}>MSNC</span>
          </div>
          <div style={S.logoText}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Meghalaya State Nursing Council</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>Government of Meghalaya</div>
          </div>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            style={S.navLink(page === item.id)}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}