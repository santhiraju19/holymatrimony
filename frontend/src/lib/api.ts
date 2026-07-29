import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuthStorage,
  getToken,
} from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig => {
    const token = getToken();

    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      config.headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";

    const isAuthenticationRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (
      status === 401 &&
      !isAuthenticationRequest &&
      typeof window !== "undefined"
    ) {
      clearAuthStorage();

      const currentPath =
        window.location.pathname +
        window.location.search;

      if (!window.location.pathname.startsWith("/login")) {
        const redirect = encodeURIComponent(currentPath);

        window.location.href =
          `/login?redirect=${redirect}`;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : fallback;
  }

  const responseData = error.response?.data as
    | {
        message?: string;
        error?: string;
      }
    | undefined;

  return (
    responseData?.message ??
    responseData?.error ??
    error.message ??
    fallback
  );
}

export default api;