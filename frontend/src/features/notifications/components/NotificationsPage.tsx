"use client";

import Link from "next/link";

import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  Crown,
  Eye,
  Heart,
  Mail,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";

import {
  ReactNode,
  useMemo,
  useState,
} from "react";

import useNotifications from "@/features/notifications/hooks/useNotifications";

import type {
  AppNotification,
  NotificationType,
} from "@/features/notifications/types";

type NotificationFilter =
  | "all"
  | "unread";

function formatRelativeTime(
  value: string
): string {
  const createdAt =
    new Date(value).getTime();

  const difference =
    Date.now() - createdAt;

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

interface NotificationVisual {
  icon: ReactNode;
  containerClassName: string;
}

function getNotificationVisual(
  type: NotificationType
): NotificationVisual {
  switch (type) {
    case "NEW_MESSAGE":
      return {
        icon: (
          <MessageCircle
            size={16}
          />
        ),

        containerClassName:
          "bg-blue-50 text-blue-700 ring-blue-100",
      };

    case "INTEREST_RECEIVED":
      return {
        icon: (
          <Heart
            size={16}
            fill="currentColor"
          />
        ),

        containerClassName:
          "bg-rose-50 text-rose-600 ring-rose-100",
      };

    case "INTEREST_ACCEPTED":
      return {
        icon: (
          <UserCheck
            size={16}
          />
        ),

        containerClassName:
          "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };

    case "INTEREST_REJECTED":
      return {
        icon: (
          <Mail
            size={16}
          />
        ),

        containerClassName:
          "bg-slate-100 text-slate-600 ring-slate-200",
      };

    case "PROFILE_VIEWED":
      return {
        icon: (
          <Eye
            size={16}
          />
        ),

        containerClassName:
          "bg-violet-50 text-violet-700 ring-violet-100",
      };

    case "PROFILE_APPROVED":
      return {
        icon: (
          <Check
            size={16}
            strokeWidth={3}
          />
        ),

        containerClassName:
          "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };

    case "PROFILE_REJECTED":
      return {
        icon: (
          <ShieldAlert
            size={16}
          />
        ),

        containerClassName:
          "bg-red-50 text-red-600 ring-red-100",
      };

    case "MEMBERSHIP_ACTIVATED":
      return {
        icon: (
          <Crown
            size={16}
          />
        ),

        containerClassName:
          "bg-amber-50 text-amber-700 ring-amber-100",
      };

    case "MEMBERSHIP_EXPIRING":
      return {
        icon: (
          <Clock3
            size={16}
          />
        ),

        containerClassName:
          "bg-orange-50 text-orange-700 ring-orange-100",
      };

    default:
      return {
        icon: (
          <Bell
            size={16}
          />
        ),

        containerClassName:
          "bg-slate-100 text-slate-600 ring-slate-200",
      };
  }
}

export default function NotificationsPage() {
  const [
    filter,
    setFilter,
  ] =
    useState<NotificationFilter>(
      "all"
    );

  const {
    notifications,
    unreadCount,
    loading,
    error,
    socketStatus,
    refresh,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const realtimeConnected =
    socketStatus ===
    "connected";

  const visibleNotifications =
    useMemo(() => {
      if (
        filter === "unread"
      ) {
        return notifications.filter(
          (notification) =>
            !notification.read
        );
      }

      return notifications;
    }, [
      filter,
      notifications,
    ]);

  return (
    <div className="space-y-4 pb-8">

      {/* =====================================================
          Premium Header
          ===================================================== */}

      <section className="relative overflow-hidden rounded-[20px] border border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-4 py-4 text-white shadow-[0_12px_34px_rgba(11,45,92,0.15)] sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 left-[30%] h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#F2D675]">
              <BellRing
                size={18}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles
                  size={10}
                  className="text-[#F2D675]"
                />

                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675]">
                  Activity Center
                </p>
              </div>

              <h1 className="mt-0.5 text-xl font-black tracking-[-0.025em] sm:text-2xl">
                Notifications
              </h1>

              <p className="mt-1 max-w-xl text-[11px] leading-5 text-blue-100 sm:text-xs">
                Keep track of messages,
                interests, profile activity
                and membership updates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black",

                realtimeConnected
                  ? "border-emerald-300/25 bg-emerald-400/15 text-emerald-200"
                  : "border-amber-300/25 bg-amber-400/15 text-amber-100",
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",

                  realtimeConnected
                    ? "bg-emerald-400"
                    : "bg-amber-400",
                ].join(" ")}
              />

              {realtimeConnected
                ? "Live connected"
                : "Auto refresh"}
            </span>

            {unreadCount > 0 && (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-black">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}{" "}
                unread
              </span>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          Toolbar
          ===================================================== */}

      <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-white to-amber-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FilterButton
              active={
                filter === "all"
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
              <span className="ml-1 text-[9px] opacity-60">
                {
                  notifications.length
                }
              </span>
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "unread"
              }
              onClick={() =>
                setFilter(
                  "unread"
                )
              }
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[8px] font-black text-white">
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </FilterButton>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              disabled={
                loading
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B2D5C] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  void markAllAsRead();
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-3 text-[10px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CheckCheck
                  size={12}
                />

                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            Error
            =================================================== */}

        {error &&
          notifications.length >
            0 && (
          <div className="border-b border-red-100 bg-red-50/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-red-700">
              <ShieldAlert
                size={13}
              />

              {error}
            </div>
          </div>
        )}

        {/* ===================================================
            Content
            =================================================== */}

        <div>
          {loading &&
          notifications.length ===
            0 ? (
            <LoadingState />
          ) : error &&
            notifications.length ===
              0 ? (
            <ErrorState
              message={error}
            />
          ) : visibleNotifications.length ===
            0 ? (
            <EmptyState
              filter={filter}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleNotifications.map(
                (
                  notification
                ) => (
                  <NotificationRow
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onRead={
                      markAsRead
                    }
                    onDelete={
                      removeNotification
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "inline-flex h-8 items-center rounded-lg border px-2.5 text-[10px] font-black transition",

        active
          ? "border-blue-200 bg-blue-50 text-[#0B2D5C] shadow-sm"
          : "border-transparent bg-transparent text-slate-500 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function NotificationRow({
  notification,
  onRead,
  onDelete,
}: {
  notification:
    AppNotification;

  onRead: (
    notificationId: string
  ) => Promise<void>;

  onDelete: (
    notificationId: string
  ) => Promise<void>;
}) {
  const visual =
    getNotificationVisual(
      notification.type
    );

  const content = (
    <div
      className={[
        "group relative flex gap-3 px-4 py-3.5 transition sm:px-5",

        notification.read
          ? "bg-white hover:bg-slate-50/70"
          : "bg-gradient-to-r from-blue-50/70 via-white to-amber-50/30 hover:from-blue-50",
      ].join(" ")}
      onClick={() => {
        void onRead(
          notification.id
        );
      }}
    >
      {!notification.read && (
        <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[#D4AF37]" />
      )}

      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1",

          notification.imageUrl
            ? "bg-slate-100 ring-slate-200"
            : visual.containerClassName,
        ].join(" ")}
      >
        {notification.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              notification.imageUrl
            }
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          visual.icon
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={[
                  "truncate text-xs sm:text-sm",

                  notification.read
                    ? "font-bold text-slate-700"
                    : "font-black text-[#0B2D5C]",
                ].join(" ")}
              >
                {notification.title}
              </h3>

              {!notification.read && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.10)]" />
              )}
            </div>

            <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-slate-500 sm:text-[11px]">
              {
                notification.message
              }
            </p>

            <p className="mt-1.5 text-[9px] font-semibold text-slate-400">
              {formatRelativeTime(
                notification.createdAt
              )}
            </p>
          </div>

          <button
            type="button"
            aria-label="Remove notification"
            title="Remove"
            onClick={(
              event
            ) => {
              event.preventDefault();
              event.stopPropagation();

              void onDelete(
                notification.id
              );
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-70 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2
              size={12}
            />
          </button>
        </div>
      </div>
    </div>
  );

  if (
    notification.actionUrl
  ) {
    return (
      <Link
        href={
          notification.actionUrl
        }
        className="block"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function LoadingState() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({
        length: 6,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-3 rounded-xl px-2 py-3"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/5 rounded bg-slate-200" />

              <div className="h-2.5 w-4/5 rounded bg-slate-100" />

              <div className="h-2 w-1/5 rounded bg-slate-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({
  filter,
}: {
  filter: NotificationFilter;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-amber-50 text-[#0B2D5C] ring-1 ring-blue-100">
        {filter ===
        "unread" ? (
          <CheckCheck
            size={20}
          />
        ) : (
          <Bell
            size={20}
          />
        )}
      </div>

      <h3 className="mt-3 text-sm font-black text-[#0B2D5C]">
        {filter ===
        "unread"
          ? "No unread notifications"
          : "No notifications yet"}
      </h3>

      <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-500">
        {filter ===
        "unread"
          ? "You're all caught up. New activity will appear here automatically."
          : "Messages, interests, profile updates and membership activity will appear here."}
      </p>
    </div>
  );
}

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
        <ShieldAlert
          size={18}
        />
      </div>

      <h3 className="mt-3 text-sm font-black text-red-700">
        Unable to load notifications
      </h3>

      <p className="mt-1 max-w-sm text-[11px] leading-5 text-red-500">
        {message}
      </p>
    </div>
  );
}
