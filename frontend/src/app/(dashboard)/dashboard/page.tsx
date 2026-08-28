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

import {
  useProfile,
} from "@/features/profile/context/useProfile";

import {
  calculateProfileCompletion,
} from "@/features/profile/utils/profileCompletion";

import profileService, {
  type ProfileVerificationStatus,
} from "@/features/profile/services/profile.service";

import DashboardProfileCard from "@/features/profile/components/DashboardProfileCard";

import CurrentMembershipCard from "@/features/membership/components/CurrentMembershipCard";

import ProfileBoostCard from "@/features/profile-boost/components/ProfileBoostCard";

import PaymentHistoryCard from "@/features/membership/components/PaymentHistoryCard";

import DashboardHero from "@/features/dashboard/components/DashboardHero";

import DashboardStats from "@/features/dashboard/components/DashboardStats";

import ProfileVerificationBanner from "@/features/dashboard/components/ProfileVerificationBanner";

import RecommendedMatches from "@/features/dashboard/components/RecommendedMatches";

import ProfileImprovementTips from "@/features/dashboard/components/ProfileImprovementTips";

import DailyVerse from "@/features/dashboard/components/DailyVerse";

import {
  summarizeNotifications,
} from "@/features/dashboard/services/dashboard.service";

import type {
  DashboardQuickAction,
} from "@/features/dashboard/types";

/*
 * =========================================================
 * Quick Actions
 * =========================================================
 */

const quickActions: DashboardQuickAction[] = [
  {
    title: "Complete Profile",

    description:
      "Keep your personal and faith information up to date.",

    href: "/profile",

    icon: "profile",
  },

  {
    title: "Search Matches",

    description:
      "Discover Christian members matching your preferences.",

    href: "/search",

    icon: "search",
  },

  {
    title: "View Interests",

    description:
      "Review members who have expressed interest in you.",

    href: "/received-interests",

    icon: "interests",
  },

  {
    title: "Open Messages",

    description:
      "Continue secure conversations with your connections.",

    href: "/chat",

    icon: "chat",
  },
];

/*
 * =========================================================
 * Member display helpers
 * =========================================================
 */

function getMemberName(
  user: AuthUser | null
): string {
  if (
    user?.fullName?.trim()
  ) {
    return user.fullName.trim();
  }

  if (user?.email) {
    return (
      user.email
        .split("@")[0]
        .trim() ||
      "Member"
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
  icon:
    DashboardQuickAction["icon"]
) {
  if (
    icon === "profile"
  ) {
    return UserRound;
  }

  if (
    icon === "search"
  ) {
    return Search;
  }

  if (
    icon === "interests"
  ) {
    return Heart;
  }

  return MessageCircle;
}

/*
 * =========================================================
 * Dashboard
 * =========================================================
 */

export default function DashboardPage() {
  /*
   * =========================================================
   * Auth
   * =========================================================
   */

  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null
    );

  /*
   * =========================================================
   * Profile verification
   * =========================================================
   */

  const [
    verificationStatus,
    setVerificationStatus,
  ] =
    useState<ProfileVerificationStatus>(
      "NOT_SUBMITTED"
    );

  const [
    verificationReason,
    setVerificationReason,
  ] =
    useState<string | null>(
      null
    );

  const [
    backendCompletionPercentage,
    setBackendCompletionPercentage,
  ] =
    useState(0);

  const [
    backendProfileCompleted,
    setBackendProfileCompleted,
  ] =
    useState(false);

  const [
    verificationLoading,
    setVerificationLoading,
  ] =
    useState(true);

  /*
   * =========================================================
   * Notifications
   * =========================================================
   */

  const {
    notifications,

    unreadCount,

    loading:
      notificationsLoading,

    isRealtimeConnected,
  } =
    useNotifications();

  /*
   * =========================================================
   * Profile Context
   * =========================================================
   */

  const {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    locationInfo,
    aboutInfo,
    photoInfo,
  } =
    useProfile();

  /*
   * =========================================================
   * Logged-in member
   * =========================================================
   */

  useEffect(() => {
    setUser(
      authService.getUser()
    );
  }, []);

  /*
   * =========================================================
   * Load authoritative backend verification state
   * =========================================================
   *
   * Do not rely only on local profile completion.
   *
   * The backend owns:
   *
   * NOT_SUBMITTED
   * PENDING
   * APPROVED
   * REJECTED
   *
   * It also owns the administrator rejection reason.
   */

  useEffect(() => {
    let active = true;

    async function loadVerificationStatus():
      Promise<void> {
      try {
        setVerificationLoading(
          true
        );

        const profile =
          await profileService
            .getProfile();

        if (
          !active ||
          !profile
        ) {
          return;
        }

        setVerificationStatus(
          profile
            .verificationStatus ??
            "NOT_SUBMITTED"
        );

        setVerificationReason(
          profile
            .verificationReason ??
            null
        );

        setBackendCompletionPercentage(
          profile
            .completionPercentage ??
            0
        );

        setBackendProfileCompleted(
          Boolean(
            profile
              .profileCompleted
          )
        );
      } catch (error) {
        console.error(
          "Unable to load dashboard verification status:",
          error
        );
      } finally {
        if (active) {
          setVerificationLoading(
            false
          );
        }
      }
    }

    void loadVerificationStatus();

    return () => {
      active = false;
    };
  }, []);

  /*
   * =========================================================
   * Notification summary
   * =========================================================
   */

  const recentNotifications =
    useMemo(
      () =>
        notifications.slice(
          0,
          5
        ),
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

  /*
   * =========================================================
   * Local profile completion
   * =========================================================
   */

  const profileCompletion =
    useMemo(
      () =>
        calculateProfileCompletion(
          {
            basicInfo,
            churchInfo,
            educationInfo,
            familyInfo,
            preferenceInfo,
            locationInfo,
            aboutInfo,
            photoInfo,
          }
        ),
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
    getMemberName(
      user
    );

  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (
    <div className="space-y-5 pb-8">

      {/* =====================================================
          Welcome
          ===================================================== */}

      <DashboardHero
        greeting={
          getGreeting()
        }
        memberName={
          memberName
        }
        unreadCount={
          unreadCount
        }
        isRealtimeConnected={
          isRealtimeConnected
        }
      />

      {/* =====================================================
          Profile Verification Status
          =====================================================
       *
       * Shown immediately after login/welcome so members
       * cannot easily miss a rejected, pending or incomplete
       * verification state.
       */}

      <ProfileVerificationBanner
        status={
          verificationStatus
        }
        completionPercentage={
          backendProfileCompleted
            ? 100
            : backendCompletionPercentage
        }
        profileCompleted={
          backendProfileCompleted
        }
        reason={
          verificationReason
        }
        loading={
          verificationLoading
        }
      />

      {/* =====================================================
          Activity Overview
          ===================================================== */}

      <DashboardStats
        unreadNotifications={
          notificationSummary
            .unread
        }
        messageNotifications={
          notificationSummary
            .messages
        }
        interestNotifications={
          notificationSummary
            .interests
        }
        totalActivity={
          notificationSummary
            .total
        }
      />

      {/* =====================================================
          Matches + Profile Guidance
          ===================================================== */}

      <section className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)]">
        <RecommendedMatches
          matches={[]}
        />

        <ProfileImprovementTips
          percentage={
            profileCompletion
              .percentage
          }
          pendingSections={
            profileCompletion
              .pending
          }
        />
      </section>

      {/* =====================================================
          Daily Verse
          ===================================================== */}

      <DailyVerse />

      {/* =====================================================
          Quick Actions
          ===================================================== */}

      <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-white to-amber-50/50 px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Continue your journey
            </p>

            <h2 className="mt-0.5 text-base font-black text-[#0B2D5C] sm:text-lg">
              Quick Actions
            </h2>
          </div>

          <span className="hidden text-xs font-semibold text-slate-400 sm:block">
            Everything you need, one click away
          </span>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(
            (
              action,
              index
            ) => {
              const Icon =
                getQuickActionIcon(
                  action.icon
                );

              return (
                <Link
                  key={
                    action.title
                  }
                  href={
                    action.href
                  }
                  className={[
                    "group relative flex items-center gap-3.5 px-4 py-4 transition hover:bg-slate-50 sm:px-5",

                    index > 0
                      ? "border-t border-slate-100 sm:border-t-0"
                      : "",

                    index % 2 ===
                    1
                      ? "sm:border-l sm:border-slate-100"
                      : "",

                    index === 2
                      ? "xl:border-l xl:border-slate-100"
                      : "",

                    index === 3
                      ? "xl:border-l xl:border-slate-100"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-amber-50 text-[#0B2D5C] ring-1 ring-slate-100 transition group-hover:scale-105">
                    <Icon
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-[#0B2D5C]">
                      {
                        action.title
                      }
                    </h3>

                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                      {
                        action.description
                      }
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#B38B19]"
                  />
                </Link>
              );
            }
          )}
        </div>
      </section>

      {/* =====================================================
          Profile + Membership
          ===================================================== */}

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <DashboardProfileCard />

        <CurrentMembershipCard />
      </section>

      {/* =====================================================
          Profile Boost
          ===================================================== */}

      <ProfileBoostCard />

      {/* =====================================================
          Recent Activity + Support
          ===================================================== */}

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">

        {/* Recent Activity */}

        <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-white to-amber-50/50 px-4 py-3.5 sm:px-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
                Latest updates
              </p>

              <h2 className="mt-0.5 text-base font-black text-[#0B2D5C] sm:text-lg">
                Recent Activity
              </h2>
            </div>

            {unreadCount >
              0 && (
              <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
                {
                  unreadCount
                }{" "}
                unread
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {notificationsLoading ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                <Loader2
                  size={25}
                  className="animate-spin text-[#0B2D5C]"
                />

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Loading recent activity...
                </p>
              </div>
            ) : recentNotifications
                .length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Bell
                    size={24}
                  />
                </div>

                <h3 className="mt-3 text-sm font-black text-[#0B2D5C]">
                  No recent activity
                </h3>

                <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
                  New messages,
                  interests and account
                  updates will appear
                  here.
                </p>
              </div>
            ) : (
              recentNotifications.map(
                (
                  notification
                ) => (
                  <div
                    key={
                      notification.id
                    }
                    className={[
                      "flex gap-3 px-4 py-3.5 transition sm:px-5",

                      notification
                        .read
                        ? "bg-white"
                        : "bg-amber-50/50",
                    ].join(
                      " "
                    )}
                  >
                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",

                        notification
                          .type ===
                        "NEW_MESSAGE"
                          ? "bg-blue-50 text-blue-600"
                          : notification
                                .type ===
                              "INTEREST_RECEIVED"
                            ? "bg-rose-50 text-rose-500"
                            : notification
                                  .type ===
                                "INTEREST_ACCEPTED"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600",
                      ].join(
                        " "
                      )}
                    >
                      {notification
                        .type ===
                      "NEW_MESSAGE" ? (
                        <MessageCircle
                          size={17}
                        />
                      ) : notification
                          .type ===
                        "INTEREST_RECEIVED" ? (
                        <Heart
                          size={17}
                        />
                      ) : (
                        <Bell
                          size={17}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-900">
                          {
                            notification
                              .title
                          }
                        </h3>

                        {!notification
                          .read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {
                          notification
                            .message
                        }
                      </p>

                      <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                        {new Date(
                          notification
                            .createdAt
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month:
                              "short",
                            hour: "numeric",
                            minute:
                              "2-digit",
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

        {/* Right Column */}

        <div className="space-y-4">

          {/* Safety */}

          <div className="rounded-[20px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <ShieldCheck
                size={19}
              />
            </div>

            <h2 className="mt-4 text-lg font-black text-[#0B2D5C]">
              Safety Reminder
            </h2>

            <p className="mt-2 text-xs leading-6 text-slate-600">
              Verify profile
              information,
              communicate through
              the platform and
              involve trusted family
              or church members
              before making
              important decisions.
            </p>

            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#0B2D5C] transition hover:text-[#B38B19]"
            >
              Contact Support

              <ArrowRight
                size={14}
              />
            </Link>
          </div>

          {/* Payments */}

          <PaymentHistoryCard />
        </div>
      </section>
    </div>
  );
}