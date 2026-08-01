
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import notificationService from "@/features/notifications/api/notification.service";

import notificationWebSocketService, {
  NotificationSocketStatus,
} from "@/features/notifications/api/notification-websocket.service";

import {
  AppNotification,
} from "@/features/notifications/types";

import {
  getApiErrorMessage,
} from "@/lib/api";

const FALLBACK_POLLING_INTERVAL =
  15000;

const NOTIFICATION_PAGE_SIZE = 30;

function sortNotifications(
  notifications: AppNotification[]
): AppNotification[] {
  return [...notifications].sort(
    (first, second) => {
      const firstTime =
        new Date(
          first.createdAt
        ).getTime();

      const secondTime =
        new Date(
          second.createdAt
        ).getTime();

      return secondTime - firstTime;
    }
  );
}

function mergeNotification(
  current: AppNotification[],
  incoming: AppNotification
): AppNotification[] {
  const withoutDuplicate =
    current.filter(
      (notification) =>
        notification.id !== incoming.id
    );

  return sortNotifications([
    incoming,
    ...withoutDuplicate,
  ]).slice(
    0,
    NOTIFICATION_PAGE_SIZE
  );
}

export default function useNotifications() {
  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    socketStatus,
    setSocketStatus,
  ] =
    useState<NotificationSocketStatus>(
      "disconnected"
    );

  const loadNotifications =
    useCallback(
      async (
        silent = false
      ) => {
        if (!silent) {
          setLoading(true);
        }

        try {
          const [
            notificationPage,
            currentUnreadCount,
          ] =
            await Promise.all([
              notificationService
                .getNotifications({
                  page: 0,
                  size:
                    NOTIFICATION_PAGE_SIZE,
                  unreadOnly: false,
                }),

              notificationService
                .getUnreadCount(),
            ]);

          setNotifications(
            sortNotifications(
              notificationPage
                .notifications
            )
          );

          setUnreadCount(
            currentUnreadCount
          );

          setError(null);
        } catch (
          caughtError: unknown
        ) {
          if (!silent) {
            setError(
              getApiErrorMessage(
                caughtError,
                "Unable to load notifications."
              )
            );
          }
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      []
    );

  const handleRealtimeNotification =
    useCallback(
      (
        notification:
          AppNotification
      ) => {
        setNotifications(
          (current) =>
            mergeNotification(
              current,
              notification
            )
        );

        if (!notification.read) {
          setUnreadCount(
            (current) =>
              current + 1
          );
        }

        setError(null);
      },
      []
    );

  const markAsRead =
    useCallback(
      async (
        notificationId: string
      ) => {
        const existingNotification =
          notifications.find(
            (notification) =>
              notification.id ===
              notificationId
          );

        if (
          !existingNotification ||
          existingNotification.read
        ) {
          return;
        }

        const readAt =
          new Date().toISOString();

        setNotifications(
          (current) =>
            current.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read: true,
                      readAt,
                    }
                  : notification
            )
        );

        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );

        try {
          const updatedNotification =
            await notificationService
              .markAsRead(
                notificationId
              );

          setNotifications(
            (current) =>
              current.map(
                (notification) =>
                  notification.id ===
                  notificationId
                    ? updatedNotification
                    : notification
              )
          );

          setError(null);
        } catch (
          caughtError: unknown
        ) {
          await loadNotifications(
            true
          );

          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to mark notification as read."
            )
          );
        }
      },
      [
        loadNotifications,
        notifications,
      ]
    );

  const markAllAsRead =
    useCallback(
      async () => {
        if (unreadCount === 0) {
          return;
        }

        const readAt =
          new Date().toISOString();

        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                read: true,
                readAt:
                  notification.readAt ??
                  readAt,
              })
            )
        );

        setUnreadCount(0);

        try {
          await notificationService
            .markAllAsRead();

          setError(null);
        } catch (
          caughtError: unknown
        ) {
          await loadNotifications(
            true
          );

          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to mark all notifications as read."
            )
          );
        }
      },
      [
        loadNotifications,
        unreadCount,
      ]
    );

  const removeNotification =
    useCallback(
      async (
        notificationId: string
      ) => {
        const existingNotification =
          notifications.find(
            (notification) =>
              notification.id ===
              notificationId
          );

        setNotifications(
          (current) =>
            current.filter(
              (notification) =>
                notification.id !==
                notificationId
            )
        );

        if (
          existingNotification &&
          !existingNotification.read
        ) {
          setUnreadCount(
            (current) =>
              Math.max(
                0,
                current - 1
              )
          );
        }

        try {
          await notificationService
            .deleteNotification(
              notificationId
            );

          setError(null);
        } catch (
          caughtError: unknown
        ) {
          await loadNotifications(
            true
          );

          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to remove notification."
            )
          );
        }
      },
      [
        loadNotifications,
        notifications,
      ]
    );

  const refresh =
    useCallback(
      async () => {
        await loadNotifications(
          true
        );
      },
      [loadNotifications]
    );

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    notificationWebSocketService
      .connect({
        onNotification:
          handleRealtimeNotification,

        onStatusChange:
          setSocketStatus,

        onError: (
          message
        ) => {
          console.error(
            "[Notification WebSocket]",
            message
          );
        },
      });

    return () => {
      notificationWebSocketService
        .disconnect();
    };
  }, [
    handleRealtimeNotification,
  ]);

  useEffect(() => {
    if (
      socketStatus ===
      "connected"
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          void loadNotifications(
            true
          );
        },
        FALLBACK_POLLING_INTERVAL
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    loadNotifications,
    socketStatus,
  ]);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,

      socketStatus,

      isRealtimeConnected:
        socketStatus ===
        "connected",

      refresh,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      socketStatus,
      refresh,
      markAsRead,
      markAllAsRead,
      removeNotification,
    ]
  );
}