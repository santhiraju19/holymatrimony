"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Ban,
  Loader2,
} from "lucide-react";

import {
  PresenceStatus,
} from "@/features/chat/api/presence.service";

import {
  ChatMessage,
  Conversation,
} from "@/features/chat/types";

import safetyService, {
  BlockStatusResponse,
} from "@/features/safety/api/safety.service";

import ChatHeader from "./ChatHeader";
import EmptyChatState from "./EmptyChatState";
import MessageComposer from "./MessageComposer";
import MessageList from "./MessageList";

interface ChatWindowProps {
  conversation:
    Conversation | null;

  presence:
    PresenceStatus | null;

  messages:
    ChatMessage[];

  loadingMessages:
    boolean;

  sending:
    boolean;

  uploadingImage:
    boolean;

  realtimeConnected:
    boolean;

  otherUserTyping:
    boolean;

  replyingTo:
    ChatMessage | null;

      onDeleteConversation: (
    conversationId: string
  ) => Promise<void>;

  onBack:
    () => void;

  onSend: (
    content: string
  ) => Promise<void>;

  onSendImage: (
    file: File,
    caption: string
  ) => Promise<void>;

  onTypingChange: (
    typing: boolean
  ) => void;

  onReply: (
    message: ChatMessage
  ) => void;

  onCancelReply:
    () => void;

  onEditMessage: (
    messageId: string,
    content: string
  ) => Promise<void>;

  onDeleteMessage: (
    messageId: string
  ) => Promise<void>;

  onReactMessage: (
    messageId: string,
    reaction: string
  ) => Promise<void>;

  onRemoveReaction: (
    messageId: string
  ) => Promise<void>;
}

export default function ChatWindow({
  conversation,
  presence,
  messages,
  loadingMessages,
  sending,
  uploadingImage,
  realtimeConnected,
  otherUserTyping,
  replyingTo,
  onBack,
  onSend,
  onSendImage,
  onTypingChange,
  onReply,
  onCancelReply,
  onEditMessage,
  onDeleteMessage,
  onReactMessage,
    onDeleteConversation,
  onRemoveReaction,
}: ChatWindowProps) {
  const [
    blockStatus,
    setBlockStatus,
  ] =
    useState<
      BlockStatusResponse | null
    >(null);

  const [
    loadingBlockStatus,
    setLoadingBlockStatus,
  ] =
    useState(false);

  const [
    safetyError,
    setSafetyError,
  ] =
    useState<string | null>(
      null
    );

  const conversationId =
    conversation?.id ?? null;

  const otherUserId =
    conversation?.otherUser
      .userId ?? null;

  useEffect(() => {
    let cancelled =
      false;

    async function loadBlockStatus() {
      if (!otherUserId) {
        setBlockStatus(null);
        setSafetyError(null);
        setLoadingBlockStatus(
          false
        );

        return;
      }

      setLoadingBlockStatus(true);
      setSafetyError(null);
      setBlockStatus(null);

      try {
        const status =
          await safetyService
            .getBlockStatus(
              otherUserId
            );

        if (!cancelled) {
          setBlockStatus(
            status
          );
        }
      } catch (error) {
        console.error(
          "[Chat Safety] Unable to load block status:",
          error
        );

        if (!cancelled) {
          setSafetyError(
            "Unable to verify messaging availability."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBlockStatus(
            false
          );
        }
      }
    }

    void loadBlockStatus();

    return () => {
      cancelled = true;
    };
  }, [
    conversationId,
    otherUserId,
  ]);

  if (!conversation) {
    return (
      <EmptyChatState />
    );
  }

  const otherUser =
    conversation.otherUser;

  const messagingBlocked =
    blockStatus
      ?.messagingBlocked ===
    true;

  /*
   * Fail closed while safety status is loading or unavailable.
   *
   * The backend still remains authoritative, but disabling the
   * composer prevents confusing failed sends in the UI.
   */
  const composerDisabled =
    loadingBlockStatus ||
    messagingBlocked ||
    Boolean(safetyError);

  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <ChatHeader
        conversation={
          conversation
        }
        presence={
          presence
        }
        realtimeConnected={
          realtimeConnected
        }
        otherUserTyping={
          otherUserTyping
        }

        
        blockStatus={
          blockStatus
        }
        onBlockStatusChange={
          setBlockStatus
        }

        onDeleteConversation={
  onDeleteConversation
}
        onBack={
          onBack
        }
      />

      <MessageList
        messages={
          messages
        }
        otherUserId={
          otherUser.userId
        }
        loading={
          loadingMessages
        }
        onReply={
          onReply
        }
        onEdit={
          onEditMessage
        }
        onDelete={
          onDeleteMessage
        }
        onReact={
          onReactMessage
        }
        onRemoveReaction={
          onRemoveReaction
        }
      />

      {loadingBlockStatus && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          <Loader2
            size={14}
            className="animate-spin"
          />

          Checking messaging availability…
        </div>
      )}

      {!loadingBlockStatus &&
        messagingBlocked && (
          <div className="flex items-center justify-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            <Ban
              size={17}
            />

            Messaging is currently unavailable.
          </div>
        )}

      {!loadingBlockStatus &&
        safetyError && (
          <div className="flex items-center justify-center gap-2 border-t border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertTriangle
              size={17}
            />

            {safetyError}
          </div>
        )}

      <MessageComposer
        conversationId={
          conversation.id
        }
        sending={
          sending
        }
        uploadingImage={
          uploadingImage
        }
        disabled={
          composerDisabled
        }
        replyingTo={
          replyingTo
        }
        otherUserId={
          otherUser.userId
        }
        otherUserName={
          otherUser.fullName
        }
        onCancelReply={
          onCancelReply
        }
        onSend={
          onSend
        }
        onSendImage={
          onSendImage
        }
        onTypingChange={
          onTypingChange
        }
      />
    </section>
  );
}