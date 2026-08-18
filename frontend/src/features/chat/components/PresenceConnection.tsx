"use client";

import { useEffect } from "react";

import { useAuthContext } from "@/features/auth/context/AuthContext";

import presenceWebSocketService from "@/features/chat/api/presence-websocket.service";

export default function PresenceConnection() {
  const {
    loading,
    isAuthenticated,
    token,
  } = useAuthContext();

  /*
   * Depend only on whether a token exists,
   * not on the token value itself.
   *
   * Access-token refreshes should NOT tear down
   * and recreate the WebSocket connection.
   *
   * presenceWebSocketService.beforeConnect()
   * already reads the latest token whenever a
   * STOMP reconnect occurs.
   */
  const hasToken =
    Boolean(token);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      !isAuthenticated ||
      !hasToken
    ) {
      presenceWebSocketService.disconnect();

      return;
    }

    presenceWebSocketService.connect();

    return () => {
      presenceWebSocketService.disconnect();
    };
  }, [
    loading,
    isAuthenticated,
    hasToken,
  ]);

  return null;
}