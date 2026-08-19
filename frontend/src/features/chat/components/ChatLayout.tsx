"use client";

import {
  AlertCircle,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import useChat from "@/features/chat/hooks/useChat";

import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";

export default function ChatLayout() {
  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectedUserPresence,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    uploadingImage,
    error,
    isRealtimeConnected,
    isOtherUserTyping,
    replyingTo,
    selectConversation,
    clearSelection,
    sendMessage,
    sendImage,
    sendTypingStatus,
    refresh,
    startReply,
    cancelReply,
    editMessage,
    deleteMessage,
    reactToMessage,
    deleteConversation,
    removeMessageReaction,
  } = useChat();

  const hasSelectedConversation =
    Boolean(
      selectedConversation
    );

  const unreadTotal =
    conversations.reduce(
      (
        total,
        conversation
      ) =>
        total +
        (
          conversation.unreadCount ??
          0
        ),
      0
    );

  return (
    <div className="space-y-3 pb-4">

      {/* =====================================================
          Compact Chat Page Header
          ===================================================== */}

      <section className="relative overflow-hidden rounded-[20px] border border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-4 py-3.5 text-white shadow-[0_12px_32px_rgba(11,45,92,0.14)] sm:px-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#F2D675]">
              <MessageCircleMore
                size={17}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles
                  size={10}
                  className="text-[#F2D675]"
                />

                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675]">
                  Secure Conversations
                </p>
              </div>

              <h1 className="mt-0.5 text-lg font-black tracking-[-0.025em] sm:text-xl">
                Messages
              </h1>

              <p className="mt-0.5 text-[10px] text-blue-100 sm:text-[11px]">
                Connect privately with accepted matches.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black",

                isRealtimeConnected
                  ? "border-emerald-300/25 bg-emerald-400/15 text-emerald-200"
                  : "border-amber-300/25 bg-amber-400/15 text-amber-100",
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",

                  isRealtimeConnected
                    ? "bg-emerald-400"
                    : "bg-amber-400",
                ].join(" ")}
              />

              {isRealtimeConnected
                ? "Live connected"
                : "Connecting"}
            </span>

            {unreadTotal > 0 && (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-black text-white">
                {unreadTotal > 99
                  ? "99+"
                  : unreadTotal}{" "}
                unread
              </span>
            )}

            <span className="hidden items-center gap-1.5 text-[9px] font-semibold text-blue-100 sm:inline-flex">
              <ShieldCheck
                size={11}
                className="text-emerald-400"
              />

              Protected messaging
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          Error
          ===================================================== */}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0"
          />

          <p className="min-w-0 flex-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            aria-label="Retry"
            title="Retry"
            className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =====================================================
          Premium Chat Workspace
          ===================================================== */}

      <div
        className="
          h-[calc(100dvh-11rem)]
          min-h-[500px]
          overflow-hidden
          rounded-[20px]
          border
          border-slate-200/80
          bg-white
          shadow-[0_12px_36px_rgba(15,23,42,0.07)]
          md:h-[calc(100vh-11.5rem)]
          md:min-h-[540px]
        "
      >
        <div className="grid h-full min-w-0 grid-cols-1 md:grid-cols-[285px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
          <div
            className={
              hasSelectedConversation
                ? "hidden min-h-0 min-w-0 md:block"
                : "min-h-0 min-w-0"
            }
          >
            <ConversationList
              conversations={
                conversations
              }
              selectedConversationId={
                selectedConversationId
              }
              loading={
                loadingConversations
              }
              onSelect={
                selectConversation
              }
              onRefresh={() => {
                void refresh();
              }}
            />
          </div>

          <div
            className={
              hasSelectedConversation
                ? "min-h-0 min-w-0"
                : "hidden min-h-0 min-w-0 md:block"
            }
          >
            <ChatWindow
              conversation={
                selectedConversation
              }
              presence={
                selectedUserPresence
              }
              messages={
                messages
              }
              loadingMessages={
                loadingMessages
              }
              sending={
                sending
              }
              uploadingImage={
                uploadingImage
              }
              realtimeConnected={
                isRealtimeConnected
              }
              otherUserTyping={
                isOtherUserTyping
              }
              replyingTo={
                replyingTo
              }
              onBack={
                clearSelection
              }
              onSend={
                sendMessage
              }
              onSendImage={
                sendImage
              }
              onTypingChange={
                sendTypingStatus
              }
              onReply={
                startReply
              }
              onCancelReply={
                cancelReply
              }
              onEditMessage={
                editMessage
              }
              onDeleteMessage={
                deleteMessage
              }
              onDeleteConversation={
                deleteConversation
              }
              onReactMessage={
                reactToMessage
              }
              onRemoveReaction={
                removeMessageReaction
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
