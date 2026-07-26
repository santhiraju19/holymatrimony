import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import {
  getToken,
  removeToken,
  setToken,
} from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

if (typeof window !== "undefined") {
  console.log("API BASE URL:", API_BASE_URL);
  console.log("FRONTEND ORIGIN:", window.location.origin);
}

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;

  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password")
  );
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && !isPublicAuthRequest(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshing = false;

let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(
  error: unknown,
  token?: string
) {
  queue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  queue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized =
      error.response?.status === 401;

    if (
      !isUnauthorized ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization =
              `Bearer ${token}`;

            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    refreshing = true;

    try {
      const response = await axios.post<{
        accessToken?: string;
      }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const accessToken =
        response.data.accessToken;

      if (!accessToken) {
        throw new Error(
          "Refresh endpoint did not return an access token."
        );
      }

      setToken(accessToken);
      processQueue(null, accessToken);

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      removeToken();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export default api;