import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
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
  mobile: string;
  password: string;
}

export const authService = {

  async register(data: RegisterRequest) {

    const response = await api.post("/auth/register", data);

    return response.data;
  },

  async login(data: LoginRequest) {

    const response = await api.post("/auth/login", data);

    localStorage.setItem(
      "hm_token",
      response.data.accessToken
    );

    localStorage.setItem(
      "hm_user",
      JSON.stringify(response.data)
    );

    return response.data;
  },

  logout() {

    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");

  },

  getToken() {

    return localStorage.getItem("hm_token");

  },

  isLoggedIn() {

    return !!localStorage.getItem("hm_token");

  }

};

export default api;