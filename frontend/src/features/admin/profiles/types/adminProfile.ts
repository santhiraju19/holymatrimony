export type ProfileVerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface AdminProfileListItem {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  mobile?: string | null;
  gender?: string | null;
  age?: number | null;
  denomination?: string | null;
  churchName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  completionPercentage?: number | null;
  profileCompleted?: boolean | null;
  verificationStatus: ProfileVerificationStatus;
  verificationSubmittedAt?: string | null;
  verificationReviewedAt?: string | null;
  primaryPhotoUrl?: string | null;
  createdAt?: string | null;
}

export interface AdminProfilePage {
  content: AdminProfileListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminProfilePhoto {
  id: string;
  fileName: string;
  imageUrl: string;
  contentType: string;
  fileSize: number;
  primaryPhoto: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface AdminProfileDetail {
  profileId: string;
  userId: string;

  fullName: string;
  email: string;

  mobile?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  age?: number | null;
  maritalStatus?: string | null;

  denomination?: string | null;
  churchName?: string | null;
  pastorName?: string | null;
  baptized?: boolean | null;
  membershipId?: string | null;
  churchAddress?: string | null;

  highestEducation?: string | null;
  profession?: string | null;
  company?: string | null;
  annualIncome?: string | null;

  fatherName?: string | null;
  motherName?: string | null;
  siblings?: string | null;
  familyLocation?: string | null;

  preferredAgeFrom?: number | null;
  preferredAgeTo?: number | null;
  preferredDenomination?: string | null;
  preferredEducation?: string | null;

  city?: string | null;
  state?: string | null;
  country?: string | null;

  aboutMe?: string | null;

  completionPercentage?: number | null;
  profileCompleted?: boolean | null;

  verificationStatus: ProfileVerificationStatus;
  verificationSubmittedAt?: string | null;
  verificationReviewedAt?: string | null;
  verificationReviewedBy?: string | null;
  verificationReason?: string | null;

  photos?: AdminProfilePhoto[];

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateProfileVerificationRequest {
  status:
    | "APPROVED"
    | "REJECTED";
  reason?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}