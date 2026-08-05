"use client";

import {
  BookOpen,
  Quote,
  Sparkles,
} from "lucide-react";

export default function DailyVerse() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#D4AF37]/30 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#D4AF37]/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B2D5C] text-[#F2D675] shadow-md">
            <BookOpen size={22} />
          </div>

          <Sparkles
            size={20}
            className="text-[#B38B19]"
          />
        </div>

        <div className="mt-6">
          <Quote
            size={28}
            className="text-[#D4AF37]"
          />

          <blockquote className="mt-3 text-xl font-black leading-9 text-[#0B2D5C]">
            Trust in the Lord with all your
            heart and lean not on your own
            understanding.
          </blockquote>

          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[#B38B19]">
            Proverbs 3:5
          </p>
        </div>

        <p className="mt-5 border-t border-amber-200/70 pt-5 text-sm leading-7 text-slate-600">
          Let faith, wisdom and patience guide
          each step of your matrimony journey.
        </p>
      </div>
    </section>
  );
}