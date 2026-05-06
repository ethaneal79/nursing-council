import React from 'react';
import { COLORS } from '../../styles/theme';

export function SectionCard({ children, style = {} }) {
  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        padding: "1.5rem",
        marginBottom: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}