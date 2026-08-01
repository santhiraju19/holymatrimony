export interface PaymentHistory {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  plan: string;
  billingCycle: string;
  amountInPaise: number;
  amountInRupees: number;
  currency: string;
  status: string;
  paidAt: string;
  createdAt: string;
}