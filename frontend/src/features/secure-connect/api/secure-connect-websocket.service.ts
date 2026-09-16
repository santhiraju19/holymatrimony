"use client";

import {
  Client,
  IMessage,
  StompSubscription,
} from "@stomp/stompjs";

import authService from "@/features/auth/services/auth.service";

import {
  SecureConnectCallEvent,
  SecureConnectSocketStatus,
} from "../types";

interface ConnectOptions {
  onCallEvent: (
    event: SecureConnectCallEvent
  ) => void;

  onStatusChange?: (
    status: SecureConnectSocketStatus
  ) => void;

  onError?: (
    message: string
  ) => void;
}

const SECURE_CONNECT_QUEUE =
  "/user/queue/secure-connect";

function getWebSocketUrl(): string {
  const configured =
    process.env
      .NEXT_PUBLIC_WS_URL
      ?.trim();

  if (configured) {
    return configured;
  }

  const apiUrl =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.trim();

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

class SecureConnectWebSocketService {
  private client:
    Client | null =
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

  private status:
    SecureConnectSocketStatus =
    "disconnected";

  private setStatus(
    status:
      SecureConnectSocketStatus
  ): void {
    this.status = status;

    this.options
      ?.onStatusChange?.(
        status
      );
  }

  getStatus():
    SecureConnectSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return Boolean(
      this.client?.connected
    );
  }

  connect(
    options: ConnectOptions
  ): void {
    /*
     * Keep the latest React callbacks even if
     * the STOMP connection already exists.
     */
    this.options =
      options;

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    /*
     * If a previous client is still shutting
     * down, wait for it before reconnecting.
     */
    if (
      this.disconnectPromise
    ) {
      void this
        .disconnectPromise
        .then(() => {
          if (this.options) {
            this.connect(
              this.options
            );
          }
        });

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
      this.setStatus(
        "disconnected"
      );

      return;
    }

    this.setStatus(
      "connecting"
    );

    const client =
      new Client({
        brokerURL:
          getWebSocketUrl(),

        connectHeaders: {
          Authorization:
            `Bearer ${token}`,
        },

        reconnectDelay:
          5000,

        heartbeatIncoming:
          10000,

        heartbeatOutgoing:
          10000,

        connectionTimeout:
          10000,

        debug:
          process.env.NODE_ENV ===
          "development"
            ? (
                message:
                  string
              ) => {
                console.debug(
                  "[Secure Connect STOMP]",
                  message
                );
              }
            : () => {},
      });

    /*
     * STOMP automatically reconnects.
     * Always use the newest access token
     * rather than the token captured when
     * this service was first connected.
     */
    client.beforeConnect =
      async () => {
        const currentToken =
          authService
            .getToken();

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

    client.onConnect =
      () => {
        this.setStatus(
          "connected"
        );

        this.subscription
          ?.unsubscribe();

        this.subscription =
          client.subscribe(
            SECURE_CONNECT_QUEUE,
            (
              message:
                IMessage
            ) => {
              this.handleMessage(
                message
              );
            }
          );
      };

    client.onStompError =
      (frame) => {
        this.setStatus(
          "error"
        );

        this.options
          ?.onError?.(
            frame.headers
              .message ||
              frame.body ||
              "Secure Connect signaling error."
          );
      };

    client.onWebSocketError =
      () => {
        this.setStatus(
          "error"
        );

        this.options
          ?.onError?.(
            "Secure Connect WebSocket connection failed."
          );
      };

    client.onWebSocketClose =
      () => {
        /*
         * When automatic reconnect is active,
         * STOMP will reconnect unless the
         * client was intentionally deactivated.
         */
        if (client.active) {
          this.setStatus(
            "connecting"
          );
        } else {
          this.setStatus(
            "disconnected"
          );
        }
      };

    this.client =
      client;

    client.activate();
  }

  private handleMessage(
    message: IMessage
  ): void {
    try {
      const event =
        JSON.parse(
          message.body
        ) as SecureConnectCallEvent;

      if (
        !event ||
        !event.eventType ||
        !event.callId ||
        !event.mediaType ||
        !event.status
      ) {
        throw new Error(
          "Secure Connect event payload is incomplete."
        );
      }

      this.options
        ?.onCallEvent(
          event
        );
    } catch (error) {
      console.error(
        "[Secure Connect] Unable to parse call event.",
        error
      );

      this.options
        ?.onError?.(
          "A Secure Connect call update could not be processed."
        );
    }
  }

  disconnect(): void {
    this.subscription
      ?.unsubscribe();

    this.subscription =
      null;

    /*
     * Clear callbacks first so a deliberate
     * disconnect cannot schedule a reconnect
     * through stale React handlers.
     */
    this.options =
      null;

    const client =
      this.client;

    this.client =
      null;

    this.status =
      "disconnected";

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
        .catch(
          (error) => {
            console.warn(
              "[Secure Connect] WebSocket disconnect error:",
              error
            );

            if (
              this.disconnectPromise ===
              promise
            ) {
              this.disconnectPromise =
                null;
            }
          }
        );

    this.disconnectPromise =
      promise;
  }
}

const secureConnectWebSocketService =
  new SecureConnectWebSocketService();

export default secureConnectWebSocketService;
