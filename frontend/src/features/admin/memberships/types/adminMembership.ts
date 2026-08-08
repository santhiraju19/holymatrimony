export type MembershipPlan =
  | "FREE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM";

export type MembershipStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export type BillingCycle =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export interface AdminMembership {
  membershipId: string;

  userId: string;

  fullName: string;

  email: string;

  mobile?: string | null;

  plan: MembershipPlan;

  billingCycle: BillingCycle;

  status: MembershipStatus;

  startDate: string;

  expiryDate: string;

  daysRemaining: number;

  autoRenew: boolean;

  paymentId?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;
}

export interface AdminMembershipPage {
  content: AdminMembership[];

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