export interface ProfileViewer {
  profileId: string;
  fullName: string;

  age: number | null;

  city: string | null;
  state: string | null;
  country: string | null;

  primaryPhotoUrl: string | null;

  firstViewedAt: string;
  lastViewedAt: string;

  viewCount: number;
}

export interface ProfileViewersPage {
  viewers: ProfileViewer[];

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
  success?: boolean;
  message?: string;
  data: T;
}