import api from "@/lib/api";

import type {
  BrowsePaginationParams,
  BrowseProfile,
  BrowseProfilesResult,
  BrowseSearchParams,
} from "../types";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

function unwrapApiResponse<T>(
  response: ApiEnvelope<T> | T
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

function cleanParams<
  T extends Record<string, unknown>
>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ) as Partial<T>;
}

export async function getBrowseProfiles(
  params: BrowsePaginationParams = {}
): Promise<BrowseProfilesResult> {
  const response = await api.get<
    ApiEnvelope<BrowseProfilesResult> | BrowseProfilesResult
  >("/profiles", {
    params: cleanParams({
      page: params.page ?? 0,
      size: params.size ?? 12,
    }),
  });

  return unwrapApiResponse(response.data);
}

export async function searchBrowseProfiles(
  params: BrowseSearchParams
): Promise<BrowseProfilesResult> {
  const response = await api.get<
    ApiEnvelope<BrowseProfilesResult> | BrowseProfilesResult
  >("/profiles/search", {
    params: cleanParams({
      page: params.page ?? 0,
      size: params.size ?? 12,

      ageFrom: params.ageFrom,
      ageTo: params.ageTo,

      gender: params.gender,
      denomination: params.denomination,
      maritalStatus: params.maritalStatus,

      state: params.state,
      city: params.city,

      highestEducation:
        params.highestEducation,

      profession: params.profession,
      baptized: params.baptized,
    }),
  });

  return unwrapApiResponse(response.data);
}

export async function getBrowseProfileById(
  profileId: string
): Promise<BrowseProfile> {
  if (!profileId.trim()) {
    throw new Error("Profile ID is required.");
  }

  const response = await api.get<
    ApiEnvelope<BrowseProfile> | BrowseProfile
  >(`/profiles/${profileId}`);

  return unwrapApiResponse(response.data);
}