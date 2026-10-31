export type FranchiseStatus =
  | "APPLICATION"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "AGREEMENT_PENDING"
  | "ONBOARDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "EXPIRED"
  | "TERMINATED"
  | "REJECTED";

export type FranchiseStaffRole =
  | "FRANCHISE_OWNER"
  | "FRANCHISE_MANAGER"
  | "RELATIONSHIP_MANAGER"
  | "SALES_EXECUTIVE"
  | "ACCOUNTANT";

export type FranchisePermission =
  | "DASHBOARD_VIEW"
  | "MEMBERS_VIEW"
  | "MEMBERS_MANAGE"
  | "LEADS_VIEW"
  | "LEADS_MANAGE"
  | "TERRITORIES_VIEW"
  | "TERRITORIES_MANAGE"
  | "PAYMENTS_VIEW"
  | "COMMISSIONS_VIEW"
  | "REPORTS_VIEW"
  | "ANALYTICS_VIEW"
  | "STAFF_MANAGE";

export interface FranchiseAccess {
  userId: string;
  fullName: string;
  email: string;

  franchiseUserId: string;
  staffRole: FranchiseStaffRole;

  franchiseId: string;
  franchiseCode: string;
  franchiseName: string;
  franchiseStatus: FranchiseStatus;

  stateId: string;
  stateLgdCode: number;
  stateName: string;

  districtId: string;
  districtLgdCode: number;
  districtName: string;

  permissions: FranchisePermission[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
}
