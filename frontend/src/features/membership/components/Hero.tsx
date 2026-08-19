"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#06162C] via-[#0B2D5C] to-[#174A87] text-white">
      <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-center lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D675]/30 bg-[#D4AF37]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">
            <Sparkles size={14} />
            Holy Matrimony Membership
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            More meaningful ways to
            <span className="block text-[#F2D675]">
              find your life partner.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
            Choose a membership designed for your journey.
            Connect with genuine Christian profiles, communicate
            confidently and unlock greater visibility as you search
            for the right match.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#plans"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-6 text-sm font-black text-[#071B36] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E2C04F]"
            >
              View Membership Plans
              <ArrowRight size={17} />
            </a>

            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
            >
              Create Free Profile
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              "Verified profiles",
              "Secure platform",
              "Flexible plans",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-semibold text-blue-100"
              >
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-emerald-300"
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[30px] border border-white/15 bg-white/[0.09] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#071B36] shadow-lg">
                <Crown size={27} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#F2D675]">
                  Premium benefits
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Make every connection count
                </h2>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {[
                {
                  icon: HeartHandshake,
                  title: "Connect More",
                  text: "Unlock interests, chat and contact options.",
                },
                {
                  icon: Sparkles,
                  title: "Get More Visibility",
                  text: "Stand out with premium search benefits.",
                },
                {
                  icon: ShieldCheck,
                  title: "Search With Confidence",
                  text: "Built around a trusted Christian community.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F2D675]">
                    <Icon size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-100">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#F2D675]/20 bg-[#D4AF37]/10 px-4 py-3">
              <p className="text-xs leading-5 text-[#FFF3BF]">
                Start free and upgrade whenever you need
                additional communication and visibility features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
