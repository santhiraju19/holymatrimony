export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface AdminPayment {
  paymentId: string;

  userId: string;

  fullName: string;

  accountEmail: string;

  razorpayOrderId?: string | null;

  razorpayPaymentId?: string | null;

  plan: string;

  billingCycle: string;

  customerName: string;

  email: string;

  phone?: string | null;

  amountInPaise?: number | null;

  amountInRupees?: number | null;

  currency: string;

  status: PaymentStatus;

  paidAt?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;
}

export interface AdminPaymentPage {
  content: AdminPayment[];

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