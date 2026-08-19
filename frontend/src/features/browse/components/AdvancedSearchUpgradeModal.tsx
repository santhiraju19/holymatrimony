"use client";

import Link from "next/link";

import {
  Crown,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

interface AdvancedSearchUpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdvancedSearchUpgradeModal({
  open,
  onClose,
}: AdvancedSearchUpgradeModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-search-upgrade-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(2,6,23,0.35)]">

        {/* Header */}

        <div className="relative overflow-hidden bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 pb-8 pt-6 text-white">

          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-400/20 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
            aria-label="Close membership upgrade"
          >
            <X size={16} />
          </button>

          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F2D675]/30 bg-[#D4AF37]/15 text-[#F2D675]">
              <Search size={22} />
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Premium Discovery
            </p>

            <h2
              id="advanced-search-upgrade-title"
              className="mt-1 text-2xl font-black tracking-[-0.03em]"
            >
              Unlock Advanced Search
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-100">
              Find more compatible matches using detailed preferences,
              location, faith and profile criteria.
            </p>
          </div>
        </div>

        {/* Content */}

        <div className="px-6 py-5">

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <div className="flex items-start gap-3">

              <SlidersHorizontal
                size={18}
                className="mt-0.5 shrink-0 text-[#B18416]"
              />

              <div>
                <p className="text-sm font-black text-slate-900">
                  Search with more precision
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Filter matches by age, denomination, marital status,
                  location, education, profession and baptism preference.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">

            <FeatureRow>
              Search by detailed partner preferences
            </FeatureRow>

            <FeatureRow>
              Narrow matches by faith and location
            </FeatureRow>

            <FeatureRow>
              Discover relevant profiles faster
            </FeatureRow>

          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-[10px] leading-4 text-blue-800">
            <ShieldCheck
              size={13}
              className="mt-0.5 shrink-0"
            />

            Advanced Search is available with eligible Holy Matrimony
            membership plans.
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Maybe Later
            </button>

            <Link
              href="/membership"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-5 text-sm font-black text-white transition hover:shadow-lg"
            >
              <Crown
                size={16}
                className="text-[#F2D675]"
              />

              View Membership Plans
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Sparkles size={12} />
      </span>

      {children}
    </div>
  );
}
