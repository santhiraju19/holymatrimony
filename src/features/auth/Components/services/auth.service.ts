import api from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export async function login(data: LoginRequest) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function register(data: RegisterRequest) {
  const response = await api.post("/auth/register", data);
  return response.data;
}
