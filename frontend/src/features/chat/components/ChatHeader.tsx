
"use client";

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
  BlockStatusResponse,
} from "@/features/safety/api/safety.service";

import {
  parseBackendDate,
} from "@/features/chat/utils/chat.utils";

import ChatSafetyMenu from "./ChatSafetyMenu";
import UserAvatar from "./UserAvatar";

interface ChatHeaderProps {
  conversation: Conversation;
  presence: PresenceStatus | null;
  realtimeConnected: boolean;
  otherUserTyping: boolean;

  blockStatus:
    BlockStatusResponse | null;

      onDeleteConversation: (
    conversationId: string
  ) => Promise<void>;

  onBlockStatusChange: (
    status: BlockStatusResponse
  ) => void;

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
  blockStatus,
  onBlockStatusChange,
  onDeleteConversation,
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

  if (
    blockStatus?.messagingBlocked
  ) {
    statusText =
      "Messaging unavailable";

    statusClass =
      "font-medium text-amber-700";
  } else if (otherUserTyping) {
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
    <header className="flex min-h-[64px] items-center gap-2.5 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4 md:px-5">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to conversations"
        className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
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
        className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <ExternalLink
          size={18}
        />
      </Link>

           <ChatSafetyMenu
        userId={
          user.userId
        }
        userName={
          user.fullName
        }
        conversationId={
          conversation.id
        }
        blockStatus={
          blockStatus
        }
        onBlockStatusChange={
          onBlockStatusChange
        }
        onDeleteConversation={
          onDeleteConversation
        }
      />
    </header>
  );
}