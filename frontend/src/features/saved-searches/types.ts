import type {
  BrowseSearchFilters,
} from "@/features/browse/types";

export type SavedSearchAlertFrequency =
  | "IMMEDIATE"
  | "DAILY"
  | "WEEKLY";

export interface SavedSearch {
  id: string;

  name: string;

  // =====================================================
  // Match Basics
  // =====================================================

  ageFrom: number | null;

  ageTo: number | null;

  heightFrom: number | null;

  heightTo: number | null;

  gender: string | null;

  maritalStatus: string | null;

  // =====================================================
  // Faith & Background
  // =====================================================

  religion: string | null;

  denomination: string | null;

  community: string | null;

  motherTongue: string | null;

  baptized: boolean | null;

  // =====================================================
  // Education / Career
  // =====================================================

  highestEducation: string | null;

  profession: string | null;

  // =====================================================
  // Location
  // =====================================================

  country: string | null;

  state: string | null;

  city: string | null;

  // =====================================================
  // Lifestyle
  // =====================================================

  diet: string | null;

  smoking: string | null;

  drinking: string | null;

  // =====================================================
  // Trust
  // =====================================================

  aadhaarVerified: boolean | null;

  idVerified: boolean | null;

  churchVerified: boolean | null;

  // =====================================================
  // Ordering
  // =====================================================

  sort: string | null;

  // =====================================================
  // Saved Search Settings
  // =====================================================

  defaultSearch: boolean;

  alertsEnabled: boolean;

  alertFrequency:
    | SavedSearchAlertFrequency
    | null;

  lastAlertedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateSavedSearchRequest {
  name: string;

  ageFrom?: number;

  ageTo?: number;

  heightFrom?: number;

  heightTo?: number;

  gender?: string;

  maritalStatus?: string;

  religion?: string;

  denomination?: string;

  community?: string;

  motherTongue?: string;

  baptized?: boolean;

  highestEducation?: string;

  profession?: string;

  country?: string;

  state?: string;

  city?: string;

  diet?: string;

  smoking?: string;

  drinking?: string;

  aadhaarVerified?: boolean;

  idVerified?: boolean;

  churchVerified?: boolean;

  sort?: string;

  defaultSearch?: boolean;

  alertsEnabled?: boolean;

  alertFrequency?:
    SavedSearchAlertFrequency;
}

export interface UpdateSavedSearchAlertsRequest {
  enabled: boolean;

  frequency?:
    SavedSearchAlertFrequency;
}

/*
 * ============================================================
 * Browse Filters -> Saved Search API
 * ============================================================
 */

function optionalString(
  value:
    | string
    | undefined
): string | undefined {
  const cleaned =
    value?.trim();

  if (!cleaned) {
    return undefined;
  }

  return cleaned;
}

function optionalNumber(
  value:
    | string
    | undefined
): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return undefined;
  }

  return parsed;
}

function optionalBoolean(
  value:
    | string
    | undefined
): boolean | undefined {
  if (
    value === "true"
  ) {
    return true;
  }

  if (
    value === "false"
  ) {
    return false;
  }

  return undefined;
}

export function filtersToSavedSearchRequest(
  filters:
    BrowseSearchFilters,

  options: {
    name: string;

    defaultSearch?: boolean;

    alertsEnabled?: boolean;

    alertFrequency?:
      SavedSearchAlertFrequency;
  }
): CreateSavedSearchRequest {
  return {
    name:
      options.name.trim(),

    // ===================================================
    // Match Basics
    // ===================================================

    ageFrom:
      optionalNumber(
        filters.ageFrom
      ),

    ageTo:
      optionalNumber(
        filters.ageTo
      ),

    heightFrom:
      optionalNumber(
        filters.heightFrom
      ),

    heightTo:
      optionalNumber(
        filters.heightTo
      ),

    gender:
      optionalString(
        filters.gender
      ),

    maritalStatus:
      optionalString(
        filters.maritalStatus
      ),

    // ===================================================
    // Faith & Background
    // ===================================================

    religion:
      optionalString(
        filters.religion
      ),

    denomination:
      optionalString(
        filters.denomination
      ),

    community:
      optionalString(
        filters.community
      ),

    motherTongue:
      optionalString(
        filters.motherTongue
      ),

    baptized:
      optionalBoolean(
        filters.baptized
      ),

    // ===================================================
    // Education / Career
    // ===================================================

    highestEducation:
      optionalString(
        filters.highestEducation
      ),

    profession:
      optionalString(
        filters.profession
      ),

    // ===================================================
    // Location
    // ===================================================

    country:
      optionalString(
        filters.country
      ),

    state:
      optionalString(
        filters.state
      ),

    city:
      optionalString(
        filters.city
      ),

    // ===================================================
    // Lifestyle
    // ===================================================

    diet:
      optionalString(
        filters.diet
      ),

    smoking:
      optionalString(
        filters.smoking
      ),

    drinking:
      optionalString(
        filters.drinking
      ),

    // ===================================================
    // Trust
    // ===================================================

    aadhaarVerified:
      optionalBoolean(
        filters.aadhaarVerified
      ),

    idVerified:
      optionalBoolean(
        filters.idVerified
      ),

    churchVerified:
      optionalBoolean(
        filters.churchVerified
      ),

    // ===================================================
    // Ordering
    // ===================================================

    sort:
      optionalString(
        filters.sort
      ),

    // ===================================================
    // Saved Search Settings
    // ===================================================

    defaultSearch:
      options.defaultSearch ??
      false,

    alertsEnabled:
      options.alertsEnabled ??
      false,

    alertFrequency:
      options.alertFrequency ??
      "DAILY",
  };
}