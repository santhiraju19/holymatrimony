import api from "@/lib/api";

import type {
  ApiResponse,
  FranchiseAccess,
} from "../types/franchiseAccess";

import type {
  FranchiseTerritory,
} from "../types/franchiseTerritory";

export async function getCurrentFranchiseAccess(): Promise<FranchiseAccess> {
  const response =
    await api.get<ApiResponse<FranchiseAccess>>(
      "/franchise/me"
    );

  return response.data.data;
}

export async function getFranchiseTerritories(): Promise<
  FranchiseTerritory[]
> {
  const response =
    await api.get<ApiResponse<FranchiseTerritory[]>>(
      "/franchise/territories"
    );

  return response.data.data;
}
