import api from "@/lib/api";

export interface ProfileBoostStatus {
  eligible: boolean;
  active: boolean;
  startedAt?: string | null;
  expiresAt?: string | null;
  remainingMinutes: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const profileBoostService = {
  async getStatus(): Promise<ProfileBoostStatus> {
    const response =
      await api.get<ApiResponse<ProfileBoostStatus>>(
        "/profile/boost"
      );

    return response.data.data;
  },

  async activate(): Promise<ProfileBoostStatus> {
    const response =
      await api.post<ApiResponse<ProfileBoostStatus>>(
        "/profile/boost"
      );

    return response.data.data;
  },
};

export default profileBoostService;
