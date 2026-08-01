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
  "http://localhost:8080/api/v1";

function isAuthenticationRequest(
  requestUrl: string
): boolean {
  return (
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/register") ||
    requestUrl.includes("/auth/refresh") ||
    requestUrl.includes("/auth/forgot-password") ||
    requestUrl.includes("/auth/reset-password")
  );
}

function isFormDataRequest(
  data: unknown
): data is FormData {
  return (
    typeof FormData !== "undefined" &&
    data instanceof FormData
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,

  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig => {
    const requestUrl =
      config.url ?? "";

    if (!config.headers) {
      config.headers =
        new AxiosHeaders();
    }

    /*
     * For FormData, do not manually set
     * Content-Type. The browser must add:
     *
     * multipart/form-data; boundary=...
     */
    if (
      isFormDataRequest(
        config.data
      )
    ) {
      config.headers.delete(
        "Content-Type"
      );
    } else {
      config.headers.set(
        "Content-Type",
        "application/json"
      );
    }

    /*
     * Never send an existing access token
     * with login, registration, refresh, or
     * password-recovery requests.
     */
    if (
      isAuthenticationRequest(
        requestUrl
      )
    ) {
      config.headers.delete(
        "Authorization"
      );

      return config;
    }

    const token = getToken();

    if (token) {
      config.headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    } else {
      config.headers.delete(
        "Authorization"
      );
    }

    return config;
  },

  (error: AxiosError) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url ?? "";

    const authenticationRequest =
      isAuthenticationRequest(
        requestUrl
      );

    if (
      status === 401 &&
      !authenticationRequest &&
      typeof window !==
        "undefined"
    ) {
      clearAuthStorage();

      const currentPath =
        window.location.pathname +
        window.location.search;

      if (
        !window.location.pathname.startsWith(
          "/login"
        )
      ) {
        const redirect =
          encodeURIComponent(
            currentPath
          );

        window.location.href =
          `/login?redirect=${redirect}`;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(
  error: unknown,
  fallback =
    "Something went wrong. Please try again."
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : fallback;
  }

  const responseData =
    error.response?.data as
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