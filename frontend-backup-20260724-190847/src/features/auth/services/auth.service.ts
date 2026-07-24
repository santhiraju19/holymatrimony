import axios from "axios";
import {
  setToken,
  getToken,
  removeToken,
} from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterRequest) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest) {
    const response = await api.post("/auth/login", data);

    /**
     * Expected backend response:
     * {
     *   accessToken: "...",
     *   ...
     * }
     */

    if (response.data?.accessToken) {
      setToken(response.data.accessToken);

      localStorage.setItem(
        "hm_user",
        JSON.stringify(response.data)
      );
    }

    return response.data;
  },

  logout() {
    removeToken();
    localStorage.removeItem("hm_user");
  },

  getToken() {
    return getToken();
  },

  getUser() {
    if (typeof window === "undefined") {
      return null;
    }

    const user = localStorage.getItem("hm_user");

    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!getToken();
  },
};

export default authService;