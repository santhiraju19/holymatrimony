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
  Send,
  X,
} from "lucide-react";

interface MessageComposerProps {
  conversationId: string;
  sending: boolean;
  uploadingImage: boolean;
  disabled?: boolean;

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

const MAX_MESSAGE_LENGTH = 2000;
const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

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

export default function MessageComposer({
  conversationId,
  sending,
  uploadingImage,
  disabled = false,
  onSend,
  onSendImage,
  onTypingChange,
}: MessageComposerProps) {
  const [content, setContent] =
    useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(null);

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState<string | null>(null);

  const [
    imageError,
    setImageError,
  ] = useState<string | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const imageInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const onTypingChangeRef =
    useRef(onTypingChange);

  const busy =
    sending || uploadingImage;

  const trimmedContent =
    content.trim();

  const remainingCharacters =
    MAX_MESSAGE_LENGTH -
    content.length;

  useEffect(() => {
    onTypingChangeRef.current =
      onTypingChange;
  }, [onTypingChange]);

  useEffect(() => {
    const savedDraft =
      window.localStorage.getItem(
        getDraftKey(conversationId)
      );

    setContent(savedDraft ?? "");
    clearSelectedImage();
  }, [conversationId]);

  useEffect(() => {
    const draftKey =
      getDraftKey(conversationId);

    if (content) {
      window.localStorage.setItem(
        draftKey,
        content
      );
    } else {
      window.localStorage.removeItem(
        draftKey
      );
    }
  }, [
    content,
    conversationId,
  ]);

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        144
      )}px`;
  }, [content]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(
          imagePreviewUrl
        );
      }
    };
  }, [imagePreviewUrl]);

  function clearSelectedImage() {
    setSelectedImage(null);
    setImageError(null);

    setImagePreviewUrl(
      (currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(
            currentUrl
          );
        }

        return null;
      }
    );

    if (imageInputRef.current) {
      imageInputRef.current.value =
        "";
    }
  }

  function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    setImageError(null);

    if (!file) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setImageError(
        "Only JPEG, PNG and WebP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(
        "Image size must not exceed 10 MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    setImagePreviewUrl(
      (currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(
            currentUrl
          );
        }

        return URL.createObjectURL(
          file
        );
      }
    );
  }

  async function submitMessage() {
    if (
      busy ||
      disabled
    ) {
      return;
    }

    try {
      if (selectedImage) {
        await onSendImage(
          selectedImage,
          trimmedContent
        );

        clearSelectedImage();
        setContent("");

        window.localStorage.removeItem(
          getDraftKey(conversationId)
        );

        return;
      }

      if (!trimmedContent) {
        return;
      }

      await onSend(
        trimmedContent
      );

      setContent("");

      window.localStorage.removeItem(
        getDraftKey(conversationId)
      );

      requestAnimationFrame(() => {
        const textarea =
          textareaRef.current;

        if (!textarea) {
          return;
        }

        textarea.style.height =
          "auto";

        textarea.focus();
      });
    } catch {
      textareaRef.current?.focus();
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await submitMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      void submitMessage();
    }
  }

  function handleContentChange(
    value: string
  ) {
    setContent(value);

    if (value.trim()) {
      onTypingChangeRef.current?.(
        true
      );
    }
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
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-3 md:p-4"
    >
      <div className="mx-auto max-w-4xl">
        {imagePreviewUrl && (
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-3">
              <img
                src={imagePreviewUrl}
                alt="Selected image preview"
                className="h-24 w-24 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {selectedImage?.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedImage
                    ? `${(
                        selectedImage.size /
                        1024 /
                        1024
                      ).toFixed(2)} MB`
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
                disabled={busy}
                aria-label="Remove selected image"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {imageError && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {imageError}
          </p>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={
            handleImageSelection
          }
          className="hidden"
        />

        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={() =>
              imageInputRef.current
                ?.click()
            }
            disabled={
              disabled || busy
            }
            title="Send image"
            aria-label="Select image"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={19} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={
              MAX_MESSAGE_LENGTH
            }
            value={content}
            disabled={
              disabled || busy
            }
            onKeyDown={
              handleKeyDown
            }
            onChange={(event) =>
              handleContentChange(
                event.target.value
              )
            }
            placeholder={
              selectedImage
                ? "Add a caption..."
                : disabled
                  ? "Messaging is unavailable"
                  : "Type a message..."
            }
            aria-label={
              selectedImage
                ? "Image caption"
                : "Message"
            }
            className="max-h-36 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={sendDisabled}
            aria-label={
              uploadingImage
                ? "Uploading image"
                : sending
                  ? "Sending message"
                  : selectedImage
                    ? "Send image"
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
              <Send size={19} />
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4 px-1 text-[10px] text-slate-400">
          <p>
            JPEG, PNG or WebP · Maximum 10 MB
          </p>

          {content.length > 1600 && (
            <p
              className={
                remainingCharacters <= 100
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