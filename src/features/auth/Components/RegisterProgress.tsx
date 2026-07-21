"use client";

import { useState } from "react";

import AuthCard from "./AuthCard";
import RegisterProgress from "./RegisterProgress";

const STEPS = [
  "Account",
  "Basic",
  "Church",
  "Education",
  "Family",
  "Preferences",
  "Photos",
];

export default function RegisterWizard() {
  const [step, setStep] = useState(1);

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Begin your journey toward a Christ-centered marriage."
    >
      <RegisterProgress
        currentStep={step}
        totalSteps={STEPS.length}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">

        <h3 className="text-2xl font-bold text-[#0B2D5C]">
          {STEPS[step - 1]}
        </h3>

        <p className="mt-2 text-slate-500">
          Complete this section to continue.
        </p>

        <div className="mt-8 grid gap-5">

          <input
            placeholder="First Name"
            className="rounded-2xl border border-slate-300 p-4 focus:border-[#D4AF37] focus:outline-none"
          />

          <input
            placeholder="Last Name"
            className="rounded-2xl border border-slate-300 p-4 focus:border-[#D4AF37] focus:outline-none"
          />

          <input
            placeholder="Email Address"
            className="rounded-2xl border border-slate-300 p-4 focus:border-[#D4AF37] focus:outline-none"
          />

          <input
            placeholder="Mobile Number"
            className="rounded-2xl border border-slate-300 p-4 focus:border-[#D4AF37] focus:outline-none"
          />

        </div>

      </div>

      <div className="mt-10 flex items-center justify-between">

        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="rounded-xl border border-slate-300 px-6 py-3 font-semibold disabled:opacity-40"
        >
          Back
        </button>

        <button
          onClick={() =>
            setStep(Math.min(STEPS.length, step + 1))
          }
          className="rounded-xl bg-gradient-to-r from-[#0B2D5C] to-[#184E8C] px-8 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
        >
          Continue
        </button>

      </div>
    </AuthCard>
  );
}