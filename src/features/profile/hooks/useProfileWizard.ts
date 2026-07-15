"use client";

import { useState } from "react";

export function useProfileWizard() {
  const [step, setStep] = useState(0);

  return {
    step,
    next: () => setStep((s) => s + 1),
    back: () => setStep((s) => Math.max(0, s - 1)),
  };
}