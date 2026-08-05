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
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-blue-50 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#071B36] shadow-md">
            <Lightbulb size={21} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B38B19]">
              Profile guidance
            </p>

            <h2 className="mt-1 text-xl font-black text-[#0B2D5C]">
              Improve Your Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete more sections to build
              member trust.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-[24px] bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] p-5 text-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
                Profile strength
              </p>

              <p className="mt-2 text-4xl font-black">
                {safePercentage}%
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#F2D675]">
              <Target size={28} />
            </div>
          </div>

          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#FFF2B2] transition-all duration-500"
              style={{
                width: `${safePercentage}%`,
              }}
            />
          </div>
        </div>

        {completed ? (
          <div className="mt-5 rounded-[22px] border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={22}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <h3 className="font-black text-emerald-800">
                  Profile sections complete
                </h3>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  Your required profile sections
                  are complete. You may still update
                  details or add photos whenever you
                  choose.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <Sparkles
                size={16}
                className="text-[#B38B19]"
              />

              <h3 className="text-sm font-black text-[#0B2D5C]">
                Recommended next steps
              </h3>
            </div>

            <div className="mt-3 space-y-2.5">
              {visibleTips.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <CircleDashed
                    size={17}
                    className="shrink-0 text-amber-500"
                  />

                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">
                    Complete {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/profile"
          className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#123C73]"
        >
          {completed
            ? "Review Profile"
            : "Continue Profile"}

          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}