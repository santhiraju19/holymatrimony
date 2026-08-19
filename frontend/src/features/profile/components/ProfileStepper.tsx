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
    description:
      "Personal information",
    icon: UserRound,
  },
  {
    name: "Church",
    description:
      "Faith and church",
    icon: Church,
  },
  {
    name: "Education",
    description:
      "Career background",
    icon: GraduationCap,
  },
  {
    name: "Family",
    description:
      "Family information",
    icon: UsersRound,
  },
  {
    name: "Preferences",
    description:
      "Partner expectations",
    icon: Heart,
  },
  {
    name: "Photos",
    description:
      "Optional profile photos",
    icon: Camera,
  },
  {
    name: "Review",
    description:
      "Review and save",
    icon: ClipboardCheck,
  },
];

export default function ProfileStepper({
  currentStep,
  onStepClick,
}: ProfileStepperProps) {
  const safeCurrentStep =
    Math.min(
      Math.max(
        currentStep,
        1
      ),
      steps.length
    );

  const progress =
    Math.round(
      (safeCurrentStep /
        steps.length) *
        100
    );

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_7px_22px_rgba(15,23,42,0.045)]">

      {/* =====================================================
          Compact Header
          ===================================================== */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/55 px-3.5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.13em] text-[#B38B19] sm:text-[9px]">
              Profile journey
            </p>

            <h2 className="mt-0.5 text-sm font-black text-[#0B2D5C]">
              Your Steps
            </h2>

            <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
              Select any section to review or edit.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-black text-[#0B2D5C]">
              {safeCurrentStep}
              <span className="text-slate-300">
                /
              </span>
              {steps.length}
            </p>

            <p className="text-[9px] font-bold text-slate-400">
              Current step
            </p>
          </div>
        </div>

        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] via-blue-600 to-[#D4AF37] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          Journey
          ===================================================== */}

      <div className="flex gap-2 overflow-x-auto p-2.5 xl:block xl:space-y-1.5 xl:overflow-visible">
        {steps.map(
          (journeyStep, index) => {
            const stepNumber =
              index + 1;

            const completed =
              stepNumber <
              safeCurrentStep;

            const active =
              stepNumber ===
              safeCurrentStep;

            const Icon =
              journeyStep.icon;

            const clickable =
              Boolean(
                onStepClick
              );

            return (
              <button
                key={
                  journeyStep.name
                }
                type="button"
                aria-current={
                  active
                    ? "step"
                    : undefined
                }
                aria-label={`${journeyStep.name}: ${journeyStep.description}`}
                disabled={
                  !clickable
                }
                onClick={() => {
                  if (
                    !onStepClick
                  ) {
                    return;
                  }

                  onStepClick(
                    stepNumber
                  );
                }}
                className={[
                  "group relative flex min-w-[148px] items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left",
                  "transition-all duration-200",
                  "xl:w-full xl:min-w-0",

                  completed
                    ? "border-emerald-100 bg-emerald-50/70"
                    : active
                      ? "border-[#D4AF37]/70 bg-gradient-to-r from-amber-50 via-white to-yellow-50 shadow-[0_5px_16px_rgba(212,175,55,0.12)]"
                      : "border-transparent bg-slate-50/80",

                  clickable
                    ? "cursor-pointer hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    : "cursor-default",
                ].join(" ")}
              >
                {/* Active accent */}

                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#D4AF37]" />
                )}

                {/* Icon */}

                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",

                    completed
                      ? "bg-emerald-600 text-white"
                      : active
                        ? "bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-sm"
                        : "bg-white text-slate-400 ring-1 ring-slate-200",

                    clickable
                      ? "group-hover:scale-[1.04]"
                      : "",
                  ].join(" ")}
                >
                  {completed ? (
                    <Check
                      size={14}
                      strokeWidth={2.7}
                    />
                  ) : (
                    <Icon
                      size={14}
                      strokeWidth={2.3}
                    />
                  )}
                </span>

                {/* Content */}

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "truncate text-[11px] font-black sm:text-xs",

                        active
                          ? "text-[#0B2D5C]"
                          : completed
                            ? "text-emerald-800"
                            : "text-slate-600",
                      ].join(" ")}
                    >
                      {
                        journeyStep.name
                      }
                    </span>

                    <span
                      className={[
                        "shrink-0 text-[8px] font-black uppercase tracking-[0.06em]",

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
                          ? "Now"
                          : stepNumber}
                    </span>
                  </span>

                  <span className="mt-0.5 flex items-center justify-between gap-1.5">
                    <span className="truncate text-[9px] text-slate-400 sm:text-[10px]">
                      {
                        journeyStep.description
                      }
                    </span>

                    {clickable &&
                      !active && (
                        <span className="hidden shrink-0 items-center gap-0.5 text-[8px] font-bold text-blue-700 opacity-0 transition group-hover:opacity-100 xl:inline-flex">
                          <Pencil
                            size={9}
                          />

                          Edit
                        </span>
                      )}
                  </span>
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}
