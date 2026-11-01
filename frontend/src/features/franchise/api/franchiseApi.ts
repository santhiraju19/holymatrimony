import type {
  CreateFranchiseLeadRequest,
  FranchiseLead,
  UpdateFranchiseLeadRequest,
} from "@/features/franchise/types/franchiseLead";
import type {
  FranchisePayment,
} from "../types/franchisePayment";

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

export async function getFranchiseLeads(): Promise<
  FranchiseLead[]
> {
  const response =
    await api.get<ApiResponse<FranchiseLead[]>>(
      "/franchise/leads"
    );

  return response.data.data;
}

export async function createFranchiseLead(
  request: CreateFranchiseLeadRequest
): Promise<FranchiseLead> {
  const response =
    await api.post<ApiResponse<FranchiseLead>>(
      "/franchise/leads",
      request
    );

  return response.data.data;
}

export async function updateFranchiseLead(
  leadId: string,
  request: UpdateFranchiseLeadRequest
): Promise<FranchiseLead> {
  const response =
    await api.patch<ApiResponse<FranchiseLead>>(
      `/franchise/leads/${encodeURIComponent(
        leadId
      )}`,
      request
    );

  return response.data.data;
}

export async function getFranchisePayments(): Promise<
  FranchisePayment[]
> {
  const response =
    await api.get<ApiResponse<FranchisePayment[]>>(
      "/franchise/payments"
    );

  return response.data.data;
}
