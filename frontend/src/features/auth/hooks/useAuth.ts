"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  authService,
  LoginRequest,
  RegisterRequest,
} from "@/features/auth/services/auth.service";

import { useAuthContext } from "@/features/auth/context/AuthContext";

export default function useAuth() {
  const router = useRouter();

  const {
    user,
    token,
    loading: sessionLoading,
    isAuthenticated,
    login: saveContextSession,
    logout: clearContextSession,
  } = useAuthContext();

  const [loading, setLoading] = useState(false);

  async function login(
    credentials: LoginRequest,
    redirectTo = "/dashboard"
  ) {
    setLoading(true);

    try {
      const session = await authService.login(credentials);

      if (!session.user) {
        throw new Error(
          "User details were not returned."
        );
      }

      saveContextSession(
        session.user,
        session.accessToken
      );

      /*
       * authService.login() has already persisted the access token
       * and user. A full navigation ensures AuthProvider restores that
       * stored session before protected dashboard components execute.
       */
      window.location.replace(redirectTo);

      return session;
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterRequest) {
    setLoading(true);

    try {
      const response = await authService.register(data);

      router.push("/login");

      return response;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);

    try {
      await authService.logout();
    } finally {
      clearContextSession();
      setLoading(false);
      window.location.replace("/login");
    }
  }

  return {
    user,
    token,
    loading: loading || sessionLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
}