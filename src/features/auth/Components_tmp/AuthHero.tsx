"use client";

import Logo from "./Logo";
import BibleVerse from "./BibleVerse";

const FEATURES = [
  "Church Verified Members",
  "Trust Passport™",
  "Privacy Shield™",
  "Secure Connect™",
];

export default function AuthHero() {
  return (
    <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-[#071C3A] via-[#0B2D5C] to-[#184E8C] lg:flex">

      {/* Background Glow */}

      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#D4AF37]/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      {/* Decorative Circles */}

      <div className="absolute right-16 top-20 h-40 w-40 rounded-full border border-white/10" />

      <div className="absolute right-24 top-28 h-24 w-24 rounded-full border border-white/10" />

      <div className="relative flex h-full flex-col justify-between p-14 text-white">

        <Logo />

        <div>

          <span className="rounded-full bg-[#D4AF37]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#FFE8A3]">
            India's Trusted Christian Matrimony
          </span>

          <h1 className="mt-8 text-6xl font-black leading-tight">
            God's Perfect
            <br />
            Match Begins
            <br />
            Here.
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-9 text-slate-200">
            Build a Christ-centered relationship through a platform
            designed with faith, trust, privacy and genuine connections.
          </p>

        </div>

        <BibleVerse />

        <div className="grid grid-cols-2 gap-4">

          {FEATURES.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
            >
              <div className="text-sm font-semibold">
                ✓ {item}
              </div>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}