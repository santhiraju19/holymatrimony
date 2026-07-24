export interface MembershipResponse {
  plan: "FREE" | "SILVER" | "GOLD" | "PLATINUM";
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  startDate: string;
  expiryDate: string;
}

export interface UpgradeMembershipRequest {
  plan: "SILVER" | "GOLD" | "PLATINUM";
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
}