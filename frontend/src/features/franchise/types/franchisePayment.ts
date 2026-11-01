/**
 * Read-only payment projection returned by the franchise payment API.
 *
 * Geographic authorization is enforced exclusively by the backend using
 * the authenticated franchise user's active canonical district allocation.
 *
 * Amount fields are stored and returned in paise.
 */

export type FranchisePaymentStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type FranchisePaymentSource =
  | "RAZORPAY"
  | "COUPON";

export interface FranchisePayment {
  paymentId: string;

  customerName: string | null;
  email: string | null;
  phone: string | null;

  plan: string | null;
  billingCycle: string | null;

  amount: number | null;
  currency: string | null;

  status: FranchisePaymentStatus;
  paymentSource: FranchisePaymentSource;

  paymentMethod: string | null;
  couponCode: string | null;

  originalAmount: number | null;
  discountAmount: number | null;
  discountPercent: number | null;

  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;

  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
