"use client";

import {
  Camera,
  Check,
  Church,
  ClipboardCheck,
  GraduationCap,
  Heart,
  UserRound,
  UsersRound,
} from "lucide-react";

interface ProfileStepperProps {
  currentStep: number;
}

const steps = [
  {
    name: "Basic",
    description: "Personal information",
    icon: UserRound,
  },
  {
    name: "Church",
    description: "Faith and church",
    icon: Church,
  },
  {
    name: "Education",
    description: "Career background",
    icon: GraduationCap,
  },
  {
    name: "Family",
    description: "Family information",
    icon: UsersRound,
  },
  {
    name: "Preferences",
    description: "Partner expectations",
    icon: Heart,
  },
  {
    name: "Photos",
    description: "Optional profile photos",
    icon: Camera,
  },
  {
    name: "Review",
    description: "Review and save",
    icon: ClipboardCheck,
  },
];

export default function ProfileStepper({
  currentStep,
}: ProfileStepperProps) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B38B19]">
          Profile journey
        </p>

        <h2 className="mt-1 text-lg font-black text-[#0B2D5C]">
          Your steps
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto p-4 xl:block xl:space-y-2 xl:overflow-visible">
        {steps.map(
          (step, index) => {
            const stepNumber =
              index + 1;

            const completed =
              stepNumber <
              currentStep;

            const active =
              stepNumber ===
              currentStep;

            const Icon = step.icon;

            return (
              <div
                key={step.name}
                aria-current={
                  active
                    ? "step"
                    : undefined
                }
                className={[
                  "relative flex min-w-[210px] items-center gap-3 rounded-2xl border px-3 py-3 transition-all xl:min-w-0",
                  completed
                    ? "border-emerald-200 bg-emerald-50"
                    : active
                      ? "border-[#D4AF37] bg-gradient-to-r from-amber-50 to-yellow-50 shadow-[0_10px_25px_rgba(212,175,55,0.14)]"
                      : "border-transparent bg-slate-50",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#D4AF37]" />
                )}

                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                    completed
                      ? "bg-emerald-600 text-white"
                      : active
                        ? "bg-[#0B2D5C] text-white shadow-md"
                        : "bg-white text-slate-400 ring-1 ring-slate-200",
                  ].join(" ")}
                >
                  {completed ? (
                    <Check size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={[
                        "truncate text-sm font-black",
                        active
                          ? "text-[#0B2D5C]"
                          : completed
                            ? "text-emerald-800"
                            : "text-slate-600",
                      ].join(" ")}
                    >
                      {step.name}
                    </p>

                    <span
                      className={[
                        "text-[10px] font-bold uppercase tracking-wide",
                        completed
                          ? "text-emerald-600"
                          : active
                            ? "text-[#B38B19]"
                            : "text-slate-400",
                      ].join(" ")}
                    >
                      {completed
                        ? "Done"
                        : active
                          ? "Current"
                          : stepNumber}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}