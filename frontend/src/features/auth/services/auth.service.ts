import api from "@/lib/api";

import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  StoredAuthUser,
} from "@/lib/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthUser extends StoredAuthUser {
  id?: string;
  fullName?: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;

  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;

  user?: AuthUser;

  id?: string;
  fullName?: string;
  email?: string;
  role?: string;

  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    user?: AuthUser;

    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser | null;
  message?: string;
}

function extractAccessToken(
  response: AuthResponse
): string | null {
  return (
    response.accessToken ??
    response.data?.accessToken ??
    null
  );
}

function extractUser(
  response: AuthResponse
): AuthUser | null {
  if (response.user) {
    return response.user;
  }

  if (response.data?.user) {
    return response.data.user;
  }

  const email =
    response.email ??
    response.data?.email;

  if (!email) {
    return null;
  }

  return {
    id:
      response.id ??
      response.data?.id,
    fullName:
      response.fullName ??
      response.data?.fullName,
    email,
    role:
      response.role ??
      response.data?.role,
  };
}

function saveSession(
  response: AuthResponse
): AuthSession {
  const accessToken = extractAccessToken(response);

  if (!accessToken) {
    throw new Error(
      response.message ??
        "Access token was not returned."
    );
  }

  const user = extractUser(response);

  setToken(accessToken);

  if (user) {
    setStoredUser(user);
  }

  return {
    accessToken,
    user,
    message: response.message,
  };
}

export const authService = {
  async register(
    data: RegisterRequest
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      data
    );

    return response.data;
  },

  async login(
    data: LoginRequest
  ): Promise<AuthSession> {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      data
    );

    return saveSession(response.data);
  },

  async refresh(): Promise<AuthSession> {
    const response = await api.post<AuthResponse>(
      "/auth/refresh",
      {}
    );

    return saveSession(response.data);
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout", {});
    } catch {
      /*
       * The local session must still be cleared
       * if the backend logout request fails.
       */
    } finally {
      clearAuthStorage();
    }
  },

  getToken(): string | null {
    return getToken();
  },

  getUser(): AuthUser | null {
    return getStoredUser();
  },

  isLoggedIn(): boolean {
    return Boolean(getToken());
  },
};

export default authService;