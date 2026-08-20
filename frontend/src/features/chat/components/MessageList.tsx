"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  ChatMessage,
} from "@/features/chat/types";

import {
  formatMessageDate,
  isOwnMessage,
  shouldShowDateDivider,
} from "@/features/chat/utils/chat.utils";

import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages:
    ChatMessage[];

  otherUserId:
    string;

  loading:
    boolean;

  onReply?: (
    message: ChatMessage
  ) => void;

  onEdit?: (
    messageId: string,
    content: string
  ) => Promise<void>;

  onDelete?: (
    messageId: string
  ) => Promise<void>;

  onReact?: (
    messageId: string,
    reaction: string
  ) => Promise<void>;

  onRemoveReaction?: (
    messageId: string
  ) => Promise<void>;
}

export default function MessageList({
  messages,
  otherUserId,
  loading,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
}: MessageListProps) {
  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    bottomRef.current
      ?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
  }, [
    messages,
  ]);

  if (loading) {
    return (
      <div
        className="
          relative
          flex
          min-h-0
          flex-1
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-[#F7FAFF]
          via-white
          to-blue-50/60
          px-4
          py-6
        "
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative text-center">
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-100
              bg-white
              shadow-[0_8px_24px_rgba(15,23,42,0.07)]
            "
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B2D5C]" />
          </div>

          <p className="mt-3 text-xs font-bold text-[#0B2D5C]">
            Loading conversation
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Preparing your messages…
          </p>
        </div>
      </div>
    );
  }

  if (
    messages.length ===
    0
  ) {
    return (
      <div
        className="
          relative
          flex
          min-h-0
          flex-1
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-[#F8FBFF]
          via-white
          to-amber-50/25
          px-6
          py-8
        "
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-100/55 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-amber-100/35 blur-3xl" />

        <div className="relative max-w-sm text-center">
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-[22px]
              bg-gradient-to-br
              from-[#071B36]
              via-[#0B2D5C]
              to-[#174A87]
              text-white
              shadow-[0_14px_34px_rgba(11,45,92,0.24)]
            "
          >
            <HeartHandshake
              size={28}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Sparkles
              size={10}
              className="text-[#B38B19]"
            />

            <span
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#B38B19]
              "
            >
              A meaningful beginning
            </span>
          </div>

          <h3
            className="
              mt-1.5
              text-lg
              font-black
              tracking-[-0.025em]
              text-[#0B2D5C]
            "
          >
            Start the conversation
          </h3>

          <p
            className="
              mx-auto
              mt-2
              max-w-[310px]
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            Send a warm and respectful message to begin getting to know your accepted match.
          </p>

          <div
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-emerald-100
              bg-white
              px-3
              py-1.5
              text-[9px]
              font-bold
              text-slate-500
              shadow-sm
            "
          >
            <ShieldCheck
              size={11}
              className="text-emerald-600"
            />

            Private & protected conversation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        min-h-0
        flex-1
        overflow-y-auto
        overscroll-contain
        bg-gradient-to-br
        from-[#F7FAFD]
        via-[#FCFDFE]
        to-blue-50/40
      "
    >
      {/* subtle background decoration */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          opacity-[0.018]
        "
      >
        <MessageCircle
          size={180}
        />
      </div>

      <div
        className="
          mx-auto
          flex
          w-full
          max-w-4xl
          flex-col
          gap-1.5
          px-3
          pb-5
          pt-4
          sm:px-5
          sm:pb-6
          lg:px-6
        "
      >
        {messages.map(
          (
            message,
            index
          ) => {
            const previousMessage =
              index > 0
                ? messages[
                    index - 1
                  ]
                : undefined;

            const showDateDivider =
              shouldShowDateDivider(
                message,
                previousMessage
              );

            const own =
              isOwnMessage(
                message,
                otherUserId
              );

            return (
              <div
                key={
                  message.id
                }
              >
                {showDateDivider && (
                  <DateDivider
                    dateValue={
                      message.createdAt
                    }
                  />
                )}

                <MessageBubble
                  message={
                    message
                  }
                  own={
                    own
                  }
                  otherUserId={
                    otherUserId
                  }
                  onReply={
                    onReply
                  }
                  onEdit={
                    onEdit
                  }
                  onDelete={
                    onDelete
                  }
                  onReact={
                    onReact
                  }
                  onRemoveReaction={
                    onRemoveReaction
                  }
                />
              </div>
            );
          }
        )}

        <div
          ref={
            bottomRef
          }
          className="h-1"
        />
      </div>
    </div>
  );
}

function DateDivider({
  dateValue,
}: {
  dateValue: string;
}) {
  return (
    <div
      className="
        my-5
        flex
        items-center
        gap-3
      "
    >
      <div
        className="
          h-px
          flex-1
          bg-gradient-to-r
          from-transparent
          via-slate-200
          to-slate-200
        "
      />

      <span
        className="
          shrink-0
          rounded-full
          border
          border-slate-200
          bg-white/95
          px-3
          py-1.5
          text-[9px]
          font-black
          uppercase
          tracking-[0.05em]
          text-slate-400
          shadow-[0_3px_10px_rgba(15,23,42,0.04)]
        "
      >
        {formatMessageDate(
          dateValue
        )}
      </span>

      <div
        className="
          h-px
          flex-1
          bg-gradient-to-l
          from-transparent
          via-slate-200
          to-slate-200
        "
      />
    </div>
  );
}