"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
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
      ? "Secure chat connected"
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
      "Online now";

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

  const memberMeta = [
    user.profession,
    user.city,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <header
      className="
        relative
        z-30
        flex
        min-h-[72px]
        shrink-0
        items-center
        gap-3
        border-b
        border-slate-200/80
        bg-white/95
        px-3
        py-2.5
        backdrop-blur-xl
        sm:px-4
      "
    >
      {/* Mobile Back */}

      <button
        type="button"
        onClick={
          onBack
        }
        aria-label="Back to conversations"
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-500
          shadow-sm
          transition
          hover:border-blue-200
          hover:bg-blue-50
          hover:text-[#0B2D5C]
          md:hidden
        "
      >
        <ArrowLeft
          size={17}
        />
      </button>

      {/* Avatar */}

      <div className="relative shrink-0">
        <div
          className="
            rounded-full
            ring-2
            ring-white
            shadow-[0_4px_14px_rgba(15,23,42,0.10)]
          "
        >
          <UserAvatar
            fullName={
              user.fullName
            }
            photoUrl={
              user.photoUrl
            }
          />
        </div>

        <span
          title={
            online
              ? "Online"
              : "Offline"
          }
          className={[
            `
              absolute
              bottom-0
              right-0
              h-3
              w-3
              rounded-full
              border-[2.5px]
              border-white
            `,

            online
              ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
              : "bg-slate-400",
          ].join(" ")}
        />
      </div>

      {/* Identity */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            className="
              truncate
              text-[15px]
              font-black
              tracking-[-0.025em]
              text-[#0B2D5C]
              sm:text-base
            "
          >
            {user.fullName}

            {user.age
              ? `, ${user.age}`
              : ""}
          </h2>

          {online && (
            <span
              className="
                hidden
                shrink-0
                items-center
                gap-1
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-2
                py-0.5
                text-[8px]
                font-black
                uppercase
                tracking-wide
                text-emerald-700
                sm:inline-flex
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              Online
            </span>
          )}
        </div>

        <div className="mt-0.5 flex min-w-0 items-center gap-2">
          <p
            className={[
              `
                truncate
                text-[10px]
                sm:text-[11px]
              `,

              statusClass,
            ].join(" ")}
          >
            {statusText}
          </p>

          {memberMeta && (
            <>
              <span className="hidden text-slate-300 lg:inline">
                •
              </span>

              <span
                className="
                  hidden
                  truncate
                  text-[10px]
                  font-medium
                  text-slate-400
                  lg:block
                "
              >
                {memberMeta}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Security indicator */}

      <div
        className="
          hidden
          items-center
          gap-1.5
          rounded-full
          border
          border-emerald-100
          bg-emerald-50/70
          px-2.5
          py-1.5
          text-[9px]
          font-bold
          text-emerald-700
          xl:flex
        "
        title="Private and protected messaging"
      >
        <ShieldCheck
          size={12}
        />

        Secure
      </div>

      {/* View profile */}

      <Link
        href={`/browse/${user.profileId}`}
        title="View profile"
        aria-label={`View ${user.fullName}'s profile`}
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-500
          shadow-sm
          transition-all
          hover:-translate-y-0.5
          hover:border-blue-200
          hover:bg-blue-50
          hover:text-blue-700
        "
      >
        <ExternalLink
          size={15}
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