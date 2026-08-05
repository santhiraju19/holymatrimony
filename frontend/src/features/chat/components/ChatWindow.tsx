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
  conversation: Conversation | null;
  presence: PresenceStatus | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  sending: boolean;
  uploadingImage: boolean;
  realtimeConnected: boolean;
  otherUserTyping: boolean;

  onBack: () => void;

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
  onBack,
  onSend,
  onSendImage,
  onTypingChange,
}: ChatWindowProps) {
  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <ChatHeader
        conversation={conversation}
        presence={presence}
        realtimeConnected={
          realtimeConnected
        }
        otherUserTyping={
          otherUserTyping
        }
        onBack={onBack}
      />

      <MessageList
        messages={messages}
        otherUserId={
          conversation
            .otherUser.userId
        }
        loading={
          loadingMessages
        }
      />

      <MessageComposer
        conversationId={
          conversation.id
        }
        sending={sending}
        uploadingImage={
          uploadingImage
        }
        onSend={onSend}
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

