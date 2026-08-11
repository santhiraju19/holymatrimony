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

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      !isAuthenticated ||
      !token
    ) {
      presenceWebSocketService
        .disconnect();

      return;
    }

    presenceWebSocketService
      .connect();

    return () => {
      presenceWebSocketService
        .disconnect();
    };
  }, [
    loading,
    isAuthenticated,
    token,
  ]);

  return null;
}