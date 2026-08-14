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
      Math.max(percentage, 0),
      100
    );

  const visibleTips =
    pendingSections.slice(0, 4);

  const completed =
    safePercentage >= 100 ||
    pendingSections.length === 0;

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-blue-50 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-[#071B36] shadow-sm">
            <Lightbulb size={18} />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B38B19] sm:text-xs">
              Profile guidance
            </p>

            <h2 className="mt-0.5 text-lg font-black text-[#0B2D5C]">
              Improve Your Profile
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Complete more sections to build member trust.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="rounded-[18px] bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] p-4 text-white shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">
                Profile strength
              </p>

              <p className="mt-1 text-3xl font-black">
                {safePercentage}%
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#F2D675]">
              <Target size={22} />
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#FFF2B2] transition-all duration-500"
              style={{
                width: `${safePercentage}%`,
              }}
            />
          </div>
        </div>

        {completed ? (
          <div className="mt-4 rounded-[16px] border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <h3 className="text-sm font-black text-emerald-800">
                  Profile sections complete
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-emerald-700 sm:text-sm">
                  Your required profile sections are complete. You may still
                  update details or add photos whenever you choose.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Sparkles
                size={14}
                className="text-[#B38B19]"
              />

              <h3 className="text-sm font-black text-[#0B2D5C]">
                Recommended next steps
              </h3>
            </div>

            <div className="mt-2.5 space-y-2">
              {visibleTips.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                >
                  <CircleDashed
                    size={15}
                    className="shrink-0 text-amber-500"
                  />

                  <span className="min-w-0 flex-1 text-xs font-semibold text-slate-700 sm:text-sm">
                    Complete {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/profile"
          className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#123C73]"
        >
          {completed
            ? "Review Profile"
            : "Continue Profile"}

          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}