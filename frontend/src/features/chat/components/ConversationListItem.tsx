import {
  CheckCheck,
} from "lucide-react";

import {
  Conversation,
} from "@/features/chat/types";

import UserAvatar from "./UserAvatar";

import {
  formatConversationTime,
} from "@/features/chat/utils/chat.utils";

interface ConversationListItemProps {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
}

export default function ConversationListItem({
  conversation,
  selected,
  onSelect,
}: ConversationListItemProps) {
  const {
    otherUser,
    lastMessage,
    lastMessageAt,
    lastMessageSenderId,
    unreadCount,
  } = conversation;

  const lastMessageWasMine =
    lastMessageSenderId &&
    lastMessageSenderId !==
      otherUser.userId;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-slate-100 px-4 py-4 text-left transition ${
        selected
          ? "bg-blue-50"
          : "bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          fullName={otherUser.fullName}
          photoUrl={otherUser.photoUrl}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`truncate text-sm ${
                unreadCount > 0
                  ? "font-bold text-slate-950"
                  : "font-semibold text-slate-800"
              }`}
            >
              {otherUser.fullName}
            </h3>

            <span
              className={`shrink-0 text-xs ${
                unreadCount > 0
                  ? "font-semibold text-blue-600"
                  : "text-slate-400"
              }`}
            >
              {formatConversationTime(
                lastMessageAt
              )}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <p
              className={`flex min-w-0 flex-1 items-center gap-1 truncate text-sm ${
                unreadCount > 0
                  ? "font-semibold text-slate-800"
                  : "text-slate-500"
              }`}
            >
              {lastMessageWasMine && (
                <CheckCheck
                  size={15}
                  className="shrink-0 text-blue-500"
                />
              )}

              <span className="truncate">
                {lastMessage ||
                  "Start a conversation"}
              </span>
            </p>

            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}