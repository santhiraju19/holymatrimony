"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  CheckCheck,
  Clock3,
  MoreVertical,
  Pencil,
  Save,
  Trash2,
  TriangleAlert,
  X,
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

  onEdit?: (
    messageId: string,
    content: string
  ) => Promise<void>;

  onDelete?: (
    messageId: string
  ) => Promise<void>;
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
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    editValue,
    setEditValue,
  ] =
    useState(
      message.content ?? ""
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    setEditValue(
      message.content ?? ""
    );
  }, [
    message.content,
  ]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const messageType =
    message.messageType
      ?.trim()
      .toUpperCase();

  const deleted =
    message.deletedForEveryone ===
    true;

  const mediaUrl =
    deleted
      ? null
      : resolveMediaUrl(
          message.mediaUrl
        );

  const isImageMessage =
    messageType === "IMAGE" &&
    Boolean(mediaUrl);

  const canEdit =
    own &&
    !deleted &&
    messageType === "TEXT" &&
    Boolean(
      message.content?.trim()
    );

  const canDelete =
    own &&
    !deleted;

  async function handleSave() {
    const content =
      editValue.trim();

    if (
      !content ||
      !onEdit
    ) {
      return;
    }

    if (
      content ===
      message.content?.trim()
    ) {
      setEditing(false);
      return;
    }

    setSaving(true);

    try {
      await onEdit(
        message.id,
        content
      );

      setEditing(false);
      setMenuOpen(false);

    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !onDelete ||
      deleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this message for everyone?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await onDelete(
        message.id
      );

      setMenuOpen(false);
      setEditing(false);

    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={[
        "group flex",
        own
          ? "justify-end"
          : "justify-start",
      ].join(" ")}
    >
      <div className="relative flex max-w-[85%] items-start gap-1 sm:max-w-[72%]">

        {own && !editing && (
          <div
            ref={menuRef}
            className="relative mt-1"
          >
            <button
              type="button"
              aria-label="Message options"
              onClick={() =>
                setMenuOpen(
                  (current) =>
                    !current
                )
              }
              className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
            >
              <MoreVertical
                size={17}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-30 min-w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil
                      size={15}
                    />
                    Edit
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    disabled={
                      deleting
                    }
                    onClick={() => {
                      void handleDelete();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2
                      size={15}
                    />

                    {deleting
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        <div
          className={[
            "overflow-hidden rounded-2xl shadow-sm",

            isImageMessage
              ? "p-1.5"
              : "px-4 py-2.5",

            own
              ? "rounded-br-md bg-[#0B2D5C] text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800",

            deleted
              ? "italic"
              : "",
          ].join(" ")}
        >

          {deleted ? (
            <p
              className={[
                "flex items-center gap-2 text-sm",

                own
                  ? "text-blue-100"
                  : "text-slate-500",
              ].join(" ")}
            >
              <Trash2
                size={14}
              />

              This message was deleted
            </p>
          ) : editing ? (
            <div className="min-w-[240px]">

              <textarea
                value={editValue}
                maxLength={2000}
                rows={2}
                autoFocus
                disabled={saving}
                onChange={(event) =>
                  setEditValue(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    void handleSave();
                  }

                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setEditValue(
                      message.content ??
                        ""
                    );

                    setEditing(false);
                  }
                }}
                className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-blue-200 focus:border-white/50"
              />

              <div className="mt-2 flex justify-end gap-2">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditValue(
                      message.content ??
                        ""
                    );

                    setEditing(false);
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-blue-100 hover:bg-white/10"
                >
                  <X size={13} />
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    saving ||
                    !editValue.trim()
                  }
                  onClick={() => {
                    void handleSave();
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#0B2D5C] disabled:opacity-50"
                >
                  <Save size={13} />

                  {saving
                    ? "Saving…"
                    : "Save"}
                </button>

              </div>
            </div>
          ) : (
            <>
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
                        message.content
                          ?.trim() ||
                        "Chat image"
                      }
                      loading="lazy"
                      className="max-h-[420px] w-full min-w-[220px] object-cover transition hover:opacity-95"
                    />
                  </a>
                )}

              {message.content
                ?.trim() && (
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
            </>
          )}

          {!editing && (
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

              {message.editedAt &&
                !deleted && (
                  <span>
                    edited
                  </span>
                )}

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
    status
      ?.trim()
      .toUpperCase() ??
    "SENT";

  switch (
    normalizedStatus
  ) {
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