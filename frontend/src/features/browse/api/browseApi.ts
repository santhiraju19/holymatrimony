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
    return (
      response as ApiEnvelope<T>
    ).data;
  }

  return response as T;
}

function cleanParams<
  T extends Record<string, unknown>
>(
  params: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(
      params
    ).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ) as Partial<T>;
}

/*
 * ============================================================
 * Browse Profiles
 * ============================================================
 *
 * Normal browse does not invoke Advanced Search entitlement.
 */

export async function getBrowseProfiles(
  params: BrowsePaginationParams = {}
): Promise<BrowseProfilesResult> {
  const response =
    await api.get<
      | ApiEnvelope<BrowseProfilesResult>
      | BrowseProfilesResult
    >(
      "/profiles",
      {
        params: cleanParams({
          page:
            params.page ?? 0,

          size:
            params.size ?? 12,
        }),
      }
    );

  return unwrapApiResponse(
    response.data
  );
}

/*
 * ============================================================
 * Advanced Search
 * ============================================================
 */

export async function searchBrowseProfiles(
  params: BrowseSearchParams
): Promise<BrowseProfilesResult> {
  const response =
    await api.get<
      | ApiEnvelope<BrowseProfilesResult>
      | BrowseProfilesResult
    >(
      "/profiles/search",
      {
        params: cleanParams({
          /*
           * Pagination
           */
          page:
            params.page ?? 0,

          size:
            params.size ?? 12,

          /*
           * Match Basics
           */
          ageFrom:
            params.ageFrom,

          ageTo:
            params.ageTo,

          heightFrom:
            params.heightFrom,

          heightTo:
            params.heightTo,

          gender:
            params.gender,

          maritalStatus:
            params.maritalStatus,

          /*
           * Faith & Background
           */
          religion:
            params.religion,

          denomination:
            params.denomination,

          community:
            params.community,

          motherTongue:
            params.motherTongue,

          baptized:
            params.baptized,

          /*
           * Education & Career
           */
          highestEducation:
            params.highestEducation,

          profession:
            params.profession,

          /*
           * Location
           */
          country:
            params.country,

          state:
            params.state,

          district:
            params.district,

          city:
            params.city,

          /*
           * Lifestyle
           */
          diet:
            params.diet,

          smoking:
            params.smoking,

          drinking:
            params.drinking,

          /*
           * Trust Verification
           */
          aadhaarVerified:
            params.aadhaarVerified,

          idVerified:
            params.idVerified,

          churchVerified:
            params.churchVerified,

          /*
           * Result Ordering
           */
          sort:
            params.sort,
        }),
      }
    );

  return unwrapApiResponse(
    response.data
  );
}

/*
 * ============================================================
 * Single Public Profile
 * ============================================================
 */

export async function getBrowseProfileById(
  profileId: string
): Promise<BrowseProfile> {
  if (
    !profileId.trim()
  ) {
    throw new Error(
      "Profile ID is required."
    );
  }

  const response =
    await api.get<
      | ApiEnvelope<BrowseProfile>
      | BrowseProfile
    >(
      `/profiles/${profileId}`
    );

  return unwrapApiResponse(
    response.data
  );
}