import {
  Check,
  CheckCheck,
} from "lucide-react";

import {
  ChatMessage,
} from "@/features/chat/types";

import {
  formatMessageTime,
} from "@/features/chat/utils/chat.utils";

interface MessageBubbleProps {
  message: ChatMessage;
  own: boolean;
}

export default function MessageBubble({
  message,
  own,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex ${
        own
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[72%] ${
          own
            ? "rounded-br-md bg-[#0B2D5C] text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            own
              ? "text-blue-100"
              : "text-slate-400"
          }`}
        >
          <span>
            {formatMessageTime(
              message.createdAt
            )}
          </span>

          {own && (
            <MessageStatus
              status={message.status}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageStatus({
  status,
}: {
  status: string;
}) {
  if (
    status === "READ" ||
    status === "DELIVERED"
  ) {
    return (
      <CheckCheck
        size={14}
        className={
          status === "READ"
            ? "text-sky-300"
            : ""
        }
      />
    );
  }

  return <Check size={14} />;
}