"use client";

import {
  useNotificationContext,
} from "@/features/notifications/context/NotificationContext";

export default function useNotifications() {
  return useNotificationContext();
}
