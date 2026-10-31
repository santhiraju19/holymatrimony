import api from "@/lib/api";

import type {
  ApiResponse,
  FranchiseAccess,
} from "../types/franchiseAccess";

export async function getCurrentFranchiseAccess(): Promise<FranchiseAccess> {
  const response =
    await api.get<ApiResponse<FranchiseAccess>>(
      "/franchise/me"
    );

  return response.data.data;
}
