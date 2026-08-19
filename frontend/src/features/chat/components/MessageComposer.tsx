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
  Reply,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";

import {
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

  /*
   * Keep the latest typing callback without
   * forcing typing timers to restart whenever
   * the parent renders.
   */
  const onTypingChangeRef =
    useRef(
      onTypingChange
    );

  /*
   * Typing debounce state.
   *
   * typingActiveRef prevents us from sending
   * typing=true on every keystroke.
   *
   * typingTimeoutRef determines when the user
   * has stopped typing.
   */
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
   * KEEP CALLBACK REF UPDATED
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
   * TYPING HELPERS
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

  /*
   * ============================================================
   * STOP TYPING ON CONVERSATION CHANGE / UNMOUNT
   * ============================================================
   */

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
   * LOAD DRAFT WHEN CONVERSATION CHANGES
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

  /*
   * ============================================================
   * SAVE DRAFT
   * ============================================================
   */

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
   * AUTO-RESIZE TEXTAREA
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
   * FOCUS COMPOSER WHEN REPLY STARTS
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
   * CLOSE EMOJI PICKER ON OUTSIDE CLICK
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
   * CLEAN IMAGE OBJECT URL
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

  /*
   * ============================================================
   * CLEAR IMAGE
   * ============================================================
   */

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

  /*
   * ============================================================
   * IMAGE SELECTION
   * ============================================================
   */

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
  }

  /*
   * ============================================================
   * EMOJI INSERTION
   * ============================================================
   *
   * Inserts the selected emoji at the current cursor position
   * or replaces the current text selection.
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
   * SUBMIT
   * ============================================================
   */

  async function submitMessage() {
    if (
      busy ||
      disabled
    ) {
      return;
    }

    /*
     * Don't stop typing unless there is
     * actually something that can be sent.
     */
    if (
      !selectedImage &&
      !trimmedContent
    ) {
      return;
    }

    /*
     * Sending a message immediately ends
     * the typing state.
     */
    stopTyping();

    setEmojiPickerOpen(
      false
    );

    try {
      /*
       * ========================================================
       * IMAGE + OPTIONAL CAPTION
       * ========================================================
       *
       * useChat.sendImage() carries the current
       * replyToMessageId when replyingTo exists.
       */

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

        /*
         * useChat clears replyingTo after
         * successful send. We intentionally
         * do not clear it locally here.
         */

        requestAnimationFrame(
          () => {
            textareaRef.current
              ?.focus();
          }
        );

        return;
      }

      /*
       * ========================================================
       * NORMAL TEXT MESSAGE
       * ========================================================
       */

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

  /*
   * ============================================================
   * FORM SUBMIT
   * ============================================================
   */

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
    /*
     * Escape closes the emoji picker first.
     */
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

    /*
     * Escape cancels the current reply.
     */
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

    /*
     * Enter = send
     * Shift + Enter = newline
     */
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

  /*
   * ============================================================
   * CONTENT / TYPING
   * ============================================================
   */

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

    /*
     * If the composer becomes empty,
     * stop typing immediately.
     */
    if (!hasContent) {
      stopTyping();

      return;
    }

    /*
     * First keystroke sends typing=true.
     *
     * Continued typing only resets the
     * inactivity timer instead of sending
     * repeated typing=true events.
     */
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
      className="border-t border-slate-100 bg-white/95 px-2.5 py-2.5 backdrop-blur-xl sm:px-3 md:px-4 md:py-3"
    >
      <div className="mx-auto max-w-4xl">

        {/* ======================================================
            REPLY BAR
           ====================================================== */}

        {replyingTo && (
          <div className="mb-2 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 shadow-sm">
            <div className="flex items-stretch">

              <div className="w-[3px] shrink-0 bg-gradient-to-b from-[#D4AF37] to-[#0B2D5C]" />

              <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 sm:px-3">

                <Reply
                  size={17}
                  className="shrink-0 text-[#0B2D5C]"
                />

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[10px] font-black text-[#0B2D5C] sm:text-[11px]">
                    Replying to{" "}
                    {replySenderLabel}
                  </p>

                  {replyDeleted ? (
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs italic text-slate-500">
                      <Trash2
                        size={12}
                      />

                      This message was deleted
                    </p>
                  ) : replyIsImage ? (
                    <div className="mt-0.5 min-w-0">

                      <p className="truncate text-xs text-slate-500">
                        📷 Photo
                      </p>

                      {replyingTo
                        .content
                        ?.trim() && (
                        <p className="truncate text-xs text-slate-600">
                          {truncateReplyText(
                            replyingTo
                              .content
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-0.5 truncate text-xs text-slate-600">
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X
                    size={17}
                  />
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            IMAGE PREVIEW
           ====================================================== */}

        {imagePreviewUrl && (
          <div className="mb-2 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 p-2.5 shadow-sm">
            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">

              <img
                src={
                  imagePreviewUrl
                }
                alt="Selected image preview"
                className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200 sm:h-16 sm:w-16"
              />

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-black text-[#0B2D5C]">
                  {selectedImage
                    ?.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
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

                <p className="mt-1 text-[10px] text-slate-400">
                  Add an optional caption below.
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
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X
                  size={18}
                />
              </button>

            </div>
          </div>
        )}

        {/* ======================================================
            IMAGE ERROR
           ====================================================== */}

        {imageError && (
          <p className="mb-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">
            {imageError}
          </p>
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

        {/* ======================================================
            INPUT ROW
           ====================================================== */}

        <div className="relative flex min-w-0 items-end gap-1.5 sm:gap-2">

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
            title="Send image"
            aria-label="Select image"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
          >
            <ImagePlus
              size={19}
            />
          </button>

          {/* ====================================================
              EMOJI PICKER
             ==================================================== */}

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
                "flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10",

                emojiPickerOpen
                  ? "border-[#D4AF37] bg-amber-50 text-[#0B2D5C]"
                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
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
                className="absolute bottom-11 -left-12 z-50 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:left-0"
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
            className="max-h-32 min-h-9 min-w-0 flex-1 resize-none overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:max-h-36 sm:min-h-10 sm:text-sm"
          />

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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-[0_6px_18px_rgba(11,45,92,0.22)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
          >
            {busy ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <Send
                size={19}
              />
            )}
          </button>

        </div>

        {/* ======================================================
            FOOTER
           ====================================================== */}

        <div className="mt-1.5 hidden items-center justify-between gap-4 px-1 text-[9px] font-medium text-slate-400 sm:flex">

          <p>
            JPEG, PNG or WebP · Maximum 10 MB
            {replyingTo
              ? " · Esc cancels reply"
              : ""}
          </p>

          {content.length >
            1600 && (
            <p
              className={
                remainingCharacters <=
                  100
                  ? "font-semibold text-amber-600"
                  : ""
              }
            >
              {remainingCharacters} left
            </p>
          )}

        </div>

      </div>
    </form>
  );
}