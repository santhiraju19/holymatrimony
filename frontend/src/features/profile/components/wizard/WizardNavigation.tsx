interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: WizardNavigationProps) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className="w-full rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
      >
        Back
      </button>

      <span className="text-center text-xs font-semibold text-slate-500 sm:text-sm">
        Step {currentStep + 1} of {totalSteps}
      </span>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123C73] sm:w-auto"
      >
        {currentStep === totalSteps - 1 ? "Finish" : "Continue"}
      </button>
    </div>
  );
}