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
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import useNotifications from "@/features/notifications/hooks/useNotifications";

import {
  AppNotification,
  NotificationType,
} from "@/features/notifications/types";

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
            size={15}
          />
        ),
        containerClassName:
          "bg-blue-50 text-blue-700 ring-blue-100",
      };

    case "INTEREST_RECEIVED":
      return {
        icon: (
          <Heart
            size={15}
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
            size={15}
          />
        ),
        containerClassName:
          "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };

    case "INTEREST_REJECTED":
      return {
        icon: (
          <Mail
            size={15}
          />
        ),
        containerClassName:
          "bg-slate-100 text-slate-600 ring-slate-200",
      };

    case "PROFILE_VIEWED":
      return {
        icon: (
          <Eye
            size={15}
          />
        ),
        containerClassName:
          "bg-violet-50 text-violet-700 ring-violet-100",
      };

    case "PROFILE_APPROVED":
      return {
        icon: (
          <Check
            size={15}
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
            size={15}
          />
        ),
        containerClassName:
          "bg-red-50 text-red-600 ring-red-100",
      };

    case "MEMBERSHIP_ACTIVATED":
      return {
        icon: (
          <Crown
            size={15}
          />
        ),
        containerClassName:
          "bg-amber-50 text-amber-700 ring-amber-100",
      };

    case "MEMBERSHIP_EXPIRING":
      return {
        icon: (
          <Clock3
            size={15}
          />
        ),
        containerClassName:
          "bg-orange-50 text-orange-700 ring-orange-100",
      };

    default:
      return {
        icon: (
          <Bell
            size={15}
          />
        ),
        containerClassName:
          "bg-slate-100 text-slate-600 ring-slate-200",
      };
  }
}

interface NotificationItemProps {
  notification:
    AppNotification;

  onRead: (
    notificationId: string
  ) => Promise<void>;

  onDelete: (
    notificationId: string
  ) => Promise<void>;

  onClose: () => void;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const visual =
    getNotificationVisual(
      notification.type
    );

  const content = (
    <div
      className={[
        "group relative flex gap-2.5 px-3 py-2.5 transition duration-200",

        notification.read
          ? "bg-white hover:bg-slate-50/80"
          : "bg-gradient-to-r from-blue-50/80 via-white to-amber-50/40 hover:from-blue-50",
      ].join(" ")}
      onClick={() => {
        void onRead(
          notification.id
        );

        onClose();
      }}
    >
      {!notification.read && (
        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#D4AF37]" />
      )}

      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1",

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
        <div className="flex items-start gap-2">
          <p
            className={[
              "min-w-0 flex-1 text-[11px] leading-4",

              notification.read
                ? "font-bold text-slate-700"
                : "font-black text-[#0B2D5C]",
            ].join(" ")}
          >
            {notification.title}
          </p>

          {!notification.read && (
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.10)]"
              title="Unread"
            />
          )}
        </div>

        <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-500">
          {notification.message}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="text-[9px] font-semibold text-slate-400">
            {formatRelativeTime(
              notification.createdAt
            )}
          </span>

          <button
            type="button"
            aria-label="Remove notification"
            title="Remove"
            className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[9px] font-bold text-slate-400 opacity-70 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={(
              event
            ) => {
              event.preventDefault();
              event.stopPropagation();

              void onDelete(
                notification.id
              );
            }}
          >
            <Trash2
              size={10}
            />

            <span className="hidden sm:inline">
              Remove
            </span>
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
        className="block border-b border-slate-100 last:border-b-0"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {content}
    </div>
  );
}

export default function NotificationBell() {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const {
    notifications,
    unreadCount,
    loading,
    error,
    socketStatus,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const realtimeConnected =
    socketStatus ===
    "connected";

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* =====================================================
          Notification Trigger
          ===================================================== */}

      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className={[
          "relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition duration-200",

          open
            ? "border-[#D4AF37]/60 bg-amber-50 text-[#0B2D5C] ring-4 ring-amber-50"
            : "border-slate-200 bg-white text-slate-500 hover:-translate-y-0.5 hover:border-[#D4AF37]/50 hover:bg-amber-50/70 hover:text-[#0B2D5C] hover:shadow-md",
        ].join(" ")}
      >
        {unreadCount > 0 ? (
          <BellRing
            size={17}
          />
        ) : (
          <Bell
            size={17}
          />
        )}

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
            {unreadCount >
            99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* =====================================================
          Notification Panel
          ===================================================== */}

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,370px)] overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

          {/* Header */}
          <div className="relative overflow-hidden border-b border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-3.5 py-3 text-white">
            <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1">
                  <Sparkles
                    size={9}
                    className="text-[#F2D675]"
                  />

                  <p className="text-[8px] font-black uppercase tracking-[0.13em] text-[#F2D675]">
                    Activity Center
                  </p>
                </div>

                <div className="mt-0.5 flex items-center gap-2">
                  <h2 className="text-sm font-black">
                    Notifications
                  </h2>

                  {unreadCount > 0 && (
                    <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[8px] font-black">
                      {unreadCount >
                      99
                        ? "99+"
                        : unreadCount}{" "}
                      new
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-blue-100">
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",

                      realtimeConnected
                        ? "bg-emerald-400"
                        : "bg-amber-400",
                    ].join(" ")}
                  />

                  {realtimeConnected
                    ? "Live updates connected"
                    : "Updating automatically"}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount >
                  0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void markAllAsRead();
                    }}
                    title="Mark all as read"
                    className="flex h-7 items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2 text-[8px] font-black text-white transition hover:bg-white/20"
                  >
                    <CheckCheck
                      size={11}
                    />

                    <span className="hidden sm:inline">
                      Mark all read
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  aria-label="Close notifications"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <X
                    size={13}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="max-h-[390px] overflow-y-auto">
            {loading ? (
              <NotificationLoadingState />
            ) : error &&
              notifications.length ===
                0 ? (
              <NotificationErrorState
                message={error}
              />
            ) : notifications.length ===
              0 ? (
              <NotificationEmptyState />
            ) : (
              notifications.map(
                (
                  notification
                ) => (
                  <NotificationItem
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
                    onClose={() =>
                      setOpen(
                        false
                      )
                    }
                  />
                )
              )
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-3.5 py-2">
            <Link
              href="/notifications"
              onClick={() =>
                setOpen(false)
              }
              className="text-[9px] font-black text-[#0B2D5C] transition hover:text-[#B38B19]"
            >
              View all notifications
            </Link>

            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500">
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",

                  realtimeConnected
                    ? "bg-emerald-500"
                    : "bg-amber-500",
                ].join(" ")}
              />

              {realtimeConnected
                ? "Live"
                : "Auto refresh"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationLoadingState() {
  return (
    <div className="space-y-1 p-2.5">
      {Array.from({
        length: 4,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-2.5 rounded-xl px-2 py-2.5"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-2/5 rounded bg-slate-200" />

              <div className="h-2.5 w-4/5 rounded bg-slate-100" />

              <div className="h-2 w-1/4 rounded bg-slate-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function NotificationEmptyState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-amber-50 text-[#0B2D5C] ring-1 ring-blue-100">
        <Bell
          size={18}
        />
      </div>

      <h3 className="mt-3 text-xs font-black text-[#0B2D5C]">
        You&apos;re all caught up
      </h3>

      <p className="mt-1 max-w-[240px] text-[10px] leading-5 text-slate-500">
        New messages, interests, profile activity and membership updates will appear here.
      </p>
    </div>
  );
}

function NotificationErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
        <ShieldAlert
          size={17}
        />
      </div>

      <h3 className="mt-3 text-xs font-black text-red-700">
        Notifications unavailable
      </h3>

      <p className="mt-1 max-w-[260px] text-[10px] leading-5 text-red-500">
        {message}
      </p>
    </div>
  );
}
