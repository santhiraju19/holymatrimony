
export type NotificationType =
  | "NEW_MESSAGE"
  | "INTEREST_RECEIVED"
  | "INTEREST_ACCEPTED"
  | "INTEREST_REJECTED"
  | "PROFILE_VIEWED"
  | "PROFILE_APPROVED"
  | "PROFILE_REJECTED"
  | "MEMBERSHIP_ACTIVATED"
  | "MEMBERSHIP_EXPIRING"
  | "SYSTEM";

export interface AppNotification {
  id: string;

  type: NotificationType;

  title: string;

  message: string;

  referenceId?: string | null;

  actionUrl?: string | null;

  imageUrl?: string | null;

  read: boolean;

  readAt?: string | null;

  createdAt: string;
}

export interface NotificationPageResponse {
  notifications: AppNotification[];

  page: number;

  size: number;

  totalElements: number;

  totalPages: number;

  first: boolean;

  last: boolean;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}