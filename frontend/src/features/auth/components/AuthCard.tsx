"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-[22px] border border-slate-200 bg-white/90 px-4 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:rounded-[28px] sm:p-7 md:p-8 lg:rounded-[32px] lg:p-10">
      {/* Gold Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#E8C45C] to-[#D4AF37]" />

      {/* Header */}
      <div className="mb-7 sm:mb-8 lg:mb-10">
        <span className="inline-flex rounded-full bg-[#FFF8E6] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B8860B] sm:px-4 sm:text-xs sm:tracking-[0.25em]">
          Holy Matrimony
        </span>

        <h1 className="mt-5 text-[28px] font-extrabold leading-tight tracking-tight text-[#0B2D5C] sm:mt-6 sm:text-3xl lg:text-4xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:mt-4 sm:text-base sm:leading-7 lg:leading-8">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
