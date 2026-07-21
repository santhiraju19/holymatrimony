"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { authService } from "../services/auth.service";

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export default function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  function logout() {
    authService.logout();
    removeToken();
    router.replace("/login");
  }

  return {
    loading,
    register,
    logout,
  };
}