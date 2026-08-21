"use client";

import {
  BadgeCheck,
  Church,
  HeartHandshake,
  Search,
  ShieldCheck,
} from "lucide-react";

import Button from "@/components/ui/button";

const benefits = [
  {
    icon: Search,
    title: "Detailed Partner Search",
    description:
      "Search using faith, community, education, lifestyle, location and partner preferences.",
  },
  {
    icon: BadgeCheck,
    title: "Trust Verification",
    description:
      "Verification features help members make more informed connections.",
  },
  {
    icon: Church,
    title: "Church Verification",
    description:
      "An additional faith-based trust layer for members who choose to verify.",
  },
];

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#123B74] py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-bold text-amber-200">
            <HeartHandshake size={15} />
            Faith • Family • Forever
          </span>

          <h2 className="mt-6 text-3xl font-black leading-tight tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
            Begin Your Search for a
            <span className="block text-amber-300">
              Meaningful Life Partnership
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100/85 sm:text-lg">
            Create your profile, share the preferences that matter to you,
            and discover members through a platform designed around faith,
            family values, privacy and trust.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              href="/register"
              size="lg"
            >
              Create Free Profile
            </Button>

            <Button
              href="/search"
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#0B2D5C]"
            >
              Browse Profiles
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon =
              benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-200">
                  <Icon size={19} />
                </div>

                <h3 className="mt-4 text-sm font-black text-white">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-blue-100/70">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-start justify-center gap-2 text-center">
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-emerald-300"
          />

          <p className="max-w-xl text-[11px] leading-5 text-blue-100/70">
            Verification indicates that specific checks have been completed.
            Members should still use their own judgment when deciding whom to
            contact or meet.
          </p>
        </div>
      </div>
    </section>
  );
}
