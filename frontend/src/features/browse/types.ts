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
  profileCompleted: boolean | null;

  primaryPhotoId: string | null;
  primaryPhotoUrl: string | null;
}

export interface BrowseProfilesData {
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BrowseProfilesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
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