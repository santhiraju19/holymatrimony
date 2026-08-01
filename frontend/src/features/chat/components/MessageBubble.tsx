import {
  Check,
  CheckCheck,
  Clock3,
  TriangleAlert,
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

function getBackendOrigin(): string {
  const apiUrl =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.trim();

  if (!apiUrl) {
    return "http://localhost:8080";
  }

  return apiUrl.replace(
    /\/api\/v1\/?$/,
    ""
  );
}

function resolveMediaUrl(
  mediaUrl?: string | null
): string | null {
  if (!mediaUrl) {
    return null;
  }

  if (
    mediaUrl.startsWith(
      "http://"
    ) ||
    mediaUrl.startsWith(
      "https://"
    ) ||
    mediaUrl.startsWith(
      "blob:"
    )
  ) {
    return mediaUrl;
  }

  const normalizedPath =
    mediaUrl.startsWith("/")
      ? mediaUrl
      : `/${mediaUrl}`;

  return (
    getBackendOrigin() +
    normalizedPath
  );
}

export default function MessageBubble({
  message,
  own,
}: MessageBubbleProps) {
  const messageType =
    message.messageType
      ?.trim()
      .toUpperCase();

  const mediaUrl =
    resolveMediaUrl(
      message.mediaUrl
    );

  const isImageMessage =
    messageType === "IMAGE" &&
    Boolean(mediaUrl);

  return (
    <div
      className={[
        "flex",
        own
          ? "justify-end"
          : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[85%] overflow-hidden rounded-2xl shadow-sm sm:max-w-[72%]",
          isImageMessage
            ? "p-1.5"
            : "px-4 py-2.5",
          own
            ? "rounded-br-md bg-[#0B2D5C] text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800",
        ].join(" ")}
      >
        {isImageMessage &&
          mediaUrl && (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl"
            >
              <img
                src={mediaUrl}
                alt={
                  message.content?.trim() ||
                  "Chat image"
                }
                loading="lazy"
                className="max-h-[420px] w-full min-w-[220px] object-cover transition hover:opacity-95"
              />
            </a>
          )}

        {message.content?.trim() && (
          <p
            className={[
              "whitespace-pre-wrap break-words text-sm leading-6",
              isImageMessage
                ? "px-2 pt-2"
                : "",
            ].join(" ")}
          >
            {message.content}
          </p>
        )}

        <div
          className={[
            "flex items-center justify-end gap-1 text-[10px]",
            isImageMessage
              ? "px-2 pb-1 pt-1"
              : "mt-1",
            own
              ? "text-blue-100"
              : "text-slate-400",
          ].join(" ")}
        >
          <span>
            {formatMessageTime(
              message.createdAt
            )}
          </span>

          {own && (
            <MessageStatus
              status={
                message.status
              }
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
  status?: string | null;
}) {
  const normalizedStatus =
    status?.trim().toUpperCase() ??
    "SENT";

  switch (normalizedStatus) {
    case "READ":
      return (
        <CheckCheck
          size={14}
          aria-label="Read"
          className="text-sky-300"
        />
      );

    case "DELIVERED":
      return (
        <CheckCheck
          size={14}
          aria-label="Delivered"
        />
      );

    case "PENDING":
    case "SENDING":
      return (
        <Clock3
          size={12}
          aria-label="Sending"
        />
      );

    case "FAILED":
      return (
        <TriangleAlert
          size={13}
          aria-label="Failed"
          className="text-red-300"
        />
      );

    default:
      return (
        <Check
          size={14}
          aria-label="Sent"
        />
      );
  }
}