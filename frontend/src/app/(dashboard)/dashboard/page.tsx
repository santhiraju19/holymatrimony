"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Bell,
  Heart,
  Loader2,
  MessageCircle,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import authService, {
  AuthUser,
} from "@/features/auth/services/auth.service";

import useNotifications from "@/features/notifications/hooks/useNotifications";

import { useProfile } from "@/features/profile/context/useProfile";

import {
  calculateProfileCompletion,
} from "@/features/profile/utils/profileCompletion";

import DashboardProfileCard from "@/features/profile/components/DashboardProfileCard";

import CurrentMembershipCard from "@/features/membership/components/CurrentMembershipCard";
import PaymentHistoryCard from "@/features/membership/components/PaymentHistoryCard";

import DashboardHero from "@/features/dashboard/components/DashboardHero";
import DashboardStats from "@/features/dashboard/components/DashboardStats";
import RecommendedMatches from "@/features/dashboard/components/RecommendedMatches";
import ProfileImprovementTips from "@/features/dashboard/components/ProfileImprovementTips";
import DailyVerse from "@/features/dashboard/components/DailyVerse";

import {
  summarizeNotifications,
} from "@/features/dashboard/services/dashboard.service";

import type {
  DashboardQuickAction,
} from "@/features/dashboard/types";

const quickActions: DashboardQuickAction[] = [
  {
    title: "Complete Profile",
    description:
      "Update your personal, church, education and family information.",
    href: "/profile",
    icon: "profile",
  },
  {
    title: "Search Matches",
    description:
      "Discover compatible Christian members using your preferences.",
    href: "/search",
    icon: "search",
  },
  {
    title: "View Interests",
    description:
      "Review members who have expressed interest in your profile.",
    href: "/received-interests",
    icon: "interests",
  },
  {
    title: "Open Messages",
    description:
      "Continue private and secure conversations with your matches.",
    href: "/chat",
    icon: "chat",
  },
];

function getMemberName(
  user: AuthUser | null
): string {
  if (user?.fullName?.trim()) {
    return user.fullName.trim();
  }

  if (user?.email) {
    return (
      user.email
        .split("@")[0]
        .trim() || "Member"
    );
  }

  return "Member";
}

function getGreeting(): string {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getQuickActionIcon(
  icon: DashboardQuickAction["icon"]
) {
  if (icon === "profile") {
    return UserRound;
  }

  if (icon === "search") {
    return Search;
  }

  if (icon === "interests") {
    return Heart;
  }

  return MessageCircle;
}

export default function DashboardPage() {
  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null
  );

  const {
    notifications,
    unreadCount,
    loading:
      notificationsLoading,
    isRealtimeConnected,
  } = useNotifications();

  const {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    locationInfo,
    aboutInfo,
    photoInfo,
  } = useProfile();

  useEffect(() => {
    setUser(
      authService.getUser()
    );
  }, []);

  const recentNotifications =
    useMemo(
      () =>
        notifications.slice(0, 5),
      [notifications]
    );

  const notificationSummary =
    useMemo(
      () =>
        summarizeNotifications(
          notifications
        ),
      [notifications]
    );

  const profileCompletion =
    useMemo(
      () =>
        calculateProfileCompletion({
          basicInfo,
          churchInfo,
          educationInfo,
          familyInfo,
          preferenceInfo,
          locationInfo,
          aboutInfo,
          photoInfo,
        }),
      [
        basicInfo,
        churchInfo,
        educationInfo,
        familyInfo,
        preferenceInfo,
        locationInfo,
        aboutInfo,
        photoInfo,
      ]
    );

  const memberName =
    getMemberName(user);

  return (
    <div className="space-y-8 pb-10">
      <DashboardHero
        greeting={getGreeting()}
        memberName={memberName}
        unreadCount={unreadCount}
        isRealtimeConnected={
          isRealtimeConnected
        }
      />

      <DashboardStats
        unreadNotifications={
          notificationSummary.unread
        }
        messageNotifications={
          notificationSummary.messages
        }
        interestNotifications={
          notificationSummary.interests
        }
        totalActivity={
          notificationSummary.total
        }
      />

      <section className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)]">
        <RecommendedMatches
          matches={[]}
        />

        <ProfileImprovementTips
          percentage={
            profileCompletion.percentage
          }
          pendingSections={
            profileCompletion.pending
          }
        />
      </section>

      <DailyVerse />

      <section>
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B38B19]">
            Continue your journey
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#0B2D5C]">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Access the most important
            parts of your matrimony
            account.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {quickActions.map(
            (action) => {
              const Icon =
                getQuickActionIcon(
                  action.icon
                );

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:shadow-[0_22px_50px_rgba(15,23,42,0.11)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50 text-[#0B2D5C] ring-1 ring-slate-100">
                      <Icon size={22} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#B38B19]"
                    />
                  </div>

                  <h3 className="mt-5 font-black text-[#0B2D5C]">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>
                </Link>
              );
            }
          )}
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <DashboardProfileCard />

        <CurrentMembershipCard />
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5 sm:px-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B38B19]">
                Latest updates
              </p>

              <h2 className="mt-1 text-xl font-black text-[#0B2D5C]">
                Recent Activity
              </h2>
            </div>

            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {notificationsLoading ? (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
                <Loader2
                  size={27}
                  className="animate-spin text-[#0B2D5C]"
                />

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Loading recent activity...
                </p>
              </div>
            ) : recentNotifications.length ===
              0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                  <Bell size={27} />
                </div>

                <h3 className="mt-4 font-black text-[#0B2D5C]">
                  No recent activity
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  New messages, interests
                  and account updates will
                  appear here.
                </p>
              </div>
            ) : (
              recentNotifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={[
                      "flex gap-4 px-5 py-4 transition sm:px-6",
                      notification.read
                        ? "bg-white"
                        : "bg-amber-50/50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        notification.type ===
                        "NEW_MESSAGE"
                          ? "bg-blue-50 text-blue-600"
                          : notification.type ===
                              "INTEREST_RECEIVED"
                            ? "bg-rose-50 text-rose-500"
                            : notification.type ===
                                "INTEREST_ACCEPTED"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600",
                      ].join(" ")}
                    >
                      {notification.type ===
                      "NEW_MESSAGE" ? (
                        <MessageCircle
                          size={19}
                        />
                      ) : notification.type ===
                        "INTEREST_RECEIVED" ? (
                        <Heart size={19} />
                      ) : (
                        <Bell size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-900">
                          {
                            notification.title
                          }
                        </h3>

                        {!notification.read && (
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D4AF37]" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {
                          notification.message
                        }
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-400">
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
          <div className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <ShieldCheck size={22} />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#0B2D5C]">
              Safety Reminder
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Verify profile information,
              communicate through the
              platform and involve trusted
              family or church members
              before making important
              decisions.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0B2D5C] transition hover:text-[#B38B19]"
            >
              Contact Support

              <ArrowRight size={16} />
            </Link>
          </div>

          <PaymentHistoryCard />
        </div>
      </section>
    </div>
  );
}