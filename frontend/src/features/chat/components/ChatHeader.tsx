import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import {
  Conversation,
} from "@/features/chat/types";

import {
  getUserLocation,
} from "@/features/chat/utils/chat.utils";

import UserAvatar from "./UserAvatar";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ChatHeader({
  conversation,
  onBack,
}: ChatHeaderProps) {
  const user = conversation.otherUser;

  const location =
    getUserLocation(user);

  const details = [
    user.profession,
    user.denomination,
    location,
  ].filter(Boolean);

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

      <UserAvatar
        fullName={user.fullName}
        photoUrl={user.photoUrl}
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate font-bold text-slate-900">
          {user.fullName}
          {user.age
            ? `, ${user.age}`
            : ""}
        </h2>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {details.join(" • ") ||
            "Holy Matrimony member"}
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