"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { setToken, removeToken } from "@/lib/auth";
import { authService } from "./services/auth.service";

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export default function useAuth() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function login(data: LoginRequest) {
    setLoading(true);

    try {
      const response = await authService.login(data);

      if (response.success) {
        setToken(response.token);
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterRequest) {
    setLoading(true);

    try {
      const response = await authService.register(data);

      if (response.success) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    removeToken();
    router.push("/login");
  }

  return {
    loading,
    login,
    register,
    logout,
  };
}