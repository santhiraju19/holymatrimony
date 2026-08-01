import api from "@/lib/api";

import {
  AppNotification,
  NotificationPageResponse,
  UnreadNotificationCountResponse,
} from "@/features/notifications/types";

export interface NotificationQuery {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}

const notificationService = {
  async getNotifications(
    query: NotificationQuery = {}
  ): Promise<NotificationPageResponse> {
    const response =
      await api.get<NotificationPageResponse>(
        "/notifications",
        {
          params: {
            page: query.page ?? 0,
            size: query.size ?? 20,
            unreadOnly:
              query.unreadOnly ?? false,
          },
        }
      );

    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response =
      await api.get<UnreadNotificationCountResponse>(
        "/notifications/unread-count"
      );

    return response.data.unreadCount;
  },

  async markAsRead(
    notificationId: string
  ): Promise<AppNotification> {
    const response =
      await api.patch<AppNotification>(
        `/notifications/${notificationId}/read`
      );

    return response.data;
  },

  async markAllAsRead(): Promise<number> {
    const response = await api.patch<{
      message?: string;
      updatedCount: number;
    }>("/notifications/read-all");

    return response.data.updatedCount;
  },

  async deleteNotification(
    notificationId: string
  ): Promise<void> {
    await api.delete(
      `/notifications/${notificationId}`
    );
  },
};

export default notificationService;