import {
  Conversation,
  ChatMessage,
} from "@/features/chat/types";

import ChatHeader from "./ChatHeader";
import EmptyChatState from "./EmptyChatState";
import MessageComposer from "./MessageComposer";
import MessageList from "./MessageList";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  sending: boolean;
  onBack: () => void;
  onSend: (
    content: string
  ) => Promise<void>;
}

export default function ChatWindow({
  conversation,
  messages,
  loadingMessages,
  sending,
  onBack,
  onSend,
}: ChatWindowProps) {
  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
      />

      <MessageList
        messages={messages}
        otherUserId={
          conversation.otherUser.userId
        }
        loading={loadingMessages}
      />

      <MessageComposer
        sending={sending}
        onSend={onSend}
      />
    </section>
  );
}