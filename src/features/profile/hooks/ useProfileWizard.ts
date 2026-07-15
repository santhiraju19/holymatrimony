"use client";

import { useState } from "react";

export function useProfileWizard() {
  const [step, setStep] = useState(0);

  const next = () => setStep((prev) => prev + 1);

  const back = () => setStep((prev) => Math.max(0, prev - 1));

  return {
    step,
    next,
    back,
  };
}