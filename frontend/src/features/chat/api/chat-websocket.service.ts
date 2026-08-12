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
  getToken,
} from "@/lib/auth";


export type WebSocketConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";


export interface ChatTypingEvent {
  conversationId: string;
  typing: boolean;
}


export interface ChatPresenceEvent {
  userId: string;
  online: boolean;
  lastSeenAt: string | null;
}


export interface DeliveryReceiptEvent {
  messageId: string;
}


interface ConnectOptions {
  onMessage: (
    message: ChatMessage
  ) => void;

  onTyping?: (
    event: ChatTypingEvent
  ) => void;

  onPresence?: (
    event: ChatPresenceEvent
  ) => void;

  onStatusChange?: (
    status: WebSocketConnectionStatus
  ) => void;

  onError?: (
    message: string
  ) => void;
}


const SEND_MESSAGE_DESTINATION =
  "/app/chat.send";

const SEND_TYPING_DESTINATION =
  "/app/chat.typing";

const SEND_DELIVERED_DESTINATION =
  "/app/chat.delivered";

const MESSAGE_QUEUE =
  "/user/queue/messages";

const TYPING_QUEUE =
  "/user/queue/typing";

const PRESENCE_QUEUE =
  "/user/queue/presence";

const ERROR_QUEUE =
  "/user/queue/errors";


function getWebSocketUrl(): string {
  const configuredUrl =
    process.env
      .NEXT_PUBLIC_WS_URL
      ?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (
    typeof window !==
    "undefined"
  ) {
    const protocol =
      window.location
        .protocol ===
      "https:"
        ? "wss"
        : "ws";

    return `${protocol}://${window.location.host}/ws`;
  }

  return "ws://localhost:8080/ws";
}


class ChatWebSocketService {
  private client:
    Client | null =
    null;

  private messageSubscription:
    StompSubscription | null =
    null;

  private typingSubscription:
    StompSubscription | null =
    null;

  private presenceSubscription:
    StompSubscription | null =
    null;

  private errorSubscription:
    StompSubscription | null =
    null;

  private status:
    WebSocketConnectionStatus =
    "disconnected";


  /*
   * ============================================================
   * CONNECTION STATUS
   * ============================================================
   */

  private setStatus(
    status:
      WebSocketConnectionStatus,

    callback?:
      (
        status:
          WebSocketConnectionStatus
      ) => void
  ): void {
    this.status =
      status;

    callback?.(
      status
    );
  }


  getStatus():
    WebSocketConnectionStatus {
    return this.status;
  }


  isConnected():
    boolean {
    return Boolean(
      this.client
        ?.connected
    );
  }


  /*
   * ============================================================
   * CONNECT
   * ============================================================
   */

  connect(
    options:
      ConnectOptions
  ): void {
    if (
      this.client
        ?.active
    ) {
      return;
    }

    const token =
      getToken();

    if (!token) {
      this.setStatus(
        "error",
        options.onStatusChange
      );

      options.onError?.(
        "Authentication token is unavailable."
      );

      return;
    }

    this.setStatus(
      "connecting",
      options.onStatusChange
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
          3000,

        heartbeatIncoming:
          10000,

        heartbeatOutgoing:
          10000,

        debug:
          process.env
            .NODE_ENV ===
          "development"
            ? (
                message
              ) => {
                console.debug(
                  "[Chat STOMP]",
                  message
                );
              }
            : undefined,
      });

    client.onConnect =
      () => {
        this.client =
          client;

        this.setStatus(
          "connected",
          options
            .onStatusChange
        );

        this.subscribeToMessages(
          options
            .onMessage
        );

        this.subscribeToTyping(
          options
            .onTyping
        );

        this.subscribeToPresence(
          options
            .onPresence
        );

        this.subscribeToErrors(
          options
            .onError
        );
      };


    client.onStompError =
      (
        frame
      ) => {
        this.setStatus(
          "error",
          options
            .onStatusChange
        );

        options.onError?.(
          frame.headers[
            "message"
          ] ||
            "Chat WebSocket error."
        );
      };


    client.onWebSocketError =
      () => {
        this.setStatus(
          "error",
          options
            .onStatusChange
        );

        options.onError?.(
          "Unable to connect to chat."
        );
      };


 client.onWebSocketClose =
  (event) => {
    console.warn(
      "[Chat WebSocket] CLOSED",
      {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        url: getWebSocketUrl(),
      }
    );

    this.setStatus(
      "disconnected",
      options.onStatusChange
    );
  };


    this.client =
      client;

    client.activate();
  }


  /*
   * ============================================================
   * SUBSCRIPTIONS
   * ============================================================
   */

  private subscribeToMessages(
    callback:
      (
        message:
          ChatMessage
      ) => void
  ): void {
    if (
      !this.client
        ?.connected
    ) {
      return;
    }

    this.messageSubscription
      ?.unsubscribe();

    this.messageSubscription =
      this.client.subscribe(
        MESSAGE_QUEUE,
        (
          frame
        ) => {
          const message =
            this.parseJson<
              ChatMessage
            >(
              frame
            );

          if (
            message
          ) {
            callback(
              message
            );
          }
        }
      );
  }


  private subscribeToTyping(
    callback?:
      (
        event:
          ChatTypingEvent
      ) => void
  ): void {
    if (
      !callback ||
      !this.client
        ?.connected
    ) {
      return;
    }

    this.typingSubscription
      ?.unsubscribe();

    this.typingSubscription =
      this.client.subscribe(
        TYPING_QUEUE,
        (
          frame
        ) => {
          const event =
            this.parseJson<
              ChatTypingEvent
            >(
              frame
            );

          if (
            event
          ) {
            callback(
              event
            );
          }
        }
      );
  }


  private subscribeToPresence(
    callback?:
      (
        event:
          ChatPresenceEvent
      ) => void
  ): void {
    if (
      !callback ||
      !this.client
        ?.connected
    ) {
      return;
    }

    this.presenceSubscription
      ?.unsubscribe();

    this.presenceSubscription =
      this.client.subscribe(
        PRESENCE_QUEUE,
        (
          frame
        ) => {
          const event =
            this.parseJson<
              ChatPresenceEvent
            >(
              frame
            );

          if (
            event
          ) {
            callback(
              event
            );
          }
        }
      );
  }


  private subscribeToErrors(
    callback?:
      (
        message:
          string
      ) => void
  ): void {
    if (
      !callback ||
      !this.client
        ?.connected
    ) {
      return;
    }

    this.errorSubscription
      ?.unsubscribe();

    this.errorSubscription =
      this.client.subscribe(
        ERROR_QUEUE,
        (
          frame
        ) => {
          const payload =
            this.parseJson<{
              success?: boolean;
              message?: string;
            }>(
              frame
            );

          callback(
            payload
              ?.message ||
              "Chat request failed."
          );
        }
      );
  }


  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  sendMessage(
    request:
      SendMessageRequest
  ): boolean {
    if (
      !this.client
        ?.connected
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

      body:
        JSON.stringify({
          receiverUserId:
            request
              .receiverUserId,

          content:
            request
              .content ??
            null,

          mediaUrl:
            request
              .mediaUrl ??
            null,

          messageType:
            request
              .messageType ??
            "TEXT",

          /*
           * Reply-to-message support.
           */
          replyToMessageId:
            request
              .replyToMessageId ??
            null,
        }),
    });

    return true;
  }


  /*
   * ============================================================
   * DELIVERED RECEIPT
   * ============================================================
   */

  sendDelivered(
    event:
      DeliveryReceiptEvent
  ): boolean {
    if (
      !this.client
        ?.connected
    ) {
      return false;
    }

    if (
      !event.messageId
    ) {
      return false;
    }

    this.client.publish({
      destination:
        SEND_DELIVERED_DESTINATION,

      headers: {
        "content-type":
          "application/json",
      },

      body:
        JSON.stringify({
          messageId:
            event
              .messageId,
        }),
    });

    return true;
  }


  /*
   * ============================================================
   * TYPING
   * ============================================================
   */

  sendTyping(
    event: {
      conversationId:
        string;

      receiverUserId:
        string;

      typing:
        boolean;
    }
  ): boolean {
    if (
      !this.client
        ?.connected
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
        JSON.stringify({
          conversationId:
            event
              .conversationId,

          receiverUserId:
            event
              .receiverUserId,

          typing:
            event
              .typing,
        }),
    });

    return true;
  }


  /*
   * ============================================================
   * JSON PARSING
   * ============================================================
   */

  private parseJson<T>(
    frame:
      IMessage
  ): T | null {
    try {
      return JSON.parse(
        frame.body
      ) as T;

    } catch (
      error
    ) {
      console.error(
        "[Chat WebSocket] Invalid JSON payload",
        error
      );

      return null;
    }
  }


  /*
   * ============================================================
   * DISCONNECT
   * ============================================================
   */

  disconnect(): void {
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

    const client =
      this.client;

    this.client =
      null;

    if (client) {
      void client.deactivate();
    }

    this.status =
      "disconnected";
  }
}


const chatWebSocketService =
  new ChatWebSocketService();

export default chatWebSocketService;