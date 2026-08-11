"use client";

import { Client } from "@stomp/stompjs";

import { getToken } from "@/lib/auth";

const RECONNECT_DELAY = 5000;

function getWebSocketUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_WS_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim();

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

class PresenceWebSocketService {
  private client: Client | null = null;

  connect(): void {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    if (
      this.client?.active ||
      this.client?.connected
    ) {
      return;
    }

    const token = getToken();

    if (!token) {
      return;
    }

    const client = new Client({
      brokerURL: getWebSocketUrl(),

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
                "[Presence STOMP]",
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
      };

    client.onConnect = () => {
      console.debug(
        "[Presence] WebSocket connected"
      );
    };

    client.onWebSocketClose = () => {
      console.debug(
        "[Presence] WebSocket disconnected"
      );
    };

    client.onStompError = (
      frame
    ) => {
      console.warn(
        "[Presence] STOMP error:",
        frame.headers.message ??
          frame.body
      );
    };

    client.onWebSocketError = (
      error
    ) => {
      console.warn(
        "[Presence] WebSocket error:",
        error
      );
    };

    this.client = client;

    client.activate();
  }

  disconnect(): void {
    const client =
      this.client;

    this.client = null;

    if (client?.active) {
      void client.deactivate();
    }
  }

  isConnected(): boolean {
    return Boolean(
      this.client?.connected
    );
  }
}

const presenceWebSocketService =
  new PresenceWebSocketService();

export default presenceWebSocketService;