"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  Bell,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import type {
  DashboardStat,
} from "@/features/dashboard/types";

interface DashboardStatsProps {
  unreadNotifications: number;
  messageNotifications: number;
  interestNotifications: number;
  totalActivity: number;
}

const toneClasses: Record<
  DashboardStat["tone"],
  {
    card: string;
    icon: string;
    value: string;
  }
> = {
  blue: {
    card:
      "border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white",
    icon:
      "bg-blue-100 text-blue-700",
    value:
      "text-blue-800",
  },

  rose: {
    card:
      "border-rose-100 bg-gradient-to-br from-rose-50 via-white to-white",
    icon:
      "bg-rose-100 text-rose-600",
    value:
      "text-rose-700",
  },

  emerald: {
    card:
      "border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white",
    icon:
      "bg-emerald-100 text-emerald-700",
    value:
      "text-emerald-800",
  },

  amber: {
    card:
      "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white",
    icon:
      "bg-amber-100 text-amber-700",
    value:
      "text-amber-800",
  },
};

export default function DashboardStats({
  unreadNotifications,
  messageNotifications,
  interestNotifications,
  totalActivity,
}: DashboardStatsProps) {
  const stats: Array<
    DashboardStat & {
      icon: typeof Bell;
    }
  > = [
    {
      id: "notifications",
      label: "Unread Alerts",
      value: unreadNotifications,
      description:
        "Notifications waiting for your attention",
      href: "/dashboard",
      tone: "blue",
      icon: Bell,
    },
    {
      id: "interests",
      label: "Interest Activity",
      value: interestNotifications,
      description:
        "Recent interest-related notifications",
      href: "/received-interests",
      tone: "rose",
      icon: Heart,
    },
    {
      id: "messages",
      label: "Message Activity",
      value: messageNotifications,
      description:
        "Recent message notifications",
      href: "/chat",
      tone: "emerald",
      icon: MessageCircle,
    },
    {
      id: "activity",
      label: "Recent Activity",
      value: totalActivity,
      description:
        "Total recorded dashboard notifications",
      href: "/dashboard",
      tone: "amber",
      icon: Sparkles,
    },
  ];

  return (
    <section>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B38B19]">
            Your activity
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#0B2D5C]">
            Dashboard overview
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          Based on your current notification
          activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const tone =
            toneClasses[stat.tone];

          return (
            <Link
              key={stat.id}
              href={stat.href}
              className={[
                "group relative overflow-hidden rounded-[24px] border p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.11)]",
                tone.card,
              ].join(" ")}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/60 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      tone.icon,
                    ].join(" ")}
                  >
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0B2D5C]"
                  />
                </div>

                <p
                  className={[
                    "mt-5 text-3xl font-black",
                    tone.value,
                  ].join(" ")}
                >
                  {stat.value}
                </p>

                <h3 className="mt-1 font-black text-[#0B2D5C]">
                  {stat.label}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {stat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}