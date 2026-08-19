"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  MessageCircle,
  ShieldCheck,
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
  }, [messages]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/40 px-4 py-6">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-2.5 text-xs font-semibold text-slate-500">
            Loading messages…
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
      <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/50 px-4 py-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-sm">
            <MessageCircle
              size={19}
            />
          </div>

          <h3 className="mt-3 text-sm font-black text-[#0B2D5C]">
            Start the conversation
          </h3>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Send a respectful message and begin getting to know each other.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[9px] font-semibold text-slate-500 shadow-sm">
            <ShieldCheck
              size={10}
              className="text-emerald-600"
            />

            Communicate safely
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-[#FBFDFF] to-blue-50/35">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-1 px-3 py-3 sm:px-4 lg:px-5">
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
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200/70" />

      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-400 shadow-sm">
        {formatMessageDate(
          dateValue
        )}
      </span>

      <div className="h-px flex-1 bg-slate-200/70" />
    </div>
  );
}
