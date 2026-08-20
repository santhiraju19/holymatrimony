"use client";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import useChat from "@/features/chat/hooks/useChat";

import ChatWindow from "./ChatWindow";
import ConversationList from "./ConversationList";

export default function FloatingChatPanel() {
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
    removeMessageReaction,

    deleteConversation,
  } = useChat();

  const hasSelectedConversation =
    Boolean(selectedConversation);

  return (
    <div className="relative h-full min-h-0 bg-white">
      {/* =====================================================
          Error
          ===================================================== */}

      {error && (
        <div
          className="
            absolute
            inset-x-3
            top-3
            z-30

            flex
            items-center
            gap-2

            rounded-xl
            border
            border-red-200
            bg-red-50

            px-3
            py-2

            text-xs
            font-semibold
            text-red-700

            shadow-sm
          "
        >
          <AlertCircle
            size={15}
            className="shrink-0"
          />

          <p className="min-w-0 flex-1 truncate">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            aria-label="Retry chat"
            title="Retry"
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition
              hover:bg-red-100
            "
          >
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* =====================================================
          Desktop / Tablet

          This is the important change.

          ConversationList remains permanently visible on the
          left while ChatWindow remains visible on the right.
          ===================================================== */}

      <div
        className="
          hidden
          h-full
          min-h-0
          min-w-0

          md:grid
          md:grid-cols-[290px_minmax(0,1fr)]

          lg:grid-cols-[310px_minmax(0,1fr)]
        "
      >
        {/* Conversation List */}

        <div className="min-h-0 min-w-0 overflow-hidden border-r border-slate-200">
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

        {/* Active Conversation */}

        <div className="min-h-0 min-w-0 overflow-hidden">
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
            onReactMessage={
              reactToMessage
            }
            onRemoveReaction={
              removeMessageReaction
            }
            onDeleteConversation={
              deleteConversation
            }
          />
        </div>
      </div>

      {/* =====================================================
          Mobile

          Mobile remains list -> conversation because displaying
          both columns simultaneously would be too narrow.
          ===================================================== */}

      <div className="h-full min-h-0 md:hidden">
        <div
          className={[
            "h-full min-h-0",

            hasSelectedConversation
              ? "hidden"
              : "block",
          ].join(" ")}
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
          className={[
            "h-full min-h-0",

            hasSelectedConversation
              ? "block"
              : "hidden",
          ].join(" ")}
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
            onReactMessage={
              reactToMessage
            }
            onRemoveReaction={
              removeMessageReaction
            }
            onDeleteConversation={
              deleteConversation
            }
          />
        </div>
      </div>
    </div>
  );
}