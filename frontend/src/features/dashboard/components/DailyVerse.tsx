"use client";

import {
  BookOpen,
  Quote,
  Sparkles,
} from "lucide-react";

export default function DailyVerse() {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[#D4AF37]/25 bg-gradient-to-r from-amber-50/90 via-white to-blue-50/80 px-4 py-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:px-5">
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex shrink-0 items-center gap-3 md:w-[190px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2D5C] text-[#F2D675] shadow-sm">
            <BookOpen size={18} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={11}
                className="text-[#B38B19]"
              />

              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#B38B19]">
                Daily Scripture
              </p>
            </div>

            <p className="mt-0.5 text-xs font-black text-[#0B2D5C]">
              Proverbs 3:5
            </p>
          </div>
        </div>

        <div className="hidden h-10 w-px bg-slate-200 md:block" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2.5">
            <Quote
              size={17}
              className="mt-0.5 shrink-0 text-[#D4AF37]"
            />

            <div>
              <blockquote className="text-sm font-black leading-6 text-[#0B2D5C] sm:text-[15px]">
                Trust in the Lord with all your
                heart and lean not on your own
                understanding.
              </blockquote>

              <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                Let faith, wisdom and patience
                guide each step of your
                matrimony journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
