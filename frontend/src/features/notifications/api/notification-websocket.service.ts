
"use client";

import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

import authService from "@/features/auth/services/auth.service";

import { AppNotification } from "@/features/notifications/types";

export type NotificationSocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

interface ConnectOptions {
  onNotification: (
    notification: AppNotification
  ) => void;

  onStatusChange?: (
    status: NotificationSocketStatus
  ) => void;

  onError?: (
    message: string
  ) => void;
}

function getWebSocketUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_WS_URL?.trim();

  if (configured) {
    return configured;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (apiUrl) {
    try {
      const url = new URL(apiUrl);

      url.protocol =
        url.protocol === "https:"
          ? "wss:"
          : "ws:";

      url.pathname = "/ws";
      url.search = "";
      url.hash = "";

      return url.toString();
    } catch {
      // ignore
    }
  }

  return "ws://localhost:8080/ws";
}

class NotificationWebSocketService {
  private client: Client | null = null;

  private subscription:
    | StompSubscription
    | null = null;

  connect(options: ConnectOptions) {
    if (
      this.client?.active ||
      this.client?.connected
    ) {
      return;
    }

    const token =
      authService.getToken();

    if (!token) {
      options.onStatusChange?.(
        "disconnected"
      );
      return;
    }

    options.onStatusChange?.(
      "connecting"
    );

    const client = new Client({
      brokerURL: getWebSocketUrl(),

      reconnectDelay: 5000,

      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    client.onConnect = () => {
      options.onStatusChange?.(
        "connected"
      );

      this.subscription =
        client.subscribe(
          "/user/queue/notifications",
          (message: IMessage) => {
            try {
              const notification =
                JSON.parse(
                  message.body
                ) as AppNotification;

              options.onNotification(
                notification
              );
            } catch (error) {
              console.error(
                "Notification parse error",
                error
              );
            }
          }
        );
    };

    client.onStompError = (
      frame
    ) => {
      options.onStatusChange?.(
        "error"
      );

      options.onError?.(
        frame.headers.message ||
          frame.body
      );
    };

    client.onWebSocketClose = () => {
      options.onStatusChange?.(
        "disconnected"
      );
    };

    client.onWebSocketError = () => {
      options.onStatusChange?.(
        "error"
      );
    };

    this.client = client;

    client.activate();
  }

  disconnect() {
    this.subscription?.unsubscribe();

    this.subscription = null;

    if (this.client?.active) {
      void this.client.deactivate();
    }

    this.client = null;
  }
}

const notificationWebSocketService =
  new NotificationWebSocketService();

export default notificationWebSocketService;