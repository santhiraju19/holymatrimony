import {
  CheckCheck,
  ImageIcon,
} from "lucide-react";

import type {
  Conversation,
} from "@/features/chat/types";

import {
  formatConversationTime,
} from "@/features/chat/utils/chat.utils";

import UserAvatar from "./UserAvatar";

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
    Boolean(
      lastMessageSenderId &&
      lastMessageSenderId !==
        otherUser.userId
    );

  const unread =
    unreadCount > 0;

  const preview =
    lastMessage?.trim() ||
    "Start a conversation";

  const imageMessage =
    preview
      .toLowerCase()
      .includes(
        "image"
      );

  const metadata = [
    otherUser.profession,
    otherUser.city,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <button
      type="button"
      onClick={
        onSelect
      }
      className={[
        `
          group
          relative
          mx-2
          mb-1
          block
          w-[calc(100%-1rem)]
          overflow-hidden
          rounded-2xl
          border
          px-3
          py-3
          text-left
          transition-all
          duration-200
        `,

        selected
          ? `
              border-blue-100
              bg-gradient-to-r
              from-blue-50
              via-[#F8FBFF]
              to-amber-50/30
              shadow-[0_5px_18px_rgba(37,99,235,0.08)]
            `
          : `
              border-transparent
              bg-white
              hover:border-slate-100
              hover:bg-slate-50/80
            `,
      ].join(" ")}
    >
      {/* Selected accent */}

      {selected && (
        <span
          className="
            absolute
            bottom-3
            left-0
            top-3
            w-[3px]
            rounded-r-full
            bg-gradient-to-b
            from-[#E2BD45]
            to-[#B18416]
          "
        />
      )}

      <div className="flex min-w-0 items-center gap-3">

        {/* Avatar */}

        <div className="relative shrink-0">
          <UserAvatar
            fullName={
              otherUser.fullName
            }
            photoUrl={
              otherUser.photoUrl
            }
          />

          {unread && (
            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                h-3
                w-3
                rounded-full
                border-2
                border-white
                bg-blue-600
                shadow-sm
              "
            />
          )}
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          {/* Name + time */}

          <div className="flex min-w-0 items-start justify-between gap-2">
            <h3
              className={[
                `
                  min-w-0
                  truncate
                  text-[13px]
                  tracking-[-0.01em]
                `,

                unread
                  ? "font-black text-[#0B2D5C]"
                  : selected
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
                `
                  shrink-0
                  pt-0.5
                  text-[9px]
                `,

                unread
                  ? "font-black text-blue-600"
                  : "font-medium text-slate-400",
              ].join(" ")}
            >
              {formatConversationTime(
                lastMessageAt
              )}
            </span>
          </div>

          {/* Message preview */}

          <div className="mt-1 flex min-w-0 items-center gap-2">
            <div
              className={[
                `
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-1.5
                  truncate
                  text-[11px]
                  leading-4
                `,

                unread
                  ? "font-bold text-slate-700"
                  : "font-medium text-slate-500",
              ].join(" ")}
            >
              {lastMessageWasMine && (
                <CheckCheck
                  size={13}
                  className="
                    shrink-0
                    text-blue-500
                  "
                />
              )}

              {imageMessage && (
                <ImageIcon
                  size={12}
                  className="
                    shrink-0
                    text-slate-400
                  "
                />
              )}

              <span className="truncate">
                {preview}
              </span>
            </div>

            {unread && (
              <span
                className="
                  flex
                  h-5
                  min-w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  px-1.5
                  text-[9px]
                  font-black
                  text-white
                  shadow-[0_3px_8px_rgba(37,99,235,0.25)]
                "
              >
                {unreadCount >
                99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </div>

          {/* Member metadata */}

          {metadata && (
            <div className="mt-1.5 flex min-w-0 items-center">
              <p
                className="
                  truncate
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                {metadata}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}