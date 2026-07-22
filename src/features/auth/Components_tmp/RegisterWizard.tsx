"use client";

import { useState } from "react";
import AuthCard from "./AuthCard";

const steps = [
  "Account",
  "Basic",
  "Church",
  "Education",
  "Family",
  "Preferences",
  "Complete",
];

export default function RegisterWizard() {
  const [step, setStep] = useState(0);

  return (
    <AuthCard
      title="Create Account"
      subtitle="Begin your journey towards a Christ-centered marriage."
    >
      <div className="space-y-8">

        <div className="flex justify-between">

          {steps.map((item, index) => (
            <div
              key={item}
              className="flex flex-1 flex-col items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  index <= step
                    ? "bg-[#0B2D5C] text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {index + 1}
              </div>

              <span className="mt-2 text-xs">
                {item}
              </span>
            </div>
          ))}

        </div>

        <div className="rounded-2xl border border-slate-200 p-8">

          <h3 className="text-xl font-bold text-[#0B2D5C]">
            {steps[step]}
          </h3>

          <p className="mt-3 text-slate-500">
            Step {step + 1} of {steps.length}
          </p>

          <div className="mt-8 grid gap-4">

            <input
              className="rounded-xl border p-3"
              placeholder="Sample Field"
            />

            <input
              className="rounded-xl border p-3"
              placeholder="Sample Field"
            />

          </div>

        </div>

        <div className="flex justify-between">

          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="rounded-xl border px-6 py-3 disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={() =>
              setStep(
                Math.min(step + 1, steps.length - 1)
              )
            }
            className="rounded-xl bg-[#0B2D5C] px-6 py-3 text-white"
          >
            Continue
          </button>

        </div>

      </div>
    </AuthCard>
  );
}