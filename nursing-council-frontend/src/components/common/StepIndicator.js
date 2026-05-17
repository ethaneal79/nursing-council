import React from 'react';
import { S } from '../../styles/theme';

export function StepIndicator({ steps, currentStep, completedSteps }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const num = i + 1;
        const state = completedSteps.includes(num) ? "done" : currentStep === num ? "active" : "idle";
        return (
          <span key={num} style={S.stepPill(state)}>
            {state === "done" ? "✓ " : `${num}. `}{s}
          </span>
        );
      })}
    </div>
  );
}