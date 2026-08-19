"use client";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

interface ProfileImprovementTipsProps {
  percentage: number;
  pendingSections: string[];
}

export default function ProfileImprovementTips({
  percentage,
  pendingSections,
}: ProfileImprovementTipsProps) {
  const safePercentage =
    Math.min(
      Math.max(
        percentage,
        0
      ),
      100
    );

  const visibleTips =
    pendingSections.slice(
      0,
      3
    );

  const remainingCount =
    Math.max(
      0,
      pendingSections.length -
        visibleTips.length
    );

  const completed =
    safePercentage >= 100 ||
    pendingSections.length === 0;

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 via-white to-blue-50/60 px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-[#071B36] shadow-sm">
          <Lightbulb
            size={17}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles
              size={10}
              className="text-[#B38B19]"
            />

            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Profile guidance
            </p>
          </div>

          <h2 className="mt-0.5 text-base font-black text-[#0B2D5C]">
            Improve Your Profile
          </h2>
        </div>
      </div>

      <div className="p-4">

        {/* =====================================================
            Compact Strength
            ===================================================== */}

        <div className="rounded-[16px] bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] p-3.5 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F2D675]">
              <Target
                size={17}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-blue-200">
                    Profile strength
                  </p>

                  <p className="mt-0.5 text-xl font-black">
                    {safePercentage}%
                  </p>
                </div>

                <span className="text-[10px] font-semibold text-blue-100">
                  {completed
                    ? "Complete"
                    : "Keep going"}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#FFF2B2] transition-all duration-500"
                  style={{
                    width: `${safePercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {completed ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="text-xs font-black text-emerald-800">
                Profile sections complete
              </p>

              <p className="mt-0.5 text-[11px] leading-5 text-emerald-700">
                Your required sections are complete. Keep your information and photos current.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
              Recommended next steps
            </p>

            <div className="mt-2 space-y-1.5">
              {visibleTips.map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2"
                  >
                    <CircleDashed
                      size={13}
                      className="shrink-0 text-amber-500"
                    />

                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700 sm:text-xs">
                      Complete {item}
                    </span>
                  </div>
                )
              )}
            </div>

            {remainingCount >
              0 && (
              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                +{remainingCount} more profile{" "}
                {remainingCount === 1
                  ? "section"
                  : "sections"}{" "}
                remaining
              </p>
            )}
          </div>
        )}

        <Link
          href="/profile"
          className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-4 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {completed
            ? "Review Profile"
            : "Continue Profile"}

          <ArrowRight
            size={13}
          />
        </Link>
      </div>
    </section>
  );
}
