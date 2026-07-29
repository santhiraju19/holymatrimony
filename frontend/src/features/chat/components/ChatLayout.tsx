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
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    selectConversation,
    clearSelection,
    sendMessage,
    refresh,
  } = useChat();

  const hasSelectedConversation =
    Boolean(selectedConversation);

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="flex-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            aria-label="Retry"
            className="rounded p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="h-[calc(100vh-10rem)] min-h-[560px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="grid h-full grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] lg:grid-cols-[380px_minmax(0,1fr)]">
          <div
            className={
              hasSelectedConversation
                ? "hidden min-h-0 md:block"
                : "min-h-0"
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
                ? "min-h-0"
                : "hidden min-h-0 md:block"
            }
          >
            <ChatWindow
              conversation={
                selectedConversation
              }
              messages={messages}
              loadingMessages={
                loadingMessages
              }
              sending={sending}
              onBack={clearSelection}
              onSend={sendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}