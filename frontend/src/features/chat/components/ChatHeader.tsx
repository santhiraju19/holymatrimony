import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import {
  PresenceStatus,
} from "@/features/chat/api/presence.service";

import {
  Conversation,
} from "@/features/chat/types";

import {
  parseBackendDate,
} from "@/features/chat/utils/chat.utils";

import UserAvatar from "./UserAvatar";

interface ChatHeaderProps {
  conversation: Conversation;
  presence: PresenceStatus | null;
  realtimeConnected: boolean;
  otherUserTyping: boolean;
  onBack: () => void;
}

const INDIA_TIME_ZONE =
  "Asia/Kolkata";

function getIndiaDateKey(
  date: Date
): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          INDIA_TIME_ZONE,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function getIndiaYear(
  date: Date
): number {
  return Number(
    new Intl.DateTimeFormat(
      "en",
      {
        timeZone:
          INDIA_TIME_ZONE,

        year: "numeric",
      }
    ).format(date)
  );
}

function formatLastSeen(
  value: string | null
): string {
  const date =
    parseBackendDate(
      value
    );

  if (!date) {
    return "Offline";
  }

  const now =
    new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minutes =
    Math.max(
      0,
      Math.floor(
        difference / 60000
      )
    );

  if (minutes < 1) {
    return "Last seen just now";
  }

  if (minutes < 60) {
    return `Last seen ${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  const today =
    getIndiaDateKey(date) ===
    getIndiaDateKey(now);

  if (today) {
    return `Last seen today at ${new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone:
          INDIA_TIME_ZONE,

        hour: "numeric",
        minute: "2-digit",

        hour12: true,
      }
    ).format(date)}`;
  }

  return `Last seen ${new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        INDIA_TIME_ZONE,

      day: "numeric",
      month: "short",

      year:
        getIndiaYear(date) ===
        getIndiaYear(now)
          ? undefined
          : "numeric",
    }
  ).format(date)}`;
}

export default function ChatHeader({
  conversation,
  presence,
  realtimeConnected,
  otherUserTyping,
  onBack,
}: ChatHeaderProps) {
  const user =
    conversation.otherUser;

  const online =
    presence?.online === true;

  let statusText =
    realtimeConnected
      ? "Chat connected"
      : "Connecting…";

  let statusClass =
    "text-slate-500";

  if (otherUserTyping) {
    statusText =
      "Typing…";

    statusClass =
      "font-semibold text-emerald-600";
  } else if (online) {
    statusText =
      "Online";

    statusClass =
      "font-semibold text-emerald-600";
  } else if (presence) {
    statusText =
      formatLastSeen(
        presence.lastSeenAt
      );
  }

  return (
    <header className="flex min-h-20 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">

      <button
        type="button"
        onClick={onBack}
        aria-label="Back to conversations"
        className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
      >
        <ArrowLeft size={21} />
      </button>

      <div className="relative">
        <UserAvatar
          fullName={
            user.fullName
          }
          photoUrl={
            user.photoUrl
          }
        />

        <span
          title={
            online
              ? "Online"
              : "Offline"
          }
          className={[
            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",

            online
              ? "bg-emerald-500"
              : "bg-slate-400",
          ].join(" ")}
        />
      </div>

      <div className="min-w-0 flex-1">

        <h2 className="truncate font-bold text-slate-900">
          {user.fullName}

          {user.age
            ? `, ${user.age}`
            : ""}
        </h2>

        <p
          className={`mt-0.5 truncate text-xs ${statusClass}`}
        >
          {statusText}
        </p>

      </div>

      <Link
        href={`/profile/${user.profileId}`}
        title="View profile"
        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <ExternalLink
          size={18}
        />
      </Link>

    </header>
  );
}