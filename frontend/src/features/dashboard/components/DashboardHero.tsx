
"use client";

import Link from "next/link";

import {
  ArrowRight,
  Bell,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
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
    <section className="relative overflow-hidden rounded-[22px] border border-blue-200/20 bg-gradient-to-br from-[#06162C] via-[#0B2D5C] to-[#174A87] px-4 py-5 text-white shadow-[0_18px_50px_rgba(11,45,92,0.20)] sm:px-6 sm:py-6 lg:px-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D675]/30 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#F2D675] sm:text-xs">
            <Sparkles size={13} />
            Faith • Family • Forever
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            {greeting},{" "}
            <span className="text-[#F2D675]">
              {memberName}
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Continue building your profile, discover meaningful Christian
            matches and connect securely with members who share your faith and
            family values.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] px-5 text-sm font-black text-[#06162C] shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Search size={16} />
              Find Matches
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/profile"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
            >
              <Heart size={16} />
              Complete Profile
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-blue-100">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck
                size={14}
                className="text-emerald-400"
              />
              Privacy protected
            </span>

            <span className="inline-flex items-center gap-2">
              {isRealtimeConnected ? (
                <Wifi
                  size={14}
                  className="text-emerald-400"
                />
              ) : (
                <WifiOff
                  size={14}
                  className="text-amber-400"
                />
              )}

              {isRealtimeConnected
                ? "Live updates connected"
                : "Connecting to live updates"}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.09] p-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F2D675]">
                <Bell size={19} />
              </div>

              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                  New
                </span>
              )}
            </div>

            <p className="mt-3 text-3xl font-black">
              {unreadCount}
            </p>

            <p className="mt-0.5 text-sm font-bold text-white">
              Unread notifications
            </p>

            <p className="mt-1.5 text-xs leading-5 text-blue-100">
              Messages, interests and important account activity.
            </p>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-white/[0.09] p-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isRealtimeConnected
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-amber-400/15 text-amber-300",
                ].join(" ")}
              >
                {isRealtimeConnected ? (
                  <Wifi size={19} />
                ) : (
                  <WifiOff size={19} />
                )}
              </div>

              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  isRealtimeConnected
                    ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]"
                    : "bg-amber-400",
                ].join(" ")}
              />
            </div>

            <p className="mt-3 text-lg font-black">
              {isRealtimeConnected
                ? "Connected"
                : "Connecting"}
            </p>

            <p className="mt-0.5 text-sm font-bold text-white">
              Real-time activity
            </p>

            <p className="mt-1.5 text-xs leading-5 text-blue-100">
              Receive new message and interest updates without refreshing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}