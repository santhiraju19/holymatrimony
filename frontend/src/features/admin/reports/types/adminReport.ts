export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "DISMISSED";

export type ReportReason =
  | "INAPPROPRIATE_MESSAGES"
  | "HARASSMENT"
  | "FAKE_PROFILE"
  | "SCAM_OR_FRAUD"
  | "OFFENSIVE_CONTENT"
  | "OTHER";

export interface AdminReport {
  id: string;

  reporterId: string;
  reporterName: string;
  reporterEmail: string;

  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;

  conversationId?: string | null;

  reason: ReportReason;
  status: ReportStatus;

  createdAt: string;
  reviewedAt?: string | null;
}

export interface AdminReportDetail
  extends AdminReport {
  reporterMobile?: string | null;

  reportedUserMobile?: string | null;

  details?: string | null;

  reviewedById?: string | null;
  reviewedByName?: string | null;
  reviewedByEmail?: string | null;
}

export interface AdminReportPage {
  content: AdminReport[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
