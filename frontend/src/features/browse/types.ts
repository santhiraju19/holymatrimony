export interface BrowseProfile {
  id: string;
  userId: string;

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
};

export function hasActiveBrowseFilters(
  filters: BrowseSearchFilters
): boolean {
  return Object.values(filters).some(
    (value) =>
      value.trim().length > 0
  );
}

export function buildBrowseSearchParams(
  filters: BrowseSearchFilters,
  pagination: BrowsePaginationParams = {}
): BrowseSearchParams {
  const params: BrowseSearchParams = {
    page: pagination.page ?? 0,
    size: pagination.size ?? 12,
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

  if (filters.gender.trim()) {
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

  if (filters.state.trim()) {
    params.state =
      filters.state.trim();
  }

  if (filters.city.trim()) {
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

  return params;
}
