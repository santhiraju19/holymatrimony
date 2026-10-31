import api from "@/lib/api";

import type {
  ApiResponse,
  FranchiseAccess,
} from "../types/franchiseAccess";

import type {
  FranchiseTerritory,
  UpdateFranchiseTerritoryRequest,
} from "../types/franchiseTerritory";

import type {
  FranchiseMember,
} from "../types/franchiseMember";

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

export async function updateFranchiseTerritory(
  territoryId: string,
  request: UpdateFranchiseTerritoryRequest
): Promise<FranchiseTerritory> {
  const response =
    await api.patch<ApiResponse<FranchiseTerritory>>(
      `/franchise/territories/${encodeURIComponent(
        territoryId
      )}`,
      request
    );

  return response.data.data;
}

export async function getFranchiseMembers(): Promise<
  FranchiseMember[]
> {
  const response =
    await api.get<ApiResponse<FranchiseMember[]>>(
      "/franchise/members"
    );

  return response.data.data;
}
