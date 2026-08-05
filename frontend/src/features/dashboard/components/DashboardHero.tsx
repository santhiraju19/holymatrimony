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
    <section className="relative overflow-hidden rounded-[30px] border border-blue-200/20 bg-gradient-to-br from-[#06162C] via-[#0B2D5C] to-[#174A87] px-5 py-7 text-white shadow-[0_26px_75px_rgba(11,45,92,0.25)] sm:px-8 sm:py-9 lg:px-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D675]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">
            <Sparkles size={14} />

            Faith • Family • Forever
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {greeting},{" "}
            <span className="text-[#F2D675]">
              {memberName}
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            Continue building your profile,
            discover meaningful Christian
            matches and connect securely with
            members who share your faith and
            family values.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] px-6 text-sm font-black text-[#06162C] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Search size={18} />

              Find Matches

              <ArrowRight size={17} />
            </Link>

            <Link
              href="/profile"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] px-6 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
            >
              <Heart size={18} />

              Complete Profile
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-blue-100">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck
                size={16}
                className="text-emerald-400"
              />

              Privacy protected
            </span>

            <span className="inline-flex items-center gap-2">
              {isRealtimeConnected ? (
                <Wifi
                  size={16}
                  className="text-emerald-400"
                />
              ) : (
                <WifiOff
                  size={16}
                  className="text-amber-400"
                />
              )}

              {isRealtimeConnected
                ? "Live updates connected"
                : "Connecting to live updates"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.09] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F2D675]">
                <Bell size={22} />
              </div>

              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  New
                </span>
              )}
            </div>

            <p className="mt-5 text-4xl font-black">
              {unreadCount}
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              Unread notifications
            </p>

            <p className="mt-2 text-xs leading-5 text-blue-100">
              Messages, interests and important
              account activity.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.09] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  isRealtimeConnected
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-amber-400/15 text-amber-300",
                ].join(" ")}
              >
                {isRealtimeConnected ? (
                  <Wifi size={22} />
                ) : (
                  <WifiOff size={22} />
                )}
              </div>

              <span
                className={[
                  "h-3 w-3 rounded-full",
                  isRealtimeConnected
                    ? "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]"
                    : "bg-amber-400",
                ].join(" ")}
              />
            </div>

            <p className="mt-5 text-xl font-black">
              {isRealtimeConnected
                ? "Connected"
                : "Connecting"}
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              Real-time activity
            </p>

            <p className="mt-2 text-xs leading-5 text-blue-100">
              Receive new message and interest
              updates without refreshing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}