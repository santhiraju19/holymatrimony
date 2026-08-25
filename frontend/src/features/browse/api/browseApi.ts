import api from "@/lib/api";

import type {
  BrowsePaginationParams,
  BrowseProfile,
  BrowseProfilesResult,
  BrowseSearchParams,
} from "../types";

/*
 * ============================================================
 * API envelope
 * ============================================================
 */

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
 * ============================================================
 * Helpers
 * ============================================================
 */

function unwrapApiResponse<T>(
  payload:
    | ApiEnvelope<T>
    | T
): T {
  if (
    payload &&
    typeof payload ===
      "object" &&
    "data" in payload
  ) {
    return (
      payload as ApiEnvelope<T>
    ).data;
  }

  return payload as T;
}

/*
 * Remove empty / undefined values before they
 * become query parameters.
 */

function cleanParams(
  values: Record<
    string,
    unknown
  >
): Record<
  string,
  unknown
> {
  return Object.fromEntries(
    Object.entries(
      values
    ).filter(
      ([
        ,
        value,
      ]) => {
        if (
          value ===
            undefined ||
          value ===
            null
        ) {
          return false;
        }

        if (
          typeof value ===
            "string" &&
          !value.trim()
        ) {
          return false;
        }

        return true;
      }
    )
  );
}

/*
 * ============================================================
 * Browse Profiles
 * ============================================================
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
 *
 * Supports:
 *
 * Legacy single location:
 *
 *   country
 *   state
 *   district
 *   city
 *
 * AND new multi-location searching:
 *
 *   locations[0].country
 *   locations[0].state
 *   locations[0].district
 *   locations[0].city
 *
 *   locations[1].country
 *   ...
 *
 * Backend semantics:
 *
 *   fields inside one location = AND
 *   multiple locations          = OR
 */

export async function searchBrowseProfiles(
  params: BrowseSearchParams
): Promise<BrowseProfilesResult> {

  /*
   * ==========================================================
   * MULTI-LOCATION QUERY PARAMETERS
   * ==========================================================
   *
   * Spring binds:
   *
   * locations[0].country=India
   * locations[0].state=Andhra Pradesh
   * locations[0].district=Guntur
   * locations[0].city=Guntur
   *
   * into:
   *
   * List<SearchLocationRequest> locations
   */

  const locationParams:
    Record<
      string,
      string
    > = {};

  (
    params.locations ??
    []
  ).forEach(
    (
      location,
      index
    ) => {
      const country =
        location.country
          ?.trim();

      const state =
        location.state
          ?.trim();

      const district =
        location.district
          ?.trim();

      const city =
        location.city
          ?.trim();

      /*
       * Ignore a completely empty
       * location entry.
       */

      if (
        !country &&
        !state &&
        !district &&
        !city
      ) {
        return;
      }

      if (country) {
        locationParams[
          `locations[${index}].country`
        ] = country;
      }

      if (state) {
        locationParams[
          `locations[${index}].state`
        ] = state;
      }

      if (district) {
        locationParams[
          `locations[${index}].district`
        ] = district;
      }

      if (city) {
        locationParams[
          `locations[${index}].city`
        ] = city;
      }
    }
  );

  const response =
    await api.get<
      | ApiEnvelope<BrowseProfilesResult>
      | BrowseProfilesResult
    >(
      "/profiles/search",
      {
        params: cleanParams({
          /*
           * ==================================================
           * Pagination
           * ==================================================
           */

          page:
            params.page ?? 0,

          size:
            params.size ?? 12,

          /*
           * ==================================================
           * Match Basics
           * ==================================================
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
           * ==================================================
           * Faith & Background
           * ==================================================
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
           * ==================================================
           * Education & Career
           * ==================================================
           */

          highestEducation:
            params.highestEducation,

          profession:
            params.profession,

          /*
           * ==================================================
           * Multiple Preferred Locations
           * ==================================================
           *
           * These take precedence in ProfileSpecification
           * whenever at least one usable locations[] entry
           * exists.
           */

          ...locationParams,

          /*
           * ==================================================
           * Legacy / Custom Single Location
           * ==================================================
           *
           * Keep these because:
           *
           * - Custom Search still uses them.
           * - Homepage search still uses them.
           * - Saved Searches still use them.
           * - Older URLs continue to work.
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
           * ==================================================
           * Lifestyle
           * ==================================================
           */

          diet:
            params.diet,

          smoking:
            params.smoking,

          drinking:
            params.drinking,

          /*
           * ==================================================
           * Trust Verification
           * ==================================================
           */

          aadhaarVerified:
            params.aadhaarVerified,

          idVerified:
            params.idVerified,

          churchVerified:
            params.churchVerified,

          /*
           * ==================================================
           * Result Ordering
           * ==================================================
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
  const normalizedId =
    profileId.trim();

  if (!normalizedId) {
    throw new Error(
      "Profile ID is required."
    );
  }

  const response =
    await api.get<
      | ApiEnvelope<BrowseProfile>
      | BrowseProfile
    >(
      `/profiles/${encodeURIComponent(
        normalizedId
      )}`
    );

  return unwrapApiResponse(
    response.data
  );
}
