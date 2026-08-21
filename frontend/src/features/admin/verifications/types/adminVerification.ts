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

export type ChurchVerificationMethod =
  | "DOCUMENT"
  | "PASTOR_CONTACT"
  | "MEMBERSHIP_ID";

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

  /*
   * ============================================================
   * Identity Verification
   * ============================================================
   */

  hasIdentityDocument: boolean;

  identityDocumentType?: IdentityDocumentType | null;
  identityDocumentFileName?: string | null;
  identityDocumentContentType?: string | null;
  identityDocumentFileSize?: number | null;

  /*
   * ============================================================
   * Church Verification
   * ============================================================
   */

hasChurchSubmission: boolean;

priorityChurchVerification: boolean;

churchVerificationMethod?:
    | ChurchVerificationMethod
    | null;

  churchPastorName?: string | null;
  churchPhone?: string | null;
  churchEmail?: string | null;

  churchMembershipId?: string | null;

  hasChurchDocument: boolean;

  churchDocumentFileName?: string | null;
  churchDocumentContentType?: string | null;
  churchDocumentFileSize?: number | null;
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