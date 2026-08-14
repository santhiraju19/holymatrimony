
"use client";

import {
  AlertCircle,
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
    Boolean(selectedConversation);

  return (
    <div className="min-w-0">
      {error && (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 sm:px-4 sm:py-3">
          <AlertCircle
            size={18}
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
            className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        className="
          h-[calc(100dvh-8.5rem)]
          min-h-[500px]
          overflow-hidden
          border
          border-slate-200
          bg-white
          shadow-md
          sm:rounded-2xl
          md:h-[calc(100vh-9rem)]
          md:min-h-[540px]
        "
      >
        <div className="grid h-full min-w-0 grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
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