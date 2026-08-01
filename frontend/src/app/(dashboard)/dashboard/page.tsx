
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import authService, {
  AuthUser,
} from "@/features/auth/services/auth.service";

import useNotifications from "@/features/notifications/hooks/useNotifications";
import DashboardProfileCard from "@/features/profile/components/DashboardProfileCard";
import CurrentMembershipCard from "@/features/membership/components/CurrentMembershipCard";
import PaymentHistoryCard from "@/features/membership/components/PaymentHistoryCard";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Complete Profile",
    description:
      "Add your personal, church, education, family, and preference details.",
    href: "/profile",
    icon: "👤",
  },
  {
    title: "Search Matches",
    description:
      "Discover compatible Christian profiles based on your preferences.",
    href: "/search",
    icon: "🔍",
  },
  {
    title: "View Interests",
    description:
      "Review interests received from other Holy Matrimony members.",
    href: "/received-interests",
    icon: "💖",
  },
  {
    title: "Open Messages",
    description:
      "Continue conversations with your matches securely.",
    href: "/chat",
    icon: "💬",
  },
];

function getMemberName(
  user: AuthUser | null
): string {
  if (user?.fullName?.trim()) {
    return user.fullName.trim();
  }

  if (user?.email) {
    return user.email.split("@")[0];
  }

  return "Member";
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardPage() {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    isRealtimeConnected,
  } = useNotifications();

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const recentNotifications =
    useMemo(
      () => notifications.slice(0, 4),
      [notifications]
    );

  const memberName = getMemberName(user);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B2D5C] via-[#123C73] to-[#0B2D5C] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Faith • Family • Forever
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              {getGreeting()}, {memberName}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200 md:text-base">
              Continue building your profile,
              discover meaningful matches, and
              connect with people who share your
              Christian faith and family values.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#0B2D5C] transition hover:-translate-y-0.5 hover:bg-[#E2C45B]"
              >
                Find Matches
              </Link>

              <Link
                href="/profile"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Update Profile
              </Link>
            </div>
          </div>

          <div className="grid min-w-full grid-cols-2 gap-3 sm:min-w-[340px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl">🔔</p>

              <p className="mt-3 text-2xl font-bold">
                {unreadCount}
              </p>

              <p className="text-sm text-slate-200">
                Unread notifications
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl">
                {isRealtimeConnected
                  ? "🟢"
                  : "🟡"}
              </p>

              <p className="mt-3 text-sm font-bold">
                {isRealtimeConnected
                  ? "Live"
                  : "Connecting"}
              </p>

              <p className="text-sm text-slate-200">
                Notification updates
              </p>
            </div>
          </div>
        </div>
      </section>

      <DashboardProfileCard />
<CurrentMembershipCard />
<PaymentHistoryCard />

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#0B2D5C]">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Continue your Holy Matrimony journey.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                {action.icon}
              </div>

              <h3 className="mt-4 font-bold text-[#0B2D5C] transition group-hover:text-[#D4AF37]">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {action.description}
              </p>

              <p className="mt-4 text-sm font-semibold text-[#0B2D5C]">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-[#0B2D5C]">
                Recent Notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest messages and activity.
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {notificationsLoading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : recentNotifications.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl">
                  🔔
                </div>

                <p className="mt-3 font-semibold text-slate-700">
                  No recent notifications
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  New messages and interests will
                  appear here.
                </p>
              </div>
            ) : (
              recentNotifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={[
                      "flex gap-4 px-6 py-4",
                      notification.read
                        ? "bg-white"
                        : "bg-amber-50/50",
                    ].join(" ")}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
                      {notification.type ===
                      "NEW_MESSAGE"
                        ? "💬"
                        : notification.type ===
                            "INTEREST_RECEIVED"
                          ? "💖"
                          : notification.type ===
                              "INTEREST_ACCEPTED"
                            ? "🎉"
                            : "🔔"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D4AF37]" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37] text-2xl">
              👑
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#0B2D5C]">
              Membership
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Explore membership plans to unlock
              premium communication and visibility
              features.
            </p>

            <Link
              href="/membership"
              className="mt-5 inline-flex rounded-xl bg-[#0B2D5C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123C73]"
            >
              View Membership
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#0B2D5C]">
              Safety Reminder
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Take time to verify profile details,
              communicate through the platform, and
              involve trusted family or church
              members before making decisions.
            </p>

            <Link
              href="/contact"
              className="mt-4 inline-flex text-sm font-semibold text-[#0B2D5C] transition hover:text-[#D4AF37]"
            >
              Contact support →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}