"use client";

import {
  Client,
  IMessage,
  StompSubscription,
} from "@stomp/stompjs";

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
      const url =
        new URL(apiUrl);

      url.protocol =
        url.protocol === "https:"
          ? "wss:"
          : "ws:";

      url.pathname = "/ws";
      url.search = "";
      url.hash = "";

      return url.toString();
    } catch {
      // Fall through to local default.
    }
  }

  return "ws://localhost:8080/ws";
}

class NotificationWebSocketService {
  private client: Client | null =
    null;

  private subscription:
    StompSubscription | null =
      null;

  private options:
    ConnectOptions | null =
      null;

  private disconnectPromise:
    Promise<void> | null =
      null;

  connect(
    options: ConnectOptions
  ): void {
    /*
     * Always retain the newest callbacks.
     *
     * This lets React update handlers without
     * requiring the STOMP connection to restart.
     */
    this.options =
      options;

    if (this.disconnectPromise) {
      void this.disconnectPromise.then(
        () => {
          if (this.options) {
            this.connect(
              this.options
            );
          }
        }
      );

      return;
    }

    if (
      this.client?.active ||
      this.client?.connected
    ) {
      return;
    }

    const token =
      authService.getToken();

    if (!token) {
      this.options
        ?.onStatusChange?.(
          "disconnected"
        );

      return;
    }

    this.options
      ?.onStatusChange?.(
        "connecting"
      );

    const client =
      new Client({
        brokerURL:
          getWebSocketUrl(),

        reconnectDelay:
          5000,

        heartbeatIncoming:
          10000,

        heartbeatOutgoing:
          10000,

        connectionTimeout:
          10000,

        connectHeaders: {
          Authorization:
            `Bearer ${token}`,
        },
      });

    /*
     * Always use the newest access token when
     * STOMP reconnects automatically.
     */
    client.beforeConnect =
      async () => {
        const currentToken =
          authService.getToken();

        if (!currentToken) {
          throw new Error(
            "Authentication token is unavailable."
          );
        }

        client.connectHeaders = {
          Authorization:
            `Bearer ${currentToken}`,
        };
      };

    client.onConnect = () => {
      this.options
        ?.onStatusChange?.(
          "connected"
        );

      this.subscription
        ?.unsubscribe();

      this.subscription =
        client.subscribe(
          "/user/queue/notifications",
          (
            message: IMessage
          ) => {
            try {
              const notification =
                JSON.parse(
                  message.body
                ) as AppNotification;

              this.options
                ?.onNotification(
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
      this.options
        ?.onStatusChange?.(
          "error"
        );

      this.options
        ?.onError?.(
          frame.headers.message ||
            frame.body
        );
    };

    client.onWebSocketClose =
      () => {
        this.options
          ?.onStatusChange?.(
            "disconnected"
          );
      };

    client.onWebSocketError =
      () => {
        this.options
          ?.onStatusChange?.(
            "error"
          );
      };

    this.client = client;

    client.activate();
  }

  disconnect(): void {
    this.subscription
      ?.unsubscribe();

    this.subscription =
      null;

    const client =
      this.client;

    this.client =
      null;

    if (!client?.active) {
      return;
    }

    const promise =
      client
        .deactivate()
        .then(() => {
          if (
            this.disconnectPromise ===
            promise
          ) {
            this.disconnectPromise =
              null;
          }
        })
        .catch((error) => {
          console.warn(
            "[Notification WebSocket] disconnect error:",
            error
          );

          if (
            this.disconnectPromise ===
            promise
          ) {
            this.disconnectPromise =
              null;
          }
        });

    this.disconnectPromise =
      promise;
  }
}

const notificationWebSocketService =
  new NotificationWebSocketService();

export default notificationWebSocketService;