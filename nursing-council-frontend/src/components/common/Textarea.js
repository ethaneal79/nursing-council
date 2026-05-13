import React, { useState } from 'react';
import { COLORS, S } from '../../styles/theme';

export function Textarea({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{ ...S.input, borderColor: focused ? COLORS.primary : COLORS.border, resize: "vertical" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}