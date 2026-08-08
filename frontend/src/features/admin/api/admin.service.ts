import api from "@/lib/api";

import type {
  AdminDashboardData,
} from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const adminService = {
  async getDashboard():
    Promise<AdminDashboardData> {

    const response = await api.get<
      ApiEnvelope<AdminDashboardData>
    >("/admin/dashboard");

    return response.data.data;
  },
};
