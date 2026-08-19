import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-white px-4 pb-16 pt-8 sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[26px] border border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-5 py-8 text-white shadow-[0_18px_50px_rgba(11,45,92,0.18)] sm:px-8 sm:py-10 lg:px-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F2D675]/25 bg-[#D4AF37]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675]">
                <Sparkles
                  size={10}
                />
                Holy Matrimony Premium
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#F2D675] sm:flex">
                  <Crown
                    size={18}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-[-0.025em] sm:text-3xl">
                    Ready to unlock more connections?
                  </h2>

                  <p className="mt-2 max-w-2xl text-xs leading-6 text-blue-100 sm:text-sm">
                    Upgrade when you&apos;re ready for more communication, visibility and premium matchmaking features.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold text-blue-100 sm:text-[11px]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    size={12}
                    className="text-emerald-300"
                  />
                  Secure checkout
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={12}
                    className="text-emerald-300"
                  />
                  Flexible plans
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={12}
                    className="text-emerald-300"
                  />
                  Upgrade anytime
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <a
                href="#plans"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-xs font-black text-[#071B36] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E2C04F]"
              >
                Compare Plans
                <ArrowRight
                  size={15}
                />
              </a>

              <Link
                href="/register"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-xs font-black text-white transition hover:bg-white/15"
              >
                Create Free Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
