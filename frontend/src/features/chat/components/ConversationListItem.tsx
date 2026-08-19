import {
  CheckCheck,
} from "lucide-react";

import type {
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
      onClick={
        onSelect
      }
      className={[
        "group relative w-full border-b border-slate-100 px-3 py-3 text-left transition duration-200",

        selected
          ? "bg-gradient-to-r from-blue-50 to-indigo-50/50"
          : "bg-white hover:bg-slate-50/80",
      ].join(" ")}
    >
      {selected && (
        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#D4AF37]" />
      )}

      <div className="flex items-center gap-2.5">
        <UserAvatar
          fullName={
            otherUser.fullName
          }
          photoUrl={
            otherUser.photoUrl
          }
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={[
                "truncate text-xs",

                unreadCount > 0
                  ? "font-black text-[#0B2D5C]"
                  : "font-bold text-slate-700",
              ].join(" ")}
            >
              {
                otherUser.fullName
              }
            </h3>

            <span
              className={[
                "shrink-0 text-[9px]",

                unreadCount > 0
                  ? "font-black text-blue-600"
                  : "text-slate-400",
              ].join(" ")}
            >
              {formatConversationTime(
                lastMessageAt
              )}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <p
              className={[
                "flex min-w-0 flex-1 items-center gap-1 truncate text-[10px]",

                unreadCount > 0
                  ? "font-bold text-slate-700"
                  : "text-slate-500",
              ].join(" ")}
            >
              {lastMessageWasMine && (
                <CheckCheck
                  size={12}
                  className="shrink-0 text-blue-500"
                />
              )}

              <span className="truncate">
                {lastMessage ||
                  "Start a conversation"}
              </span>
            </p>

            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-1 text-[8px] font-black text-white shadow-sm">
                {unreadCount >
                99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </div>

          {(otherUser.profession ||
            otherUser.city) && (
            <p className="mt-1 truncate text-[9px] font-medium text-slate-400">
              {[
                otherUser.profession,
                otherUser.city,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
