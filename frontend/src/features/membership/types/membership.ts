export type BillingCycle = "monthly" | "quarterly" | "yearly";

export type MembershipTier =
  | "free"
  | "silver"
  | "gold"
  | "platinum";

export type MembershipStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "PENDING"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  badge?: string;
  description: string;

  price: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };

  features: string[];
  limitations?: string[];

  buttonText: string;
  popular?: boolean;
}

export interface CheckoutData {
  plan: MembershipTier;
  billingCycle: BillingCycle;

  fullName: string;
  email: string;
  phone: string;

  coupon?: string;
  gstNumber?: string;
}

export interface Membership {
  id: string;
  plan: MembershipTier;
  status: MembershipStatus;

  startDate: string;
  expiryDate: string;

  autoRenew: boolean;
}

export interface Payment {
  id: string;

  orderId: string;
  paymentId?: string;

  amount: number;

  status: PaymentStatus;

  createdAt: string;
}