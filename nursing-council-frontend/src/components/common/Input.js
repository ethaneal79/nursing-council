import React, { useState } from 'react';
import { COLORS, S } from '../../styles/theme';

export function Input({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ ...S.input, borderColor: focused ? COLORS.primary : COLORS.border }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}