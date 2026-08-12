"use client";

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
  Trash2,
  X,
} from "lucide-react";

import {
  ChatMessage,
} from "@/features/chat/types";

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

  const textareaRef =
    useRef<
      HTMLTextAreaElement | null
    >(null);

  const imageInputRef =
    useRef<
      HTMLInputElement | null
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
      className="border-t border-slate-200 bg-white p-3 md:p-4"
    >
      <div className="mx-auto max-w-4xl">

        {/* ======================================================
            REPLY BAR
           ====================================================== */}

        {replyingTo && (
          <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <div className="flex items-stretch">

              <div className="w-1 shrink-0 bg-[#0B2D5C]" />

              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">

                <Reply
                  size={17}
                  className="shrink-0 text-[#0B2D5C]"
                />

                <div className="min-w-0 flex-1">

                  <p className="truncate text-xs font-semibold text-[#0B2D5C]">
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
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
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-3">

              <img
                src={
                  imagePreviewUrl
                }
                alt="Selected image preview"
                className="h-24 w-24 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-slate-800">
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

                <p className="mt-2 text-xs text-slate-500">
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
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
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
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
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

        <div className="flex items-end gap-3">

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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus
              size={19}
            />
          </button>

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
            className="max-h-36 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B2D5C] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#123C73] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="mt-2 flex items-center justify-between gap-4 px-1 text-[10px] text-slate-400">

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