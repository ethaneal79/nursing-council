import React from 'react';

export function BtnRow({ children }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.25rem" }}>
      {children}
    </div>
  );
}