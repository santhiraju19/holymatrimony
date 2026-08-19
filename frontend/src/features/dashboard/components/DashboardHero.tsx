"use client";

import Link from "next/link";

import {
  ArrowRight,
  Bell,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";

interface DashboardHeroProps {
  memberName: string;
  greeting: string;
  unreadCount: number;
  isRealtimeConnected: boolean;
}

export default function DashboardHero({
  memberName,
  greeting,
  unreadCount,
  isRealtimeConnected,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-blue-200/20 bg-gradient-to-br from-[#06162C] via-[#0B2D5C] to-[#174A87] px-5 py-5 text-white shadow-[0_16px_45px_rgba(11,45,92,0.18)] sm:px-6 lg:px-7">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-[30%] h-52 w-52 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        {/* =====================================================
            Welcome
            ===================================================== */}

        <div className="min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F2D675]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675] sm:text-[10px]">
            <Sparkles size={11} />

            Faith • Family • Forever
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
            {greeting},{" "}
            <span className="text-[#F2D675]">
              {memberName}
            </span>
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-5 text-blue-100/90 sm:text-sm sm:leading-6">
            Discover meaningful Christian
            matches, strengthen your profile
            and continue conversations securely.
          </p>

          {/* Actions */}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/search"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] px-4 text-xs font-black text-[#06162C] shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:text-sm"
            >
              <Search size={15} />

              Find Matches

              <ArrowRight size={14} />
            </Link>

            <Link
              href="/profile"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-xs font-bold text-white backdrop-blur transition duration-200 hover:bg-white/[0.14] sm:text-sm"
            >
              <UserRound size={15} />

              My Profile
            </Link>
          </div>
        </div>

        {/* =====================================================
            Compact Status
            ===================================================== */}

        <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:w-[390px]">

          {/* Notifications */}

          <Link
            href="/dashboard"
            className="group rounded-[16px] border border-white/10 bg-white/[0.08] p-3.5 backdrop-blur-xl transition hover:bg-white/[0.12]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#F2D675]">
                <Bell size={16} />
              </div>

              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white">
                  NEW
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xl font-black">
                  {unreadCount}
                </p>

                <p className="mt-0.5 text-[11px] font-bold text-blue-100">
                  Unread alerts
                </p>
              </div>

              <ArrowRight
                size={14}
                className="mb-1 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-[#F2D675]"
              />
            </div>
          </Link>

          {/* Realtime */}

          <div className="rounded-[16px] border border-white/10 bg-white/[0.08] p-3.5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  isRealtimeConnected
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-amber-400/15 text-amber-300",
                ].join(" ")}
              >
                {isRealtimeConnected ? (
                  <Wifi size={16} />
                ) : (
                  <WifiOff size={16} />
                )}
              </div>

              <span
                className={[
                  "h-2 w-2 rounded-full",
                  isRealtimeConnected
                    ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]"
                    : "bg-amber-400",
                ].join(" ")}
              />
            </div>

            <p className="mt-2.5 text-sm font-black">
              {isRealtimeConnected
                ? "Connected"
                : "Connecting"}
            </p>

            <p className="mt-0.5 text-[11px] font-semibold text-blue-100">
              Live activity updates
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          Trust strip
          ===================================================== */}

      <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-3 text-[10px] font-semibold text-blue-100 sm:text-xs">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck
            size={13}
            className="text-emerald-400"
          />

          Privacy protected
        </span>

        <span className="inline-flex items-center gap-1.5">
          {isRealtimeConnected ? (
            <Wifi
              size={13}
              className="text-emerald-400"
            />
          ) : (
            <WifiOff
              size={13}
              className="text-amber-400"
            />
          )}

          {isRealtimeConnected
            ? "Real-time services active"
            : "Connecting to services"}
        </span>
      </div>
    </section>
  );
}
