export type VerificationType =
  | "MOBILE"
  | "CHURCH"
  | "IDENTITY";

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface AdminMemberVerification {
  id: string;
  userId: string;

  fullName: string;
  email: string;

  verificationType: VerificationType;
  verificationStatus: VerificationStatus;

  memberNote?: string | null;

  submittedAt?: string | null;

  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewReason?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminMemberVerificationPage {
  content: AdminMemberVerification[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface UpdateMemberVerificationRequest {
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