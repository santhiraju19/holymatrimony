"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      // TODO: Replace with API call
      console.log("LOGIN", data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterRequest) {
    setLoading(true);

    try {
      // TODO: Replace with API call
      console.log("REGISTER", data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    // TODO: Clear token/session
    router.push("/login");
  }

  return {
    loading,
    login,
    register,
    logout,
  };
}