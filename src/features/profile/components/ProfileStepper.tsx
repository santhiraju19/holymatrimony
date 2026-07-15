const steps = [
  "Basic",
  "Church",
  "Education",
  "Family",
  "Preferences",
  "Photos",
  "Review",
];

interface Props {
  currentStep: number;
}

export default function ProfileStepper({
  currentStep,
}: Props) {
  return (
    <div className="mb-10 flex items-center justify-between">
      {steps.map((step, index) => (
        <div
          key={step}
          className="flex flex-1 items-center"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
              index <= currentStep
                ? "bg-[#0B2D5C]"
                : "bg-slate-300"
            }`}
          >
            {index + 1}
          </div>

          {index !== steps.length - 1 && (
            <div
              className={`h-1 flex-1 ${
                index < currentStep
                  ? "bg-[#0B2D5C]"
                  : "bg-slate-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}