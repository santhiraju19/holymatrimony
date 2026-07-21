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
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">

      {/* Gold Accent */}

      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#E8C45C] to-[#D4AF37]" />

      <div className="mb-10">

        <span className="rounded-full bg-[#FFF8E6] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B8860B]">
          Holy Matrimony
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0B2D5C]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 leading-8 text-slate-500">
            {subtitle}
          </p>
        )}

      </div>

      {children}

    </div>
  );
}