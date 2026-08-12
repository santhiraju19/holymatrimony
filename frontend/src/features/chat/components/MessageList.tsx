"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  MessageCircle,
} from "lucide-react";

import {
  ChatMessage,
} from "@/features/chat/types";

import {
  formatMessageDate,
  isOwnMessage,
  shouldShowDateDivider,
} from "@/features/chat/utils/chat.utils";

import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];

  otherUserId: string;

  loading: boolean;

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
}

export default function MessageList({
  messages,
  otherUserId,
  loading,
  onReply,
  onEdit,
  onDelete,
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
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 px-6 py-10">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-3 text-sm text-slate-500">
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
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 px-6 py-10">
        <div className="max-w-sm text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
            <MessageCircle
              size={27}
            />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            Start the conversation
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Send a message to begin chatting.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-5 sm:px-6">

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
    <div className="my-4 flex items-center justify-center">
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
        {formatMessageDate(
          dateValue
        )}
      </span>
    </div>
  );
}