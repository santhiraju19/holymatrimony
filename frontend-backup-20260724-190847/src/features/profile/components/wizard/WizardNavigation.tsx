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
    <div className="mt-10 flex items-center justify-between">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className="rounded-xl bg-slate-300 px-6 py-3 text-white disabled:opacity-50"
      >
        Back
      </button>

      <span className="text-sm text-slate-500">
        Step {currentStep + 1} of {totalSteps}
      </span>

      <button
        onClick={onNext}
        className="rounded-xl bg-[#0B2D5C] px-6 py-3 font-semibold text-white hover:bg-[#123C73]"
      >
        {currentStep === totalSteps - 1 ? "Finish" : "Continue"}
      </button>
    </div>
  );
}