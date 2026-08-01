
"use client";

import Link from "next/link";
import {
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
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  ).format(new Date(value));
}

function getNotificationIcon(
  type: NotificationType
): string {
  switch (type) {
    case "NEW_MESSAGE":
      return "💬";

    case "INTEREST_RECEIVED":
      return "💖";

    case "INTEREST_ACCEPTED":
      return "🎉";

    case "INTEREST_REJECTED":
      return "📨";

    case "PROFILE_VIEWED":
      return "👀";

    case "PROFILE_APPROVED":
      return "✅";

    case "PROFILE_REJECTED":
      return "⚠️";

    case "MEMBERSHIP_ACTIVATED":
      return "👑";

    case "MEMBERSHIP_EXPIRING":
      return "⏳";

    default:
      return "🔔";
  }
}

interface NotificationItemProps {
  notification: AppNotification;

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
  const content = (
    <div
      className={[
        "flex gap-3 px-4 py-3 transition",
        notification.read
          ? "bg-white hover:bg-slate-50"
          : "bg-amber-50/70 hover:bg-amber-50",
      ].join(" ")}
      onClick={() => {
        void onRead(notification.id);
        onClose();
      }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
        {notification.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notification.imageUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          getNotificationIcon(
            notification.type
          )
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">
            {notification.title}
          </p>

          {!notification.read && (
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D4AF37]" />
          )}
        </div>

        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
          {notification.message}
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {formatRelativeTime(
              notification.createdAt
            )}
          </span>

          <button
            type="button"
            className="text-xs font-medium text-slate-400 transition hover:text-red-600"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              void onDelete(
                notification.id
              );
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link
        href={notification.actionUrl}
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
  const [open, setOpen] =
    useState(false);

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

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:border-[#D4AF37] hover:bg-amber-50"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,400px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#0B2D5C]">
                Notifications
              </h2>

              <p className="text-xs text-slate-500">
                {socketStatus ===
                "connected"
                  ? "Live updates connected"
                  : "Updating automatically"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  void markAllAsRead();
                }}
                className="text-xs font-semibold text-[#0B2D5C] transition hover:text-[#D4AF37]"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : error &&
              notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-red-600">
                {error}
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-3xl">
                  🔔
                </div>

                <p className="mt-2 font-medium text-slate-700">
                  No notifications yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  New messages and interests
                  will appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={
                      notification
                    }
                    onRead={markAsRead}
                    onDelete={
                      removeNotification
                    }
                    onClose={() =>
                      setOpen(false)
                    }
                  />
                )
              )
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">
            Showing your latest notifications
          </div>
        </div>
      )}
    </div>
  );
}