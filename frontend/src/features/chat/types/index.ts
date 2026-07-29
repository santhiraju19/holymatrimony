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
  | "FILE"
  | string;

export type MessageStatus =
  | "SENT"
  | "DELIVERED"
  | "READ"
  | string;

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  readAt?: string | null;
  createdAt: string;
}

export interface MessagesPage
  extends PaginationData {
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  receiverUserId: string;
  content: string;
  messageType?: "TEXT";
}

export interface UnreadCountData {
  unreadCount: number;
  count?: number;
}