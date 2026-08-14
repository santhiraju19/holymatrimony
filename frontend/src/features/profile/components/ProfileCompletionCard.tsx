"use client";

import {
  CheckCircle2,
  CircleDashed,
  Sparkles,
  Target,
} from "lucide-react";

interface ProfileCompletionCardProps {
  percentage: number;
  completed: string[];
  pending: string[];
}

export default function ProfileCompletionCard({
  percentage,
  completed,
  pending,
}: ProfileCompletionCardProps) {
  const safePercentage =
    Math.min(
      Math.max(percentage, 0),
      100
    );

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F2D675]">
                <Sparkles size={12} />

                Completion
              </div>

              <p className="mt-4 text-3xl font-black">
                {safePercentage}%
              </p>

              <p className="mt-1 text-sm text-blue-100">
                Profile complete
              </p>
            </div>

            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[7px] border-white/15 bg-white/10">
              <span className="text-lg font-black text-[#F2D675]">
                {safePercentage}%
              </span>
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
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <CheckCircle2
              size={19}
              className="text-emerald-600"
            />

            <p className="mt-2 text-xl font-black text-emerald-800">
              {completed.length}
            </p>

            <p className="text-xs font-semibold text-emerald-600">
              Completed
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
            <CircleDashed
              size={19}
              className="text-amber-600"
            />

            <p className="mt-2 text-xl font-black text-amber-800">
              {pending.length}
            </p>

            <p className="text-xs font-semibold text-amber-600">
              Remaining
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2">
            <Target
              size={17}
              className="text-[#0B2D5C]"
            />

            <h3 className="text-sm font-black text-[#0B2D5C]">
              Next recommended
            </h3>
          </div>

          {pending.length > 0 ? (
            <div className="mt-3 space-y-2">
              {pending
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    <CircleDashed
                      size={14}
                      className="shrink-0 text-amber-500"
                    />

                    <span className="truncate">
                      {item}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700">
              Your required profile
              sections are complete.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}