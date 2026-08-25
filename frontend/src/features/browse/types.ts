export type BrowseSortOption =
  | "RECOMMENDED"
  | "NEWEST"
  | "TRUST_VERIFIED";

export interface BrowseProfilePhoto {
  id: string;
  imageUrl: string;
  primaryPhoto: boolean;
  displayOrder: number;
}

export interface BrowseProfile {
  id: string;
  userId: string;

  highlightedProfile: boolean;
  verifiedPremiumBadge: boolean;
  boostedProfile: boolean;

  // =====================================================
  // Basic
  // =====================================================

  fullName: string;

  dateOfBirth: string | null;
  gender: string | null;
  age: number | null;
  maritalStatus: string | null;

  // =====================================================
  // Personal Information
  // =====================================================

  heightCm: number | null;
  weightKg: number | null;

  complexion: string | null;
  bodyType: string | null;

  motherTongue: string | null;

  religion: string | null;

  community: string | null;
  subCommunity: string | null;

  faithBackground: string | null;
  physicalStatus: string | null;

  diet: string | null;
  smoking: string | null;
  drinking: string | null;

  // =====================================================
  // Church
  // =====================================================

  denomination: string | null;
  churchName: string | null;
  pastorName: string | null;

  baptized: boolean | null;

  // =====================================================
  // Education / Career
  // =====================================================

  highestEducation: string | null;
  educationField: string | null;

  profession: string | null;
  company: string | null;

  annualIncome: string | null;

  // =====================================================
  // Family
  // =====================================================

  familyType: string | null;
  familyValues: string | null;

  // =====================================================
  // Location
  // =====================================================

  city: string | null;
  state: string | null;
  country: string | null;

  // =====================================================
  // About
  // =====================================================

  aboutMe: string | null;

  // =====================================================
  // Completion
  // =====================================================

  completionPercentage: number | null;
  profileCompleted: boolean;

  // =====================================================
  // Trust Verification
  // =====================================================

  mobileVerified: boolean;
  churchVerified: boolean;
  identityVerified: boolean;

  aadhaarVerified: boolean;
  idVerified: boolean;

  verifiedProfile: boolean;

  // =====================================================
  // Compatibility
  // =====================================================

  compatibilityScore: number | null;
  compatibilityAgeScore: number | null;
  compatibilityDenominationScore: number | null;
  compatibilityEducationScore: number | null;

  // =====================================================
  // Photos
  // =====================================================

  primaryPhotoId: string | null;
  primaryPhotoUrl: string | null;

  photos: BrowseProfilePhoto[];
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
  // =====================================================
  // Match Basics
  // =====================================================

  ageFrom: string;
  ageTo: string;

  heightFrom: string;
  heightTo: string;

  gender: string;
  maritalStatus: string;

  // =====================================================
  // Faith & Background
  // =====================================================

  religion: string;
  denomination: string;
  community: string;
  motherTongue: string;

  baptized: string;

  // =====================================================
  // Education / Career
  // =====================================================

  highestEducation: string;
  profession: string;

  // =====================================================
  // Location
  // =====================================================

  country: string;
  state: string;
  district: string;
  city: string;

  // =====================================================
  // Lifestyle
  // =====================================================

  diet: string;
  smoking: string;
  drinking: string;

  // =====================================================
  // Trust
  // =====================================================

  aadhaarVerified: string;
  idVerified: string;
  churchVerified: string;

  // =====================================================
  // Sort
  // =====================================================

  sort: BrowseSortOption;
}

export interface BrowseSearchParams
  extends BrowsePaginationParams {
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
  district?: string;
  city?: string;

  diet?: string;
  smoking?: string;
  drinking?: string;

  aadhaarVerified?: boolean;
  idVerified?: boolean;
  churchVerified?: boolean;

  sort?: BrowseSortOption;
}

export const EMPTY_BROWSE_SEARCH_FILTERS: BrowseSearchFilters =
  {
    ageFrom: "",
    ageTo: "",

    heightFrom: "",
    heightTo: "",

    gender: "",
    maritalStatus: "",

    religion: "",
    denomination: "",
    community: "",
    motherTongue: "",

    baptized: "",

    highestEducation: "",
    profession: "",

    country: "",
    state: "",
    district: "",
    city: "",

    diet: "",
    smoking: "",
    drinking: "",

    aadhaarVerified: "",
    idVerified: "",
    churchVerified: "",

    sort: "RECOMMENDED",
  };

export function hasActiveBrowseFilters(
  filters: BrowseSearchFilters
): boolean {
  return (
    filters.ageFrom.trim().length > 0 ||
    filters.ageTo.trim().length > 0 ||
    filters.heightFrom.trim().length >
      0 ||
    filters.heightTo.trim().length > 0 ||
    filters.gender.trim().length > 0 ||
    filters.maritalStatus.trim().length >
      0 ||
    filters.religion.trim().length > 0 ||
    filters.denomination.trim().length >
      0 ||
    filters.community.trim().length > 0 ||
    filters.motherTongue.trim().length >
      0 ||
    filters.baptized.trim().length > 0 ||
    filters.highestEducation.trim().length >
      0 ||
    filters.profession.trim().length > 0 ||
    filters.country.trim().length > 0 ||
    filters.state.trim().length > 0 ||
    filters.district.trim().length > 0 ||
    filters.city.trim().length > 0 ||
    filters.diet.trim().length > 0 ||
    filters.smoking.trim().length > 0 ||
    filters.drinking.trim().length > 0 ||
    filters.aadhaarVerified === "true" ||
    filters.idVerified === "true" ||
    filters.churchVerified === "true" ||
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

  const heightFrom =
    Number(filters.heightFrom);

  const heightTo =
    Number(filters.heightTo);

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
    filters.heightFrom.trim() &&
    Number.isInteger(heightFrom)
  ) {
    params.heightFrom =
      heightFrom;
  }

  if (
    filters.heightTo.trim() &&
    Number.isInteger(heightTo)
  ) {
    params.heightTo =
      heightTo;
  }

  if (
    filters.gender.trim()
  ) {
    params.gender =
      filters.gender.trim();
  }

  if (
    filters.maritalStatus.trim()
  ) {
    params.maritalStatus =
      filters.maritalStatus.trim();
  }

  if (
    filters.religion.trim()
  ) {
    params.religion =
      filters.religion.trim();
  }

  if (
    filters.denomination.trim()
  ) {
    params.denomination =
      filters.denomination.trim();
  }

  if (
    filters.community.trim()
  ) {
    params.community =
      filters.community.trim();
  }

  if (
    filters.motherTongue.trim()
  ) {
    params.motherTongue =
      filters.motherTongue.trim();
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
    filters.district.trim()
  ) {
    params.district =
      filters.district.trim();
  }

  if (
    filters.city.trim()
  ) {
    params.city =
      filters.city.trim();
  }

  if (
    filters.diet.trim()
  ) {
    params.diet =
      filters.diet.trim();
  }

  if (
    filters.smoking.trim()
  ) {
    params.smoking =
      filters.smoking.trim();
  }

  if (
    filters.drinking.trim()
  ) {
    params.drinking =
      filters.drinking.trim();
  }

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