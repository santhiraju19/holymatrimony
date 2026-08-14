"use client";

import Link from "next/link";

import {
  Heart,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export default function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-[#F2D675]">
            <Heart
              size={17}
              fill="currentColor"
            />
          </div>

          <div>
            <p className="font-bold text-[#0B2D5C]">
              Holy Matrimony
            </p>

            <p className="mt-0.5">
              © {year} Holy Matrimony
              Services Pvt Ltd.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <ShieldCheck size={14} />
            Secure profile
          </div>

          <div className="inline-flex items-center gap-1.5 font-semibold text-blue-700">
            <LockKeyhole size={14} />
            Privacy protected
          </div>

          <Link
            href="/privacy"
            className="font-semibold transition hover:text-[#0B2D5C]"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="font-semibold transition hover:text-[#0B2D5C]"
          >
            Terms
          </Link>

          <Link
            href="/contact"
            className="font-semibold transition hover:text-[#0B2D5C]"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
