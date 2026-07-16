import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    // TODO: Enable when backend is ready
    // return api.post("/auth/login", payload);

    console.log("LOGIN", payload);

    return {
      success: true,
      token: "demo-token",
    };
  },

  async register(payload: RegisterPayload) {
    // TODO: Enable when backend is ready
    // return api.post("/auth/register", payload);

    console.log("REGISTER", payload);

    return {
      success: true,
    };
  },

  async forgotPassword(email: string) {
    // TODO: Enable when backend is ready
    // return api.post("/auth/forgot-password", { email });

    console.log("FORGOT PASSWORD", email);

    return {
      success: true,
    };
  },

  async logout() {
    return true;
  },
};

export default api;