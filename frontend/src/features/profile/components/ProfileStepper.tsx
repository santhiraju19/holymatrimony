
"use client";

import {
  Camera,
  Check,
  Church,
  ClipboardCheck,
  GraduationCap,
  Heart,
  Pencil,
  UserRound,
  UsersRound,
} from "lucide-react";

interface ProfileStepperProps {
  currentStep: number;

  onStepClick?: (
    stepNumber: number
  ) => void;
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
  onStepClick,
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

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Select any step to review or edit your
          profile information.
        </p>
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

            const Icon =
              step.icon;

            const clickable =
              Boolean(
                onStepClick
              );

            return (
              <button
                key={step.name}
                type="button"
                aria-current={
                  active
                    ? "step"
                    : undefined
                }
                disabled={
                  !clickable
                }
                onClick={() => {
                  if (!onStepClick) {
                    return;
                  }

                  onStepClick(
                    stepNumber
                  );
                }}
                className={[
                  "group relative flex min-w-[175px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all xl:min-w-0 xl:w-full",

                  completed
                    ? "border-emerald-200 bg-emerald-50"
                    : active
                      ? "border-[#D4AF37] bg-gradient-to-r from-amber-50 to-yellow-50 shadow-[0_10px_25px_rgba(212,175,55,0.14)]"
                      : "border-transparent bg-slate-50",

                  clickable
                    ? "cursor-pointer hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2D5C]/30"
                    : "cursor-default",

                  !active &&
                  clickable
                    ? "hover:bg-blue-50/60"
                    : "",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#D4AF37]" />
                )}

                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",

                    completed
                      ? "bg-emerald-600 text-white"
                      : active
                        ? "bg-[#0B2D5C] text-white shadow-md"
                        : "bg-white text-slate-400 ring-1 ring-slate-200",

                    clickable
                      ? "group-hover:scale-105"
                      : "",
                  ].join(" ")}
                >
                  {completed ? (
                    <Check
                      size={20}
                    />
                  ) : (
                    <Icon
                      size={20}
                    />
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
                        "shrink-0 text-[10px] font-bold uppercase tracking-wide",

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

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-500">
                      {step.description}
                    </p>

                    {clickable &&
                      !active && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#0B2D5C] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                          <Pencil
                            size={11}
                          />
                          Edit
                        </span>
                      )}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}