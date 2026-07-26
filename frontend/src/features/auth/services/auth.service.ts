import api from "@/lib/api";
import {
  getToken,
  removeToken,
  setToken,
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

export interface AuthUser {
  id?: string;
  fullName?: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthUser;
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

function extractUser(response: AuthResponse): AuthUser | null {
  if (response.user) {
    return response.user;
  }

  if (response.email) {
    return {
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    };
  }

  return null;
}

export const authService = {
  async register(data: RegisterRequest) {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      data
    );

    return response.data;
  },

  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      data
    );

    const result = response.data;

    if (!result.accessToken) {
      throw new Error(
        result.message ?? "Access token was not returned."
      );
    }

    setToken(result.accessToken);

    const user = extractUser(result);

    if (user && typeof window !== "undefined") {
      localStorage.setItem(
        "hm_user",
        JSON.stringify(user)
      );
    }

    return {
      ...result,
      user,
    };
  },

  async refresh() {
    const response = await api.post<AuthResponse>(
      "/auth/refresh",
      {}
    );

    const result = response.data;

    if (!result.accessToken) {
      throw new Error(
        result.message ?? "Unable to refresh session."
      );
    }

    setToken(result.accessToken);

    const user = extractUser(result);

    if (user && typeof window !== "undefined") {
      localStorage.setItem(
        "hm_user",
        JSON.stringify(user)
      );
    }

    return {
      ...result,
      user,
    };
  },

  async logout() {
    try {
      await api.post("/auth/logout", {});
    } finally {
      removeToken();

      if (typeof window !== "undefined") {
        localStorage.removeItem("hm_user");
      }
    }
  },

  getToken() {
    return getToken();
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser =
      localStorage.getItem("hm_user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem("hm_user");
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(getToken());
  },
};

export default authService;