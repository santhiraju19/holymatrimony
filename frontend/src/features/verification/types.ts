export type VerificationType =
  | "MOBILE"
  | "CHURCH"
  | "IDENTITY";

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type IdentityDocumentType =
  | "AADHAAR"
  | "PASSPORT"
  | "DRIVING_LICENCE"
  | "VOTER_ID";

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

export interface IdentityDocumentResponse {
  id: string;
  verificationId: string;
  documentType: IdentityDocumentType;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface UploadIdentityDocumentRequest {
  documentType: IdentityDocumentType;
  file: File;
  note?: string;
}

export type ChurchVerificationMethod =
  | "DOCUMENT"
  | "PASTOR_CONTACT"
  | "MEMBERSHIP_ID";

export interface ChurchVerificationSubmission {
  id: string;
  verificationId: string;

  verificationMethod: ChurchVerificationMethod;

  pastorName?: string | null;
  churchPhone?: string | null;
  churchEmail?: string | null;

  membershipId?: string | null;

  documentAvailable: boolean;
  originalFileName?: string | null;
  contentType?: string | null;
  fileSize?: number | null;

  submittedAt?: string | null;
  updatedAt?: string | null;
}

export interface SubmitChurchVerificationRequest {
  verificationMethod: ChurchVerificationMethod;

  pastorName?: string;
  churchPhone?: string;
  churchEmail?: string;

  membershipId?: string;

  file?: File | null;

  note?: string;
}