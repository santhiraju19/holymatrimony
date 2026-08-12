export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationData {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ConversationUser {
  userId: string;
  profileId: string;
  fullName: string;

  gender?: string;
  age?: number;
  denomination?: string;
  profession?: string;
  city?: string;
  state?: string;
  country?: string;
  photoUrl?: string;
}

export interface Conversation {
  id: string;

  otherUser: ConversationUser;

  lastMessage: string | null;
  lastMessageSenderId: string | null;
  lastMessageAt: string | null;

  unreadCount: number;

  active: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ConversationsPage
  extends PaginationData {
  conversations: Conversation[];
}

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "VOICE_NOTE"
  | "FILE"
  | "LOCATION"
  | "SYSTEM";

export type MessageStatus =
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "PENDING"
  | "SENDING"
  | "FAILED";

export interface ChatMessage {
  id: string;

  conversationId: string;

  senderId: string;

  receiverId: string;

  content: string | null;

  mediaUrl?: string | null;

  messageType:
    | MessageType
    | string;

  status:
    | MessageStatus
    | string;

  createdAt: string;

  updatedAt?: string | null;

  readAt?: string | null;

  deliveredAt?: string | null;

  editedAt?: string | null;

  deletedForEveryone?: boolean;

  deletedAt?: string | null;

  /*
   * ============================================================
   * REPLY TO MESSAGE
   * ============================================================
   */

  replyToMessageId?: string | null;

  replyToSenderId?: string | null;

  replyToContent?: string | null;

  replyToMediaUrl?: string | null;

  replyToMessageType?:
    | MessageType
    | string
    | null;

  replyToDeletedForEveryone?: boolean | null;
}

export interface MessagesPage
  extends PaginationData {
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  receiverUserId: string;

  content?: string | null;

  mediaUrl?: string | null;

  messageType?: MessageType;

  replyToMessageId?: string | null;
}

export interface ChatMediaUploadResponse {
  originalFileName: string;

  storedFileName: string;

  mediaUrl: string;

  contentType: string;

  fileSize: number;

  messageType: "IMAGE";
}

export interface UnreadCountData {
  unreadCount: number;

  count?: number;
}