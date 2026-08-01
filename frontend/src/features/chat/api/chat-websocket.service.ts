"use client";

import {
  Client,
  IMessage,
  StompSubscription,
} from "@stomp/stompjs";

import {
  ChatMessage,
  SendMessageRequest,
} from "@/features/chat/types";

import {
  PresenceStatus,
} from "@/features/chat/api/presence.service";

import { getToken } from "@/lib/auth";

export type WebSocketConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketErrorMessage {
  success?: boolean;
  message: string;
}

export interface ChatTypingEvent {
  conversationId: string;
  typing: boolean;
}

export interface SendTypingEvent {
  conversationId: string;
  receiverUserId: string;
  typing: boolean;
}

interface ConnectOptions {
  onMessage: (
    message: ChatMessage
  ) => void;

  onTyping?: (
    event: ChatTypingEvent
  ) => void;

  onPresence?: (
    presence: PresenceStatus
  ) => void;

  onError?: (
    message: string
  ) => void;

  onStatusChange?: (
    status: WebSocketConnectionStatus
  ) => void;
}

const MESSAGE_DESTINATION =
  "/user/queue/messages";

const TYPING_DESTINATION =
  "/user/queue/typing";

const PRESENCE_DESTINATION =
  "/topic/presence";

const ERROR_DESTINATION =
  "/user/queue/errors";

const SEND_MESSAGE_DESTINATION =
  "/app/chat.send";

const SEND_TYPING_DESTINATION =
  "/app/chat.typing";

const RECONNECT_DELAY = 5000;

function getWebSocketUrl(): string {
  const configuredUrl =
    process.env
      .NEXT_PUBLIC_WS_URL
      ?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const apiUrl =
    process.env
      .NEXT_PUBLIC_API_URL
      ?.trim();

  if (apiUrl) {
    return apiUrl
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:")
      .replace(
        /\/api\/v1\/?$/,
        "/ws"
      );
  }

  return "ws://localhost:8080/ws";
}

function parseMessage<T>(
  frame: IMessage
): T {
  return JSON.parse(
    frame.body
  ) as T;
}

class ChatWebSocketService {
  private client: Client | null =
    null;

  private messageSubscription:
    | StompSubscription
    | null = null;

  private typingSubscription:
    | StompSubscription
    | null = null;

  private presenceSubscription:
    | StompSubscription
    | null = null;

  private errorSubscription:
    | StompSubscription
    | null = null;

  private options: ConnectOptions | null =
    null;

  connect(
    options: ConnectOptions
  ): void {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    this.options = options;

    if (
      this.client?.active ||
      this.client?.connected
    ) {
      return;
    }

    const token = getToken();

    if (!token) {
      options.onStatusChange?.(
        "disconnected"
      );

      options.onError?.(
        "Authentication token is unavailable."
      );

      return;
    }

    options.onStatusChange?.(
      "connecting"
    );

    const client = new Client({
      brokerURL:
        getWebSocketUrl(),

      connectHeaders: {
        Authorization:
          `Bearer ${token}`,
      },

      reconnectDelay:
        RECONNECT_DELAY,

      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      connectionTimeout: 10000,

      debug:
        process.env.NODE_ENV ===
        "development"
          ? (message: string) => {
              console.debug(
                "[STOMP]",
                message
              );
            }
          : () => {},
    });

    client.beforeConnect =
      async () => {
        const currentToken =
          getToken();

        if (!currentToken) {
          throw new Error(
            "Authentication token is unavailable."
          );
        }

        client.connectHeaders = {
          Authorization:
            `Bearer ${currentToken}`,
        };

        this.options
          ?.onStatusChange?.(
            "connecting"
          );
      };

    client.onConnect = () => {
      this.clearSubscriptions();

      this.messageSubscription =
        client.subscribe(
          MESSAGE_DESTINATION,
          (frame) => {
            try {
              const message =
                parseMessage<ChatMessage>(
                  frame
                );

              this.options
                ?.onMessage(
                  message
                );
            } catch {
              this.options
                ?.onError?.(
                  "Received an invalid chat message."
                );
            }
          }
        );

      this.typingSubscription =
        client.subscribe(
          TYPING_DESTINATION,
          (frame) => {
            try {
              const event =
                parseMessage<ChatTypingEvent>(
                  frame
                );

              this.options
                ?.onTyping?.(
                  event
                );
            } catch {
              this.options
                ?.onError?.(
                  "Received an invalid typing event."
                );
            }
          }
        );

      this.presenceSubscription =
        client.subscribe(
          PRESENCE_DESTINATION,
          (frame) => {
            try {
              const presence =
                parseMessage<PresenceStatus>(
                  frame
                );

              this.options
                ?.onPresence?.(
                  presence
                );
            } catch {
              this.options
                ?.onError?.(
                  "Received an invalid presence event."
                );
            }
          }
        );

      this.errorSubscription =
        client.subscribe(
          ERROR_DESTINATION,
          (frame) => {
            try {
              const error =
                parseMessage<WebSocketErrorMessage>(
                  frame
                );

              this.options
                ?.onError?.(
                  error.message ||
                    "Unable to process the WebSocket request."
                );
            } catch {
              this.options
                ?.onError?.(
                  frame.body ||
                    "A WebSocket error occurred."
                );
            }
          }
        );

      this.options
        ?.onStatusChange?.(
          "connected"
        );
    };

    client.onStompError = (
      frame
    ) => {
      const message =
        frame.headers.message ||
        frame.body ||
        "The chat server rejected the WebSocket request.";

      this.options
        ?.onStatusChange?.(
          "error"
        );

      this.options
        ?.onError?.(
          message
        );
    };

    client.onWebSocketError = () => {
      console.warn(
        "[Chat WebSocket] Connection error. Retrying automatically."
      );

      this.options
        ?.onStatusChange?.(
          "error"
        );
    };

    client.onWebSocketClose = () => {
      this.clearSubscriptions();

      this.options
        ?.onStatusChange?.(
          "disconnected"
        );
    };

    this.client = client;

    client.activate();
  }

  disconnect(): void {
    this.clearSubscriptions();

    const client =
      this.client;

    this.client = null;
    this.options = null;

    if (client?.active) {
      void client.deactivate();
    }
  }

  isConnected(): boolean {
    return Boolean(
      this.client?.connected
    );
  }

  sendMessage(
    request: SendMessageRequest
  ): boolean {
    if (
      !this.client?.connected
    ) {
      return false;
    }

    this.client.publish({
      destination:
        SEND_MESSAGE_DESTINATION,

      headers: {
        "content-type":
          "application/json",
      },

      body: JSON.stringify({
        receiverUserId:
          request.receiverUserId,

        content:
          request.content,

        mediaUrl:
          request.mediaUrl ??
          null,

        messageType:
          request.messageType ??
          "TEXT",
      }),
    });

    return true;
  }

  sendTyping(
    event: SendTypingEvent
  ): boolean {
    if (
      !this.client?.connected
    ) {
      return false;
    }

    this.client.publish({
      destination:
        SEND_TYPING_DESTINATION,

      headers: {
        "content-type":
          "application/json",
      },

      body:
        JSON.stringify(event),
    });

    return true;
  }

  private clearSubscriptions(): void {
    this.messageSubscription
      ?.unsubscribe();

    this.typingSubscription
      ?.unsubscribe();

    this.presenceSubscription
      ?.unsubscribe();

    this.errorSubscription
      ?.unsubscribe();

    this.messageSubscription =
      null;

    this.typingSubscription =
      null;

    this.presenceSubscription =
      null;

    this.errorSubscription =
      null;
  }
}

const chatWebSocketService =
  new ChatWebSocketService();

export default chatWebSocketService;