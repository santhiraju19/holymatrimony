export type AdminAccessLevel =
  | "SUPER_ADMIN"
  | "SUB_ADMIN";

export type AdminPermission =
  | "DASHBOARD_VIEW"
  | "ANALYTICS_VIEW"
  | "USERS_MANAGE"
  | "PROFILES_MANAGE"
  | "VERIFICATIONS_MANAGE"
  | "MEMBERSHIPS_VIEW"
  | "PAYMENTS_VIEW"
  | "REPORTS_MANAGE";

export interface AdminAccess {
  userId: string;
  fullName: string;
  email: string;
  accessLevel: AdminAccessLevel;
  permissions: AdminPermission[];
}

export interface AdminApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ADMIN_PERMISSIONS: AdminPermission[] = [
  "DASHBOARD_VIEW",
  "ANALYTICS_VIEW",
  "USERS_MANAGE",
  "PROFILES_MANAGE",
  "VERIFICATIONS_MANAGE",
  "MEMBERSHIPS_VIEW",
  "PAYMENTS_VIEW",
  "REPORTS_MANAGE",
];
