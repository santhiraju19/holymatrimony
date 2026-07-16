"use client";

interface ProfileStepperProps {
  currentStep: number;
}

const steps = [
  "Basic",
  "Church",
  "Education",
  "Family",
  "Preferences",
  "Photos",
  "Review",
];

export default function ProfileStepper({
  currentStep,
}: ProfileStepperProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;

          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <div
              key={step}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all
                    ${
                      completed
                        ? "border-green-600 bg-green-600 text-white"
                        : active
                        ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                        : "border-slate-300 bg-white text-slate-500"
                    }`}
                >
                  {completed ? "✓" : stepNumber}
                </div>

                <p
                  className={`mt-2 text-sm font-medium ${
                    active
                      ? "text-[#0B2D5C]"
                      : "text-slate-500"
                  }`}
                >
                  {step}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`mx-3 h-1 flex-1 rounded-full ${
                    completed
                      ? "bg-green-600"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}