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

import UserAvatar from "./UserAvatar";

interface ChatHeaderProps {
  conversation: Conversation;
  presence: PresenceStatus | null;
  realtimeConnected: boolean;
  otherUserTyping: boolean;
  onBack: () => void;
}

function formatLastSeen(
  value: string | null
): string {
  if (!value) {
    return "Offline";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Offline";
  }

  const now = new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minutes =
    Math.floor(
      difference / 60000
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
    date.toDateString() ===
    now.toDateString();

  if (today) {
    return `Last seen today at ${date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )}`;
  }

  return `Last seen ${date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year:
        date.getFullYear() ===
        now.getFullYear()
          ? undefined
          : "numeric",
    }
  )}`;
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
    statusText = "Typing…";
    statusClass =
      "font-semibold text-emerald-600";
  } else if (online) {
    statusText = "Online";
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
          fullName={user.fullName}
          photoUrl={user.photoUrl}
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
        <ExternalLink size={18} />
      </Link>
    </header>
  );
}