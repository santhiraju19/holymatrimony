export type BrowseSortOption =
  | "RECOMMENDED"
  | "NEWEST"
  | "TRUST_VERIFIED";

export interface BrowseProfile {
  id: string;
  userId: string;
  highlightedProfile: boolean;
  verifiedPremiumBadge: boolean;

  fullName: string;

  dateOfBirth: string | null;
  gender: string | null;
  age: number | null;
  maritalStatus: string | null;

  denomination: string | null;
  churchName: string | null;
  baptized: boolean | null;

  highestEducation: string | null;
  profession: string | null;
  company: string | null;
  annualIncome: string | null;

  city: string | null;
  state: string | null;
  country: string | null;

  aboutMe: string | null;

  completionPercentage: number | null;
  profileCompleted: boolean;

  // =====================================================
  // Trust Verification
  // =====================================================

  mobileVerified: boolean;

  /*
   * Approved church verification.
   */
  churchVerified: boolean;

  /*
   * Any approved identity document.
   *
   * Kept for compatibility with the existing
   * verification/profile UI.
   */
  identityVerified: boolean;

  /*
   * Approved Aadhaar identity document.
   */
  aadhaarVerified: boolean;

  /*
   * Approved non-Aadhaar identity document:
   *
   * Passport
   * Driving Licence
   * Voter ID
   */
  idVerified: boolean;

    /*
   * Existing compatibility flag.
   */
  verifiedProfile: boolean;

  // =====================================================
  // Compatibility Score
  // =====================================================

  compatibilityScore: number | null;
  compatibilityAgeScore: number | null;
  compatibilityDenominationScore: number | null;
  compatibilityEducationScore: number | null;

  primaryPhotoId: string | null;
  primaryPhotoUrl: string | null;
}

export interface BrowseProfilesResult {
  profiles: BrowseProfile[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;

  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BrowsePaginationParams {
  page?: number;
  size?: number;
}

export interface BrowseSearchFilters {
  ageFrom: string;
  ageTo: string;

  gender: string;
  denomination: string;
  maritalStatus: string;

  country: string;
  state: string;
  city: string;

  highestEducation: string;
  profession: string;

  baptized: string;

  // Trust filters
  aadhaarVerified: string;
  idVerified: string;
  churchVerified: string;

  // Result ordering
  sort: BrowseSortOption;
}

export interface BrowseSearchParams
  extends BrowsePaginationParams {
  ageFrom?: number;
  ageTo?: number;

  gender?: string;
  denomination?: string;
  maritalStatus?: string;

  country?: string;
  state?: string;
  city?: string;

  highestEducation?: string;
  profession?: string;

  baptized?: boolean;

  aadhaarVerified?: boolean;
  idVerified?: boolean;
  churchVerified?: boolean;

  sort?: BrowseSortOption;
}

export const EMPTY_BROWSE_SEARCH_FILTERS: BrowseSearchFilters = {
  ageFrom: "",
  ageTo: "",

  gender: "",
  denomination: "",
  maritalStatus: "",

  country: "",
  state: "",
  city: "",

  highestEducation: "",
  profession: "",

  baptized: "",

  aadhaarVerified: "",
  idVerified: "",
  churchVerified: "",

  sort: "RECOMMENDED",
};

export function hasActiveBrowseFilters(
  filters: BrowseSearchFilters
): boolean {
  return (
    filters.ageFrom.trim().length >
      0 ||
    filters.ageTo.trim().length >
      0 ||
    filters.gender.trim().length >
      0 ||
    filters.denomination.trim()
      .length > 0 ||
    filters.maritalStatus.trim()
      .length > 0 ||
    filters.country.trim().length >
      0 ||
    filters.state.trim().length >
      0 ||
    filters.city.trim().length >
      0 ||
    filters.highestEducation
      .trim().length > 0 ||
    filters.profession.trim()
      .length > 0 ||
    filters.baptized.trim().length >
      0 ||
    filters.aadhaarVerified ===
      "true" ||
    filters.idVerified === "true" ||
    filters.churchVerified ===
      "true" ||
    filters.sort !== "RECOMMENDED"
  );
}

export function buildBrowseSearchParams(
  filters: BrowseSearchFilters,
  pagination: BrowsePaginationParams = {}
): BrowseSearchParams {
  const params: BrowseSearchParams = {
    page: pagination.page ?? 0,
    size: pagination.size ?? 12,
    sort: filters.sort,
  };

  const ageFrom =
    Number(filters.ageFrom);

  const ageTo =
    Number(filters.ageTo);

  if (
    filters.ageFrom.trim() &&
    Number.isInteger(ageFrom)
  ) {
    params.ageFrom =
      ageFrom;
  }

  if (
    filters.ageTo.trim() &&
    Number.isInteger(ageTo)
  ) {
    params.ageTo =
      ageTo;
  }

  if (
    filters.gender.trim()
  ) {
    params.gender =
      filters.gender.trim();
  }

  if (
    filters.denomination.trim()
  ) {
    params.denomination =
      filters.denomination.trim();
  }

  if (
    filters.maritalStatus.trim()
  ) {
    params.maritalStatus =
      filters.maritalStatus.trim();
  }

  if (
    filters.country.trim()
  ) {
    params.country =
      filters.country.trim();
  }

  if (
    filters.state.trim()
  ) {
    params.state =
      filters.state.trim();
  }

  if (
    filters.city.trim()
  ) {
    params.city =
      filters.city.trim();
  }

  if (
    filters.highestEducation.trim()
  ) {
    params.highestEducation =
      filters.highestEducation.trim();
  }

  if (
    filters.profession.trim()
  ) {
    params.profession =
      filters.profession.trim();
  }

  if (
    filters.baptized ===
    "true"
  ) {
    params.baptized =
      true;
  }

  if (
    filters.baptized ===
    "false"
  ) {
    params.baptized =
      false;
  }

  // =====================================================
  // Verification Filters
  // =====================================================

  if (
    filters.aadhaarVerified ===
    "true"
  ) {
    params.aadhaarVerified =
      true;
  }

  if (
    filters.idVerified ===
    "true"
  ) {
    params.idVerified =
      true;
  }

  if (
    filters.churchVerified ===
    "true"
  ) {
    params.churchVerified =
      true;
  }

  return params;
}