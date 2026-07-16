"use client";

import { useState } from "react";

const TOTAL_STEPS = 7;

export function useProfileWizard() {
  const [step, setStep] = useState(0);

  const next = () => {
    setStep((current) =>
      Math.min(current + 1, TOTAL_STEPS - 1)
    );
  };

  const back = () => {
    setStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  const goTo = (stepNumber: number) => {
    if (stepNumber >= 0 && stepNumber < TOTAL_STEPS) {
      setStep(stepNumber);
    }
  };

  return {
    step,
    next,
    back,
    goTo,
    totalSteps: TOTAL_STEPS,
    isFirstStep: step === 0,
    isLastStep: step === TOTAL_STEPS - 1,
  };
}