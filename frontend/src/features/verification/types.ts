export type VerificationType =
  | "MOBILE"
  | "CHURCH"
  | "IDENTITY";

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface VerificationItem {
  type: VerificationType;
  status: VerificationStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  memberNote?: string | null;
}

export interface TrustVerificationResponse {
  userId: string;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;

  profileVerificationStatus:
    | "NOT_SUBMITTED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  trustScore: number;
  completedChecks: number;
  totalChecks: number;
  verifications: VerificationItem[];
}

export interface MobileOtpResponse {
  mobile: string;
  verified: boolean;
  message: string;
}

export interface VerifyMobileOtpRequest {
  otp: string;
}
