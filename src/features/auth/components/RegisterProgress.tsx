"use client";

interface RegisterProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function RegisterProgress({
  currentStep,
  totalSteps,
}: RegisterProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          Step {currentStep} of {totalSteps}
        </span>

        <span className="text-sm font-semibold text-[#0B2D5C]">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] to-[#D4AF37] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
