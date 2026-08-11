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

  onEdit: (
    messageId: string,
    content: string
  ) => Promise<void>;

  onDelete: (
    messageId: string
  ) => Promise<void>;
}

export default function MessageList({
  messages,
  otherUserId,
  loading,
  onEdit,
  onDelete,
}: MessageListProps) {
  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const previousMessageCountRef =
    useRef(0);

  const previousOtherUserIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    const conversationChanged =
      previousOtherUserIdRef.current !==
      otherUserId;

    const receivedNewMessage =
      messages.length >
      previousMessageCountRef.current;

    bottomRef.current?.scrollIntoView({
      behavior:
        conversationChanged
          ? "auto"
          : receivedNewMessage
            ? "smooth"
            : "auto",

      block: "end",
    });

    previousOtherUserIdRef.current =
      otherUserId;

    previousMessageCountRef.current =
      messages.length;
  }, [
    messages,
    otherUserId,
  ]);

  if (loading) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <MessageCircle
            size={30}
          />
        </div>

        <h3 className="mt-4 font-semibold text-slate-800">
          Start the conversation
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Send a respectful greeting
          and begin getting to know
          each other.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5 md:px-7">
      <div className="mx-auto max-w-4xl space-y-3">
        {messages.map(
          (
            message,
            index
          ) => {
            const previousMessage =
              messages[
                index - 1
              ];

            const showDate =
              shouldShowDateDivider(
                message,
                previousMessage
              );

            return (
              <div
                key={
                  message.id
                }
              >
                {showDate && (
                  <div className="my-5 flex justify-center">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                      {formatMessageDate(
                        message.createdAt
                      )}
                    </span>
                  </div>
                )}

                <MessageBubble
                  message={
                    message
                  }
                  own={isOwnMessage(
                    message,
                    otherUserId
                  )}
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
          ref={bottomRef}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-hidden bg-slate-50 p-6">
      <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-slate-200" />

      <div className="ml-auto h-16 w-3/5 animate-pulse rounded-2xl bg-slate-300" />

      <div className="h-12 w-1/2 animate-pulse rounded-2xl bg-slate-200" />

      <div className="ml-auto h-20 w-2/3 animate-pulse rounded-2xl bg-slate-300" />
    </div>
  );
}