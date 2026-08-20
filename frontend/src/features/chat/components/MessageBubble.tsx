"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  CheckCheck,
  Clock3,
  MoreVertical,
  Pencil,
  Reply,
  Save,
  Smile,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  ChatMessage,
  MessageReaction,
} from "@/features/chat/types";

import {
  formatMessageTime,
} from "@/features/chat/utils/chat.utils";

interface MessageBubbleProps {
  message:
    ChatMessage;

  own:
    boolean;

  otherUserId?:
    string;

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

const AVAILABLE_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "🙏",
  "😮",
  "😢",
] as const;

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

function normalizeId(
  value?: string | null
): string {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}

function truncateReplyText(
  value?: string | null
): string {
  const normalized =
    value
      ?.trim()
      .replace(
        /\s+/g,
        " "
      ) ?? "";

  if (!normalized) {
    return "";
  }

  if (
    normalized.length <=
    100
  ) {
    return normalized;
  }

  return (
    normalized.slice(
      0,
      100
    ) + "…"
  );
}

export default function MessageBubble({
  message,
  own,
  otherUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
}: MessageBubbleProps) {
  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const [
    reactionPickerOpen,
    setReactionPickerOpen,
  ] =
    useState(false);

  const [
    reactionSaving,
    setReactionSaving,
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

  const reactionRef =
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
      const target =
        event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(
          target
        )
      ) {
        setMenuOpen(
          false
        );
      }

      if (
        reactionRef.current &&
        !reactionRef.current.contains(
          target
        )
      ) {
        setReactionPickerOpen(
          false
        );
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
    Boolean(
      mediaUrl
    );

  const canReply =
    !deleted &&
    Boolean(
      onReply
    );

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

  const canReact =
    !deleted &&
    Boolean(
      onReact
    );

  /*
   * ============================================================
   * CURRENT USER ID
   * ============================================================
   *
   * In a 1:1 conversation:
   *
   * own message:
   * current user = sender
   *
   * incoming message:
   * current user = receiver
   */

  const currentUserId =
    own
      ? message.senderId
      : message.receiverId;

  /*
   * ============================================================
   * REACTIONS
   * ============================================================
   */

  const reactions =
    message.reactions ??
    [];

  const ownReaction =
    reactions.find(
      (
        reaction
      ) =>
        normalizeId(
          reaction.userId
        ) ===
        normalizeId(
          currentUserId
        )
    );

  const groupedReactions =
    useMemo(
      () => {
        const groups =
          new Map<
            string,
            MessageReaction[]
          >();

        for (
          const reaction
          of reactions
        ) {
          const existing =
            groups.get(
              reaction.reaction
            ) ??
            [];

          existing.push(
            reaction
          );

          groups.set(
            reaction.reaction,
            existing
          );
        }

        return Array.from(
          groups.entries()
        );
      },
      [
        reactions,
      ]
    );

  /*
   * ============================================================
   * REPLY PREVIEW
   * ============================================================
   */

  const hasReply =
    Boolean(
      message.replyToMessageId
    );

  const replyDeleted =
    message
      .replyToDeletedForEveryone ===
    true;

  const replyMessageType =
    message
      .replyToMessageType
      ?.trim()
      .toUpperCase();

  const replyMediaUrl =
    replyDeleted
      ? null
      : resolveMediaUrl(
          message
            .replyToMediaUrl
        );

  const replyIsImage =
    replyMessageType ===
      "IMAGE" &&
    Boolean(
      replyMediaUrl
    );

  const replySenderIsOtherUser =
    Boolean(
      otherUserId &&
      normalizeId(
        message
          .replyToSenderId
      ) ===
        normalizeId(
          otherUserId
        )
    );

  const replySenderLabel =
    otherUserId
      ? replySenderIsOtherUser
        ? "Them"
        : "You"
      : "Reply";

  function handleReply() {
    if (
      !onReply ||
      deleted
    ) {
      return;
    }

    setMenuOpen(
      false
    );

    setReactionPickerOpen(
      false
    );

    onReply(
      message
    );
  }

  async function handleReaction(
    reaction: string
  ) {
    if (
      reactionSaving ||
      deleted
    ) {
      return;
    }

    setReactionSaving(
      true
    );

    try {
      /*
       * Tapping the user's currently selected
       * reaction removes it.
       */
      if (
        ownReaction?.reaction ===
          reaction &&
        onRemoveReaction
      ) {
        await onRemoveReaction(
          message.id
        );

        setReactionPickerOpen(
          false
        );

        return;
      }

      if (!onReact) {
        return;
      }

      await onReact(
        message.id,
        reaction
      );

      setReactionPickerOpen(
        false
      );

    } finally {
      setReactionSaving(
        false
      );
    }
  }

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
      setEditing(
        false
      );

      return;
    }

    setSaving(
      true
    );

    try {
      await onEdit(
        message.id,
        content
      );

      setEditing(
        false
      );

      setMenuOpen(
        false
      );

    } finally {
      setSaving(
        false
      );
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

    setDeleting(
      true
    );

    try {
      await onDelete(
        message.id
      );

      setMenuOpen(
        false
      );

      setReactionPickerOpen(
        false
      );

      setEditing(
        false
      );

    } finally {
      setDeleting(
        false
      );
    }
  }

  /*
   * ============================================================
   * ACTION BUTTONS
   * ============================================================
   */

  const actionButtons = (
    <div className="mt-0.5 flex shrink-0 items-center gap-0.5">

      {canReact && (
        <div
          ref={
            reactionRef
          }
          className="relative"
        >
          <button
            type="button"
            aria-label="React to message"
            title="React"
            disabled={
              reactionSaving
            }
            onClick={() => {
              setReactionPickerOpen(
                (
                  current
                ) =>
                  !current
              );

              setMenuOpen(
                false
              );
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-slate-400 opacity-70 transition-all hover:border-slate-200 hover:bg-white hover:text-[#0B2D5C] hover:shadow-md sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
          >
            <Smile
              size={16}
            />
          </button>

          {reactionPickerOpen && (
            <div
              className={[
                "absolute bottom-9 z-40 flex items-center gap-0.5 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:gap-1",

                own
                  ? "right-0"
                  : "left-0",
              ].join(" ")}
            >
              {AVAILABLE_REACTIONS.map(
                (
                  reaction
                ) => {
                  const selected =
                    ownReaction
                      ?.reaction ===
                    reaction;

                  return (
                    <button
                      key={
                        reaction
                      }
                      type="button"
                      disabled={
                        reactionSaving
                      }
                      title={
                        selected
                          ? "Remove reaction"
                          : `React ${reaction}`
                      }
                      onClick={() => {
                        void handleReaction(
                          reaction
                        );
                      }}
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-xl text-base transition hover:scale-110 hover:bg-slate-50 disabled:opacity-50 sm:h-9 sm:w-9 sm:text-lg",

                        selected
                          ? "bg-amber-50 ring-2 ring-[#D4AF37]/30"
                          : "",
                      ].join(" ")}
                    >
                      {reaction}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {canReply && (
        <button
          type="button"
          aria-label="Reply to message"
          title="Reply"
          onClick={
            handleReply
          }
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-slate-400 opacity-0 transition-all hover:border-slate-200 hover:bg-white hover:text-[#0B2D5C] hover:shadow-md group-hover:opacity-100 focus:opacity-100"
        >
          <Reply
            size={16}
          />
        </button>
      )}

      {own && (
        <div
          ref={
            menuRef
          }
          className="relative"
        >
          <button
            type="button"
            aria-label="Message options"
            onClick={() => {
              setMenuOpen(
                (
                  current
                ) =>
                  !current
              );

              setReactionPickerOpen(
                false
              );
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-slate-400 opacity-70 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-700 hover:shadow-md sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          >
            <MoreVertical
              size={17}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 min-w-[165px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl">

              {canReply && (
                <button
                  type="button"
                  onClick={
                    handleReply
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#0B2D5C]"
                >
                  <Reply
                    size={15}
                  />

                  Reply
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(
                      true
                    );

                    setMenuOpen(
                      false
                    );
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#0B2D5C]"
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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

    </div>
  );

  return (
    <div
      className={[
        "group flex py-0.5",

        own
          ? "justify-end"
          : "justify-start",
      ].join(" ")}
    >
      <div className="relative flex min-w-0 max-w-[92%] items-center gap-1.5 sm:max-w-[78%] lg:max-w-[72%]">

        {/* ======================================================
            ACTIONS BEFORE OWN MESSAGE
           ====================================================== */}

        {own &&
          !editing &&
          actionButtons}

        {/* ======================================================
            MESSAGE + REACTIONS
           ====================================================== */}

        <div
          className={[
            "relative",

            groupedReactions.length >
              0
              ? "mb-4"
              : "",
          ].join(" ")}
        >

          <div
            className={[
              "min-w-0 overflow-hidden rounded-[18px] transition-shadow duration-200",

              isImageMessage
                ? "p-1.5"
                : "px-3.5 py-2.5 sm:px-4 sm:py-3",

              own
                ? "rounded-br-[6px] bg-gradient-to-br from-[#08264D] via-[#0B2D5C] to-[#174A87] text-white shadow-[0_7px_20px_rgba(11,45,92,0.16)]"
                : "rounded-bl-[6px] border border-slate-200/80 bg-white text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.055)]",

              deleted
                ? "italic opacity-90"
                : "",
            ].join(" ")}
          >

            {/* ====================================================
                QUOTED / REPLIED-TO MESSAGE
               ==================================================== */}

            {!deleted &&
              !editing &&
              hasReply && (
                <div
                  className={[
                    "mb-2.5 overflow-hidden rounded-xl border-l-[3px] backdrop-blur-sm",

                    own
                      ? "border-[#F2D675] bg-white/[0.09]"
                      : "border-[#D4AF37] bg-gradient-to-r from-amber-50/70 to-slate-50",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-stretch">

                    <div className="min-w-0 flex-1 px-3 py-2">

                      <p
                        className={[
                          "mb-0.5 text-[10px] font-black tracking-wide",

                          own
                            ? "text-blue-100/85"
                            : "text-[#0B2D5C]",
                        ].join(" ")}
                      >
                        {replySenderLabel}
                      </p>

                      {replyDeleted ? (
                        <p
                          className={[
                            "flex items-center gap-1.5 truncate text-xs italic",

                            own
                              ? "text-blue-100/80"
                              : "text-slate-500",
                          ].join(" ")}
                        >
                          <Trash2
                            size={12}
                          />

                          This message was deleted
                        </p>
                      ) : (
                        <>
                          {replyIsImage && (
                            <p
                              className={[
                                "truncate text-xs",

                                own
                                  ? "text-blue-100/90"
                                  : "text-slate-600",
                              ].join(" ")}
                            >
                              📷 Photo
                            </p>
                          )}

                          {message
                            .replyToContent
                            ?.trim() && (
                            <p
                              className={[
                                "truncate text-xs",

                                own
                                  ? "text-blue-100/90"
                                  : "text-slate-600",
                              ].join(" ")}
                            >
                              {truncateReplyText(
                                message
                                  .replyToContent
                              )}
                            </p>
                          )}

                          {!replyIsImage &&
                            !message
                              .replyToContent
                              ?.trim() && (
                              <p
                                className={[
                                  "truncate text-xs",

                                  own
                                    ? "text-blue-100/80"
                                    : "text-slate-500",
                                ].join(" ")}
                              >
                                Message
                              </p>
                            )}
                        </>
                      )}

                    </div>

                    {!replyDeleted &&
                      replyIsImage &&
                      replyMediaUrl && (
                        <img
                          src={
                            replyMediaUrl
                          }
                          alt="Replied image"
                          loading="lazy"
                          className="h-12 w-12 shrink-0 object-cover sm:h-[58px] sm:w-[58px]"
                        />
                      )}

                  </div>
                </div>
              )}

            {/* ====================================================
                DELETED MESSAGE
               ==================================================== */}

            {deleted ? (
              <p
                className={[
                  "flex items-center gap-1.5 text-xs italic",

                  own
                    ? "text-blue-100/85"
                    : "text-slate-500",
                ].join(" ")}
              >
                <Trash2
                  size={14}
                />

                This message was deleted
              </p>

            ) : editing ? (

              <div className="min-w-0 w-[min(240px,72vw)] sm:w-[240px]">

                <textarea
                  value={
                    editValue
                  }
                  maxLength={
                    2000
                  }
                  rows={2}
                  autoFocus
                  disabled={
                    saving
                  }
                  onChange={(
                    event
                  ) =>
                    setEditValue(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
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

                      setEditing(
                        false
                      );
                    }
                  }}
                  className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-blue-200 focus:border-[#F2D675]/60 focus:ring-2 focus:ring-[#F2D675]/10"
                />

                <div className="mt-2 flex justify-end gap-2">

                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() => {
                      setEditValue(
                        message.content ??
                          ""
                      );

                      setEditing(
                        false
                      );
                    }}
                    className="flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-semibold text-blue-100 transition hover:bg-white/10"
                  >
                    <X
                      size={13}
                    />

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
                    className="flex h-7 items-center gap-1 rounded-lg bg-white px-2.5 text-[10px] font-black text-[#0B2D5C] shadow-sm disabled:opacity-50"
                  >
                    <Save
                      size={13}
                    />

                    {saving
                      ? "Saving…"
                      : "Save"}
                  </button>

                </div>
              </div>

            ) : (
              <>

                {/* =================================================
                    IMAGE
                   ================================================= */}

                {isImageMessage &&
                  mediaUrl && (
                    <a
                      href={
                        mediaUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="group/image block overflow-hidden rounded-[15px] bg-slate-100"
                    >
                      <img
                        src={
                          mediaUrl
                        }
                        alt={
                          message.content
                            ?.trim() ||
                          "Chat image"
                        }
                        loading="lazy"
                        className="max-h-[380px] w-full min-w-0 object-cover transition duration-300 group-hover/image:scale-[1.015] group-hover/image:brightness-[0.97]"
                      />
                    </a>
                  )}

                {/* =================================================
                    TEXT / CAPTION
                   ================================================= */}

                {message.content
                  ?.trim() && (
                    <p
                      className={[
                        "whitespace-pre-wrap break-words text-[13.5px] font-medium leading-[1.55] tracking-[-0.005em] sm:text-[14px] sm:leading-[1.6]",

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

            {/* ====================================================
                TIME + STATUS
               ==================================================== */}

            {!editing && (
              <div
                className={[
                  "flex items-center justify-end gap-1 text-[9px] font-semibold tracking-[0.01em]",

                  isImageMessage
                    ? "px-2 pb-1 pt-1"
                    : "mt-1",

                  own
                    ? "text-blue-100/85"
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

          {/* ======================================================
              REACTION BADGES
             ====================================================== */}

          {!deleted &&
            groupedReactions.length >
              0 && (
              <div
                className={[
                  "absolute -bottom-4 z-10 flex flex-wrap items-center gap-1",

                  own
                    ? "right-2 justify-end"
                    : "left-2 justify-start",
                ].join(" ")}
              >
                {groupedReactions.map(
                  ([
                    reaction,
                    users,
                  ]) => {
                    const selectedByCurrentUser =
                      users.some(
                        (
                          userReaction
                        ) =>
                          normalizeId(
                            userReaction
                              .userId
                          ) ===
                          normalizeId(
                            currentUserId
                          )
                      );

                    return (
                      <button
                        key={
                          reaction
                        }
                        type="button"
                        disabled={
                          reactionSaving
                        }
                        onClick={() => {
                          void handleReaction(
                            reaction
                          );
                        }}
                        title={
                          selectedByCurrentUser
                            ? "Remove your reaction"
                            : `React ${reaction}`
                        }
                        className={[
                          "flex h-7 items-center gap-1 rounded-full border bg-white px-2 text-[10px] shadow-[0_3px_10px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50",

                          selectedByCurrentUser
                            ? "border-[#D4AF37]/60 bg-gradient-to-r from-amber-50 to-yellow-50 text-[#80600F] ring-1 ring-[#D4AF37]/10"
                            : "border-slate-200 text-slate-700 hover:border-slate-300",
                        ].join(" ")}
                      >
                        <span className="text-sm">
                          {reaction}
                        </span>

                        {users.length >
                          1 && (
                          <span className="font-semibold">
                            {users.length}
                          </span>
                        )}

                      </button>
                    );
                  }
                )}
              </div>
            )}

        </div>

        {/* ======================================================
            ACTIONS AFTER INCOMING MESSAGE
           ====================================================== */}

        {!own &&
          !editing &&
          actionButtons}

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
          className="text-sky-300 drop-shadow-sm"
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
          className="text-red-300 drop-shadow-sm"
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