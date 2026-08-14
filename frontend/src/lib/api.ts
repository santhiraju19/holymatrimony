import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

import {
  clearAuthStorage,
  getToken,
  setToken,
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
    requestUrl.includes("/auth/logout") ||
    requestUrl.includes("/auth/forgot-password") ||
    requestUrl.includes("/auth/reset-password") ||
    requestUrl.includes("/auth/verify-email-otp") ||
    requestUrl.includes("/auth/resend-email-otp") ||
    requestUrl.includes("/auth/email-verification-status") ||
requestUrl.includes("/auth/reactivate-account")
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

interface RetryableRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  success?: boolean;

  accessToken?: string;

  data?: {
    accessToken?: string;
  };
}

function extractAccessToken(
  response: RefreshResponse
): string | null {
  return (
    response.accessToken ??
    response.data?.accessToken ??
    null
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,

  headers: {
    Accept: "application/json",
  },

  /*
   * Keep this enabled because your refresh-token
   * flow may rely on the HttpOnly refresh cookie.
   */
  withCredentials: true,
});

/*
 * Separate client specifically for refreshing.
 *
 * This avoids calling the main `api` instance
 * recursively from its own response interceptor.
 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

/*
 * Only one refresh request should run at a time.
 *
 * If several API requests receive 401 together,
 * they all wait for this same Promise.
 */
let refreshPromise:
  Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response =
        await refreshClient.post<RefreshResponse>(
          "/auth/refresh",
          {}
        );

      const accessToken =
        extractAccessToken(
          response.data
        );

      if (!accessToken) {
        throw new Error(
          "Refresh endpoint did not return an access token."
        );
      }

      setToken(accessToken);

      return accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function redirectToLogin(): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const currentPath =
    window.location.pathname +
    window.location.search;

  clearAuthStorage();

  if (
    window.location.pathname.startsWith(
      "/login"
    )
  ) {
    return;
  }

  const redirect =
    encodeURIComponent(
      currentPath
    );

  window.location.href =
    `/login?redirect=${redirect}`;
}

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
     * For FormData, don't set Content-Type manually.
     * The browser needs to generate the multipart
     * boundary automatically.
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
     * Authentication endpoints should never receive
     * an existing access token.
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

    const token =
      getToken();

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

  (
    error: AxiosError
  ) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (
    error: AxiosError
  ) => {
    const status =
      error.response?.status;

    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    if (!originalRequest) {
      return Promise.reject(
        error
      );
    }

    const requestUrl =
      originalRequest.url ?? "";

    const authenticationRequest =
      isAuthenticationRequest(
        requestUrl
      );

    /*
     * Anything other than 401 behaves normally.
     */
    if (status !== 401) {
      return Promise.reject(
        error
      );
    }

    /*
     * Never try refreshing while login/register/
     * refresh/logout itself is failing.
     */
    if (authenticationRequest) {
      return Promise.reject(
        error
      );
    }

    /*
     * Prevent an infinite refresh loop.
     */
    if (originalRequest._retry) {
      redirectToLogin();

      return Promise.reject(
        error
      );
    }

    originalRequest._retry =
      true;

    try {
      const newAccessToken =
        await refreshAccessToken();

      if (!originalRequest.headers) {
        originalRequest.headers =
          new AxiosHeaders();
      }

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${newAccessToken}`
      );

      /*
       * Retry the API request that originally
       * failed with 401.
       */
      return api(
        originalRequest
      );
    } catch (refreshError) {
      redirectToLogin();

      return Promise.reject(
        refreshError
      );
    }
  }
);

export function getApiErrorMessage(
  error: unknown,
  fallback =
    "Something went wrong. Please try again."
): string {
  if (
    !axios.isAxiosError(error)
  ) {
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