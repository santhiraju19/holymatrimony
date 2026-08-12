
"use client";

import {
  PresenceStatus,
} from "@/features/chat/api/presence.service";

import {
  ChatMessage,
  Conversation,
} from "@/features/chat/types";

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
  onRemoveReaction,
}: ChatWindowProps) {
  if (!conversation) {
    return (
      <EmptyChatState />
    );
  }

  const otherUser =
    conversation.otherUser;

  return (
    <section className="flex h-full min-h-0 flex-col bg-white">

      {/* ======================================================
          CHAT HEADER
         ====================================================== */}

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
        onBack={
          onBack
        }
      />

      {/* ======================================================
          MESSAGE LIST
         ====================================================== */}

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

      {/* ======================================================
          MESSAGE COMPOSER
         ====================================================== */}

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