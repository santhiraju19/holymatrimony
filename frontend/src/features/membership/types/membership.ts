export type BillingCycle =
  | "monthly"
  | "quarterly"
  | "yearly";

export type MembershipTier =
  | "silver"
  | "gold"
  | "platinum";

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  description?: string;

  monthly: number;
  quarterly: number;
  yearly: number;

  features: string[];
  recommended?: boolean;
}
