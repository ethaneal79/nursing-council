import React, { useState } from 'react';
import { COLORS, S } from '../../styles/theme';

export function Select({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{ ...S.input, borderColor: focused ? COLORS.primary : COLORS.border }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}