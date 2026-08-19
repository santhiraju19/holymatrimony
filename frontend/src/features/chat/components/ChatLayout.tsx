"use client";

import Link from "next/link";

import {
  AlertCircle,
  Crown,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import useChat from "@/features/chat/hooks/useChat";

import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";

const MEMBERSHIP_UPGRADE_MESSAGE =
  "upgrade your membership";

function isMembershipUpgradeError(
  message?: string | null
): boolean {
  if (!message) {
    return false;
  }

  return message
    .trim()
    .toLowerCase()
    .includes(
      MEMBERSHIP_UPGRADE_MESSAGE
    );
}

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

  const [
    upgradeModalOpen,
    setUpgradeModalOpen,
  ] = useState(false);

  const hasSelectedConversation =
    Boolean(
      selectedConversation
    );

  const membershipUpgradeRequired =
    isMembershipUpgradeError(
      error
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

  /*
   * ============================================================
   * MEMBERSHIP UPGRADE ERROR
   * ============================================================
   *
   * The backend remains the source of truth.
   *
   * When CommunicationService rejects a FREE member's
   * WebSocket message with MembershipFeatureRequiredException,
   * useChat stores that WebSocket message in `error`.
   *
   * This component converts only that membership-specific
   * failure into an upgrade modal.
   *
   * Ordinary errors continue to use the inline error banner.
   */

  useEffect(() => {
    if (
      membershipUpgradeRequired
    ) {
      setUpgradeModalOpen(
        true
      );
    }
  }, [
    error,
    membershipUpgradeRequired,
  ]);

  return (
    <>
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
            Normal Chat Error
            =====================================================
            
            Membership errors use the dedicated modal below.
            Other errors remain visible inline.
        */}

        {error &&
          !membershipUpgradeRequired && (
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

      {/* =========================================================
          MEMBERSHIP UPGRADE MODAL
          ========================================================= */}

      {upgradeModalOpen &&
        membershipUpgradeRequired && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-slate-950/55
              px-4
              py-6
              backdrop-blur-sm
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-upgrade-title"
          >
            <div
              className="
                relative
                w-full
                max-w-md
                overflow-hidden
                rounded-[28px]
                border
                border-white/70
                bg-white
                shadow-[0_28px_90px_rgba(2,6,23,0.35)]
              "
            >
              {/* Decorative header */}

              <div className="relative overflow-hidden bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 pb-8 pt-6 text-white">
                <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-blue-300/15 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#D4AF37]/15 blur-3xl" />

                <button
                  type="button"
                  onClick={() => {
                    setUpgradeModalOpen(
                      false
                    );
                  }}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-blue-100 transition hover:bg-white/20 hover:text-white"
                  aria-label="Close membership upgrade"
                >
                  <X size={16} />
                </button>

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F2D675]/30 bg-[#D4AF37]/15 text-[#F2D675] shadow-lg">
                    <Crown
                      size={23}
                    />
                  </div>

                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                    Premium Messaging
                  </p>

                  <h2
                    id="chat-upgrade-title"
                    className="mt-1 text-2xl font-black tracking-[-0.035em]"
                  >
                    Upgrade to start chatting
                  </h2>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-blue-100">
                    Messaging is available with Silver, Gold,
                    and Platinum memberships.
                  </p>
                </div>
              </div>

              {/* Body */}

              <div className="px-6 py-5">
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#B18416] shadow-sm">
                      <MessageCircleMore
                        size={16}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Your match is ready to connect
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Upgrade your membership to send messages
                        and continue the conversation securely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                    <ShieldCheck
                      size={15}
                      className="shrink-0 text-emerald-600"
                    />

                    Private messaging with accepted matches
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                    <Sparkles
                      size={15}
                      className="shrink-0 text-[#B18416]"
                    />

                    Chat access begins from Silver membership
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setUpgradeModalOpen(
                        false
                      );
                    }}
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      text-sm
                      font-bold
                      text-slate-700
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                    "
                  >
                    Maybe Later
                  </button>

                  <Link
                    href="/membership"
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-[#0B2D5C]
                      to-blue-700
                      px-5
                      text-sm
                      font-black
                      text-white
                      shadow-[0_8px_24px_rgba(11,45,92,0.2)]
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-lg
                    "
                  >
                    <Crown
                      size={16}
                      className="text-[#F2D675]"
                    />

                    View Membership Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
