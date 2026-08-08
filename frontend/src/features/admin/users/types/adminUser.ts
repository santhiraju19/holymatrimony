export type UserRole =
  | "ROLE_USER"
  | "ROLE_ADMIN";

export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "BLOCKED"
  | "DEACTIVATED";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  mobile?: string | null;

  role: UserRole;
  status: UserStatus;

  enabled: boolean;
  emailVerified: boolean;

  profileCompletion: number;
  membershipType: string;

  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AdminUserDetail
  extends AdminUser {
  emailVerifiedAt?: string | null;

  statusReason?: string | null;
  statusChangedAt?: string | null;
  statusChangedBy?: string | null;

  updatedAt?: string | null;
}

export interface AdminUserPage {
  content: AdminUser[];

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