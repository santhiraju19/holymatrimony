"use client";

import dynamic from "next/dynamic";

import type {
  EmojiClickData,
} from "emoji-picker-react";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ImagePlus,
  Loader2,
  MessageSquareText,
  Paperclip,
  Reply,
  Send,
  ShieldCheck,
  Smile,
  Trash2,
  X,
} from "lucide-react";

import type {
  ChatMessage,
} from "@/features/chat/types";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react"),
  {
    ssr: false,
  }
);

interface MessageComposerProps {
  conversationId: string;

  sending: boolean;

  uploadingImage: boolean;

  disabled?: boolean;

  replyingTo?: ChatMessage | null;

  otherUserId?: string;

  otherUserName?: string;

  onCancelReply?: () => void;

  onSend: (
    content: string
  ) => Promise<void>;

  onSendImage: (
    file: File,
    caption: string
  ) => Promise<void>;

  onTypingChange?: (
    typing: boolean
  ) => void;
}

const MAX_MESSAGE_LENGTH =
  2000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const TYPING_IDLE_DELAY =
  1500;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getDraftKey(
  conversationId: string
): string {
  return `hm_chat_draft_${conversationId}`;
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
    120
  ) {
    return normalized;
  }

  return (
    normalized.slice(
      0,
      120
    ) + "…"
  );
}

export default function MessageComposer({
  conversationId,
  sending,
  uploadingImage,
  disabled = false,
  replyingTo = null,
  otherUserId,
  otherUserName,
  onCancelReply,
  onSend,
  onSendImage,
  onTypingChange,
}: MessageComposerProps) {
  const [
    content,
    setContent,
  ] =
    useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<File | null>(
      null
    );

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] =
    useState<
      string | null
    >(null);

  const [
    imageError,
    setImageError,
  ] =
    useState<
      string | null
    >(null);

  const [
    emojiPickerOpen,
    setEmojiPickerOpen,
  ] =
    useState(false);

  const textareaRef =
    useRef<
      HTMLTextAreaElement | null
    >(null);

  const imageInputRef =
    useRef<
      HTMLInputElement | null
    >(null);

  const emojiPickerRef =
    useRef<
      HTMLDivElement | null
    >(null);

  const emojiButtonRef =
    useRef<
      HTMLButtonElement | null
    >(null);

  const onTypingChangeRef =
    useRef(
      onTypingChange
    );

  const typingActiveRef =
    useRef(false);

  const typingTimeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const busy =
    sending ||
    uploadingImage;

  const trimmedContent =
    content.trim();

  const remainingCharacters =
    MAX_MESSAGE_LENGTH -
    content.length;

  /*
   * ============================================================
   * REPLY DISPLAY
   * ============================================================
   */

  const replyDeleted =
    replyingTo
      ?.deletedForEveryone ===
    true;

  const replyMessageType =
    replyingTo
      ?.messageType
      ?.trim()
      .toUpperCase();

  const replyIsImage =
    replyMessageType ===
    "IMAGE";

  const replyIsFromOtherUser =
    Boolean(
      replyingTo &&
      otherUserId &&
      normalizeId(
        replyingTo.senderId
      ) ===
        normalizeId(
          otherUserId
        )
    );

  const replySenderLabel =
    replyIsFromOtherUser
      ? otherUserName?.trim() ||
        "Them"
      : "You";

  /*
   * ============================================================
   * CALLBACK REF
   * ============================================================
   */

  useEffect(() => {
    onTypingChangeRef.current =
      onTypingChange;
  }, [
    onTypingChange,
  ]);

  /*
   * ============================================================
   * TYPING
   * ============================================================
   */

  function clearTypingTimer() {
    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );

      typingTimeoutRef.current =
        null;
    }
  }

  function stopTyping() {
    clearTypingTimer();

    if (
      !typingActiveRef.current
    ) {
      return;
    }

    typingActiveRef.current =
      false;

    onTypingChangeRef
      .current?.(
        false
      );
  }

  function startTyping() {
    if (
      !typingActiveRef.current
    ) {
      typingActiveRef.current =
        true;

      onTypingChangeRef
        .current?.(
          true
        );
    }

    clearTypingTimer();

    typingTimeoutRef.current =
      setTimeout(
        () => {
          typingTimeoutRef.current =
            null;

          if (
            !typingActiveRef.current
          ) {
            return;
          }

          typingActiveRef.current =
            false;

          onTypingChangeRef
            .current?.(
              false
            );
        },
        TYPING_IDLE_DELAY
      );
  }

  useEffect(() => {
    return () => {
      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );

        typingTimeoutRef.current =
          null;
      }

      if (
        typingActiveRef.current
      ) {
        typingActiveRef.current =
          false;

        onTypingChangeRef
          .current?.(
            false
          );
      }
    };
  }, [
    conversationId,
  ]);

  /*
   * ============================================================
   * DRAFT
   * ============================================================
   */

  useEffect(() => {
    const savedDraft =
      window.localStorage
        .getItem(
          getDraftKey(
            conversationId
          )
        );

    setContent(
      savedDraft ?? ""
    );

    setEmojiPickerOpen(
      false
    );

    clearSelectedImage();
  }, [
    conversationId,
  ]);

  useEffect(() => {
    const draftKey =
      getDraftKey(
        conversationId
      );

    if (content) {
      window.localStorage
        .setItem(
          draftKey,
          content
        );
    } else {
      window.localStorage
        .removeItem(
          draftKey
        );
    }
  }, [
    content,
    conversationId,
  ]);

  /*
   * ============================================================
   * TEXTAREA SIZE
   * ============================================================
   */

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "auto";

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        144
      )}px`;
  }, [
    content,
  ]);

  /*
   * ============================================================
   * FOCUS REPLY
   * ============================================================
   */

  useEffect(() => {
    if (!replyingTo) {
      return;
    }

    requestAnimationFrame(
      () => {
        textareaRef.current
          ?.focus();
      }
    );
  }, [
    replyingTo,
  ]);

  /*
   * ============================================================
   * EMOJI PICKER OUTSIDE CLICK
   * ============================================================
   */

  useEffect(() => {
    if (!emojiPickerOpen) {
      return;
    }

    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      const clickedPicker =
        emojiPickerRef.current
          ?.contains(
            target
          );

      const clickedButton =
        emojiButtonRef.current
          ?.contains(
            target
          );

      if (
        !clickedPicker &&
        !clickedButton
      ) {
        setEmojiPickerOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [
    emojiPickerOpen,
  ]);

  /*
   * ============================================================
   * IMAGE PREVIEW CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (
        imagePreviewUrl
      ) {
        URL.revokeObjectURL(
          imagePreviewUrl
        );
      }
    };
  }, [
    imagePreviewUrl,
  ]);

  function clearSelectedImage() {
    setSelectedImage(
      null
    );

    setImageError(
      null
    );

    setImagePreviewUrl(
      (
        currentUrl
      ) => {
        if (
          currentUrl
        ) {
          URL.revokeObjectURL(
            currentUrl
          );
        }

        return null;
      }
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef
        .current
        .value = "";
    }
  }

  function handleImageSelection(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0];

    setImageError(
      null
    );

    if (!file) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES
        .includes(
          file.type
        )
    ) {
      setImageError(
        "Only JPEG, PNG and WebP images are allowed."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setImageError(
        "Image size must not exceed 10 MB."
      );

      event.target.value =
        "";

      return;
    }

    setSelectedImage(
      file
    );

    setImagePreviewUrl(
      (
        currentUrl
      ) => {
        if (
          currentUrl
        ) {
          URL.revokeObjectURL(
            currentUrl
          );
        }

        return URL
          .createObjectURL(
            file
          );
      }
    );

    requestAnimationFrame(
      () => {
        textareaRef.current
          ?.focus();
      }
    );
  }

  /*
   * ============================================================
   * EMOJI
   * ============================================================
   */

  function handleEmojiClick(
    emojiData:
      EmojiClickData
  ) {
    if (
      disabled ||
      busy
    ) {
      return;
    }

    const emoji =
      emojiData.emoji;

    const textarea =
      textareaRef.current;

    const start =
      textarea
        ?.selectionStart ??
      content.length;

    const end =
      textarea
        ?.selectionEnd ??
      start;

    const nextContent =
      content.slice(
        0,
        start
      ) +
      emoji +
      content.slice(
        end
      );

    if (
      nextContent.length >
      MAX_MESSAGE_LENGTH
    ) {
      return;
    }

    setContent(
      nextContent
    );

    startTyping();

    const nextCaretPosition =
      start +
      emoji.length;

    requestAnimationFrame(
      () => {
        const currentTextarea =
          textareaRef.current;

        if (!currentTextarea) {
          return;
        }

        currentTextarea.focus();

        currentTextarea
          .setSelectionRange(
            nextCaretPosition,
            nextCaretPosition
          );
      }
    );
  }

  /*
   * ============================================================
   * SEND
   * ============================================================
   */

  async function submitMessage() {
    if (
      busy ||
      disabled
    ) {
      return;
    }

    if (
      !selectedImage &&
      !trimmedContent
    ) {
      return;
    }

    stopTyping();

    setEmojiPickerOpen(
      false
    );

    try {
      if (
        selectedImage
      ) {
        await onSendImage(
          selectedImage,
          trimmedContent
        );

        clearSelectedImage();

        setContent(
          ""
        );

        window.localStorage
          .removeItem(
            getDraftKey(
              conversationId
            )
          );

        requestAnimationFrame(
          () => {
            textareaRef.current
              ?.focus();
          }
        );

        return;
      }

      if (
        !trimmedContent
      ) {
        return;
      }

      await onSend(
        trimmedContent
      );

      setContent(
        ""
      );

      window.localStorage
        .removeItem(
          getDraftKey(
            conversationId
          )
        );

      requestAnimationFrame(
        () => {
          const textarea =
            textareaRef.current;

          if (!textarea) {
            return;
          }

          textarea.style.height =
            "auto";

          textarea.focus();
        }
      );
    } catch {
      textareaRef.current
        ?.focus();
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await submitMessage();
  }

  /*
   * ============================================================
   * KEYBOARD
   * ============================================================
   */

  function handleKeyDown(
    event:
      KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key ===
        "Escape" &&
      emojiPickerOpen
    ) {
      event.preventDefault();

      setEmojiPickerOpen(
        false
      );

      return;
    }

    if (
      event.key ===
        "Escape" &&
      replyingTo &&
      onCancelReply
    ) {
      event.preventDefault();

      onCancelReply();

      return;
    }

    if (
      event.key ===
        "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent
        .isComposing
    ) {
      event.preventDefault();

      void submitMessage();
    }
  }

  function handleContentChange(
    value: string
  ) {
    setContent(
      value
    );

    const hasContent =
      Boolean(
        value.trim()
      );

    if (!hasContent) {
      stopTyping();

      return;
    }

    startTyping();
  }

  const sendDisabled =
    disabled ||
    busy ||
    (
      !selectedImage &&
      !trimmedContent
    );

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="
        shrink-0
        border-t
        border-slate-200/80
        bg-white/95
        px-3
        pb-3
        pt-2.5
        backdrop-blur-2xl
        sm:px-4
        sm:pb-4
        sm:pt-3
      "
    >
      <div className="mx-auto w-full max-w-4xl">

        {/* =====================================================
            REPLY PREVIEW
            ===================================================== */}

        {replyingTo && (
          <div
            className="
              mb-2.5
              overflow-hidden
              rounded-2xl
              border
              border-blue-100
              bg-gradient-to-r
              from-blue-50/90
              via-white
              to-amber-50/40
              shadow-[0_5px_18px_rgba(15,23,42,0.05)]
            "
          >
            <div className="flex items-stretch">
              <div className="w-1 shrink-0 bg-gradient-to-b from-[#D4AF37] via-[#B38B19] to-[#0B2D5C]" />

              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-blue-100
                    bg-white
                    text-[#0B2D5C]
                    shadow-sm
                  "
                >
                  <Reply
                    size={16}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.08em] text-[#B18416]">
                    Replying to{" "}
                    {replySenderLabel}
                  </p>

                  {replyDeleted ? (
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs italic text-slate-500">
                      <Trash2
                        size={12}
                      />

                      This message was deleted
                    </p>
                  ) : replyIsImage ? (
                    <div className="mt-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-600">
                        📷 Photo
                      </p>

                      {replyingTo
                        .content
                        ?.trim() && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {truncateReplyText(
                            replyingTo
                              .content
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {truncateReplyText(
                        replyingTo
                          .content
                      ) ||
                        "Message"}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  title="Cancel reply"
                  aria-label="Cancel reply"
                  disabled={
                    busy
                  }
                  onClick={
                    onCancelReply
                  }
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                    disabled:opacity-50
                  "
                >
                  <X
                    size={17}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            IMAGE PREVIEW
            ===================================================== */}

        {imagePreviewUrl && (
          <div
            className="
              mb-2.5
              overflow-hidden
              rounded-2xl
              border
              border-blue-100
              bg-gradient-to-r
              from-blue-50/80
              via-white
              to-slate-50
              p-3
              shadow-[0_5px_18px_rgba(15,23,42,0.05)]
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={
                    imagePreviewUrl
                  }
                  alt="Selected image preview"
                  className="
                    h-16
                    w-16
                    rounded-2xl
                    object-cover
                    shadow-md
                    ring-1
                    ring-slate-200
                    sm:h-[72px]
                    sm:w-[72px]
                  "
                />

                <span
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-lg
                    border-2
                    border-white
                    bg-[#0B2D5C]
                    text-white
                    shadow
                  "
                >
                  <ImagePlus
                    size={12}
                  />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-[#0B2D5C]">
                  {selectedImage
                    ?.name}
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  {selectedImage
                    ? `${(
                        selectedImage.size /
                        1024 /
                        1024
                      ).toFixed(
                        2
                      )} MB`
                    : ""}
                </p>

                <p className="mt-1.5 text-[10px] text-slate-400">
                  Add a caption before sending if you like.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  clearSelectedImage
                }
                disabled={
                  busy
                }
                aria-label="Remove selected image"
                title="Remove image"
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-transparent
                  text-slate-400
                  transition
                  hover:border-red-100
                  hover:bg-red-50
                  hover:text-red-600
                  disabled:opacity-50
                "
              >
                <X
                  size={17}
                />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            IMAGE ERROR
            ===================================================== */}

        {imageError && (
          <div
            className="
              mb-2.5
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-3
              py-2
              text-[11px]
              font-semibold
              text-red-600
            "
          >
            {imageError}
          </div>
        )}

        <input
          ref={
            imageInputRef
          }
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={
            handleImageSelection
          }
          className="hidden"
        />

        {/* =====================================================
            PREMIUM COMPOSER SHELL
            ===================================================== */}

        <div
          className={[
            `
              relative
              flex
              min-w-0
              items-end
              gap-1
              rounded-[22px]
              border
              bg-slate-50/90
              p-1.5
              shadow-[0_7px_24px_rgba(15,23,42,0.07)]
              transition-all
              duration-200
              sm:gap-1.5
              sm:p-2
            `,

            disabled
              ? "border-slate-200 bg-slate-100/70"
              : "border-slate-200/90 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-[0_10px_32px_rgba(37,99,235,0.10)] focus-within:ring-4 focus-within:ring-blue-50/80",
          ].join(" ")}
        >

          {/* Attachment */}

          <button
            type="button"
            onClick={() =>
              imageInputRef
                .current
                ?.click()
            }
            disabled={
              disabled ||
              busy
            }
            title="Attach photo"
            aria-label="Attach photo"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              text-slate-500
              transition-all
              hover:bg-blue-50
              hover:text-[#0B2D5C]
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:h-11
              sm:w-11
            "
          >
            <Paperclip
              size={19}
            />
          </button>

          {/* Emoji */}

          <div className="relative shrink-0">
            <button
              ref={
                emojiButtonRef
              }
              type="button"
              disabled={
                disabled ||
                busy
              }
              title="Add emoji"
              aria-label="Open emoji picker"
              aria-expanded={
                emojiPickerOpen
              }
              onClick={() => {
                setEmojiPickerOpen(
                  (
                    current
                  ) =>
                    !current
                );
              }}
              className={[
                `
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  transition-all
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  sm:h-11
                  sm:w-11
                `,

                emojiPickerOpen
                  ? "bg-amber-50 text-[#B18416]"
                  : "text-slate-500 hover:bg-amber-50 hover:text-[#B18416]",
              ].join(" ")}
            >
              <Smile
                size={20}
              />
            </button>

            {emojiPickerOpen && (
              <div
                ref={
                  emojiPickerRef
                }
                className="
                  absolute
                  bottom-12
                  -left-12
                  z-50
                  max-w-[calc(100vw-1rem)]
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_20px_60px_rgba(15,23,42,0.22)]
                  sm:left-0
                "
              >
                <EmojiPicker
                  onEmojiClick={
                    handleEmojiClick
                  }
                  width={300}
                  height={360}
                  lazyLoadEmojis
                  searchPlaceHolder="Search emojis"
                  previewConfig={{
                    showPreview:
                      false,
                  }}
                />
              </div>
            )}
          </div>

          {/* Textarea */}

          <textarea
            ref={
              textareaRef
            }
            rows={1}
            maxLength={
              MAX_MESSAGE_LENGTH
            }
            value={
              content
            }
            disabled={
              disabled ||
              busy
            }
            onKeyDown={
              handleKeyDown
            }
            onChange={(
              event
            ) =>
              handleContentChange(
                event.target.value
              )
            }
            placeholder={
              selectedImage
                ? "Add a caption..."
                : replyingTo
                  ? "Type your reply..."
                  : disabled
                    ? "Messaging is unavailable"
                    : "Type a message..."
            }
            aria-label={
              selectedImage
                ? "Image caption"
                : replyingTo
                  ? "Reply message"
                  : "Message"
            }
            className="
              max-h-36
              min-h-10
              min-w-0
              flex-1
              resize-none
              overflow-y-auto
              border-0
              bg-transparent
              px-1.5
              py-2.5
              text-[13px]
              font-medium
              leading-5
              text-slate-800
              outline-none
              placeholder:font-normal
              placeholder:text-slate-400
              disabled:cursor-not-allowed
              disabled:text-slate-400
              sm:min-h-11
              sm:px-2
              sm:text-sm
              sm:leading-6
            "
          />

          {/* Send */}

          <button
            type="submit"
            disabled={
              sendDisabled
            }
            aria-label={
              uploadingImage
                ? "Uploading image"
                : sending
                  ? "Sending message"
                  : selectedImage
                    ? "Send image"
                    : replyingTo
                      ? "Send reply"
                      : "Send message"
            }
            title={
              selectedImage
                ? "Send photo"
                : replyingTo
                  ? "Send reply"
                  : "Send message"
            }
            className="
              group
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-[#0B2D5C]
              via-[#123F78]
              to-blue-700
              text-white
              shadow-[0_8px_20px_rgba(11,45,92,0.25)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-[0_12px_28px_rgba(11,45,92,0.32)]
              active:translate-y-0
              disabled:translate-y-0
              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:shadow-none
              sm:h-11
              sm:w-11
            "
          >
            {busy ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send
                size={18}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
          </button>
        </div>

        {/* =====================================================
            COMPOSER FOOTER
            ===================================================== */}

        <div
          className="
            mt-2
            hidden
            items-center
            justify-between
            gap-4
            px-1
            sm:flex
          "
        >
          <div className="flex min-w-0 items-center gap-2 text-[9px] font-medium text-slate-400">
            <ShieldCheck
              size={11}
              className="shrink-0 text-emerald-500"
            />

            <span className="truncate">
              Private & secure
              <span className="mx-1.5 text-slate-300">
                •
              </span>
              Enter to send
              <span className="mx-1.5 text-slate-300">
                •
              </span>
              Shift + Enter for new line
              {replyingTo
                ? " • Esc cancels reply"
                : ""}
            </span>
          </div>

          {content.length >
            1600 && (
            <span
              className={[
                "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold",

                remainingCharacters <=
                100
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {remainingCharacters} left
            </span>
          )}
        </div>

        {/* Mobile status */}

        <div className="mt-1.5 flex items-center justify-between px-1 sm:hidden">
          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400">
            <ShieldCheck
              size={10}
              className="text-emerald-500"
            />

            Secure messaging
          </span>

          {content.length >
            1600 && (
            <span
              className={[
                "text-[9px] font-bold",

                remainingCharacters <=
                100
                  ? "text-amber-600"
                  : "text-slate-400",
              ].join(" ")}
            >
              {remainingCharacters}
            </span>
          )}
        </div>

      </div>
    </form>
  );
}