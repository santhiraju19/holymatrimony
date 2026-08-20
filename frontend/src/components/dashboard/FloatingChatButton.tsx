"use client";

import { useState } from "react";
import {
  MessageCircle,
  Minus,
  X,
} from "lucide-react";

import FloatingChatPanel from "@/features/chat/components/FloatingChatPanel";

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  function openChat() {
    setOpen(true);
    setMinimized(false);
  }

  function closeChat() {
    setOpen(false);
    setMinimized(false);
  }

  return (
    <>
      {open && !minimized && (
        <div
          className="
            fixed
            bottom-24
            right-3
            z-[90]

            h-[calc(100dvh-7.5rem)]
            max-h-[720px]

            w-[calc(100vw-1.5rem)]
            max-w-[980px]

            overflow-visible
            rounded-[24px]
            border
            border-slate-200
            bg-white

            shadow-[0_30px_90px_rgba(2,8,23,0.30)]

            sm:right-6

            lg:h-[680px]
            lg:w-[900px]
          "
        >
          {/* Header */}

          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-4 text-white sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <MessageCircle size={19} />
              </span>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-black">
                  Messages
                </h2>

                <p className="truncate text-[10px] text-blue-100">
                  Holy Matrimony Chat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMinimized(true)}
                aria-label="Minimize chat"
                title="Minimize"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                  transition
                  hover:bg-white/20
                "
              >
                <Minus size={18} />
              </button>

              <button
                type="button"
                onClick={closeChat}
                aria-label="Close chat"
                title="Close"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                  transition
                  hover:bg-white/20
                "
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Complete Chat Workspace */}

         <div className="h-[calc(100%-4rem)] min-h-0 overflow-hidden rounded-b-[24px]">
  <FloatingChatPanel />
</div>
        </div>
      )}

      {/* Floating Chat Button */}

      <button
        type="button"
        onClick={() => {
          if (open) {
            if (minimized) {
              setMinimized(false);
            } else {
              closeChat();
            }

            return;
          }

          openChat();
        }}
        aria-label={
          open && !minimized
            ? "Close messages"
            : "Open messages"
        }
        className="
          fixed
          bottom-5
          right-4
          z-[91]

          flex
          h-14
          items-center
          gap-2

          rounded-full
          bg-[#0B2D5C]
          px-4
          text-white

          shadow-[0_14px_40px_rgba(11,45,92,0.32)]

          transition-all
          duration-200

          hover:-translate-y-1
          hover:bg-[#123F78]
          hover:shadow-[0_18px_50px_rgba(11,45,92,0.40)]

          sm:bottom-6
          sm:right-6
          sm:h-16
          sm:px-5
        "
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          {open && !minimized ? (
            <X size={20} />
          ) : (
            <MessageCircle size={21} />
          )}

          {(!open || minimized) && (
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B2D5C] bg-emerald-400" />
          )}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-sm font-black">
            {open && !minimized
              ? "Close"
              : minimized
                ? "Messages"
                : "Chat"}
          </span>

          <span className="block text-[9px] text-blue-100">
            {minimized
              ? "Open chat"
              : "Messages"}
          </span>
        </span>
      </button>
    </>
  );
}