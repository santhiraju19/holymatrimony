"use client";

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

import {
  Loader2,
  Send,
} from "lucide-react";

interface MessageComposerProps {
  sending: boolean;
  disabled?: boolean;
  onSend: (
    content: string
  ) => Promise<void>;
}

export default function MessageComposer({
  sending,
  disabled = false,
  onSend,
}: MessageComposerProps) {
  const [content, setContent] =
    useState("");

  async function submitMessage() {
    const trimmedContent =
      content.trim();

    if (
      !trimmedContent ||
      sending ||
      disabled
    ) {
      return;
    }

    await onSend(trimmedContent);
    setContent("");
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
      !event.shiftKey
    ) {
      event.preventDefault();
      void submitMessage();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-3 md:p-4"
    >
      <div className="mx-auto flex max-w-4xl items-end gap-3">
        <textarea
          rows={1}
          maxLength={2000}
          value={content}
          disabled={disabled || sending}
          onKeyDown={handleKeyDown}
          onChange={(event) =>
            setContent(
              event.target.value
            )
          }
          placeholder="Type a message..."
          className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            disabled ||
            sending ||
            !content.trim()
          }
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B2D5C] text-white shadow-md transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <Loader2
              size={19}
              className="animate-spin"
            />
          ) : (
            <Send size={19} />
          )}
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-4xl px-1 text-[10px] text-slate-400">
        Press Enter to send. Use
        Shift + Enter for a new line.
      </p>
    </form>
  );
}