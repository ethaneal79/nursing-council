import React from 'react';
import { COLORS, S } from '../../styles/theme';

export function FormGroup({ label, required, children }) {
  return (
    <div style={S.formGroup}>
      <label style={S.label}>
        {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
      </label>
      {children}
    </div>
  );
}