export type MembershipPlan =
  | "FREE"
  | "PREMIUM"
  | "ELITE"
  | "SIGNATURE";

export type MembershipBillingCycle =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export type MembershipStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "PENDING"
  | "CANCELLED";

export interface MembershipResponse {
  membershipId: string | null;

  plan: MembershipPlan;

  billingCycle: MembershipBillingCycle | null;

  status: MembershipStatus;

  startDate: string | null;

  expiryDate: string | null;

  daysRemaining: number;

  autoRenew: boolean;
}

export interface MembershipApiEnvelope {
  success?: boolean;
  message?: string;
  data?: MembershipResponse;
}