"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import type {
  PresenceStatus,
} from "@/features/chat/api/presence.service";

import type {
  Conversation,
} from "@/features/chat/types";

import type {
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
    ).formatToParts(
      date
    );

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
        difference /
          60000
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
    getIndiaDateKey(
      date
    ) ===
    getIndiaDateKey(
      now
    );

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
        getIndiaYear(
          date
        ) ===
        getIndiaYear(
          now
        )
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
    presence?.online ===
    true;

  let statusText =
    realtimeConnected
      ? "Chat connected"
      : "Connecting…";

  let statusClass =
    "text-slate-400";

  if (
    blockStatus?.messagingBlocked
  ) {
    statusText =
      "Messaging unavailable";

    statusClass =
      "font-bold text-amber-600";
  } else if (
    otherUserTyping
  ) {
    statusText =
      "Typing…";

    statusClass =
      "font-bold text-emerald-600";
  } else if (online) {
    statusText =
      "Online";

    statusClass =
      "font-bold text-emerald-600";
  } else if (
    presence
  ) {
    statusText =
      formatLastSeen(
        presence.lastSeenAt
      );
  }

  return (
    <header className="flex min-h-[58px] items-center gap-2.5 border-b border-slate-100 bg-white px-3 py-2.5 sm:px-4">
      <button
        type="button"
        onClick={
          onBack
        }
        aria-label="Back to conversations"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0B2D5C] md:hidden"
      >
        <ArrowLeft
          size={18}
        />
      </button>

      <div className="relative">
        <UserAvatar
          fullName={
            user.fullName
          }
          photoUrl={
            user.photoUrl
          }
          size="sm"
        />

        <span
          title={
            online
              ? "Online"
              : "Offline"
          }
          className={[
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",

            online
              ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.12)]"
              : "bg-slate-400",
          ].join(" ")}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-black text-[#0B2D5C]">
            {user.fullName}

            {user.age
              ? `, ${user.age}`
              : ""}
          </h2>

          {online && (
            <span className="hidden rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-black text-emerald-700 sm:inline">
              ONLINE
            </span>
          )}
        </div>

        <p
          className={`mt-0.5 truncate text-[10px] ${statusClass}`}
        >
          {statusText}
        </p>
      </div>

      <Link
        href={`/browse/${user.profileId}`}
        title="View profile"
        aria-label={`View ${user.fullName}'s profile`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <ExternalLink
          size={14}
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
