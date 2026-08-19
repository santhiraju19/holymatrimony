import type {
  AxiosResponse,
} from "axios";

import api from "@/lib/api";

/*
 * ============================================================
 * Create Order
 * ============================================================
 */

export interface CreateOrderResponse {
  orderId: string;
  key: string;
  amount: number;
  currency: string;
}

/*
 * ============================================================
 * Verify Payment
 * ============================================================
 */

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/*
 * ============================================================
 * Payment History
 * ============================================================
 */

export type PaymentSource =
  | "RAZORPAY"
  | "COUPON";

export type TransactionStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface PaymentHistory {
  /*
   * Backend uses UUID.
   */
  id: string;

  razorpayOrderId:
    | string
    | null;

  razorpayPaymentId:
    | string
    | null;

  plan: string;

  billingCycle: string;

  /*
   * Backend stores amount in paise.
   */
  amountInPaise: number;

  amountInRupees: number;

  currency: string;

  status: TransactionStatus;

  /*
   * RAZORPAY / COUPON
   */
  paymentSource: PaymentSource;

  /*
   * UPI / CARD / NETBANKING /
   * WALLET / EMI / COUPON
   */
  paymentMethod:
    | string
    | null;

  /*
   * Example: HOLY100
   */
  couponCode:
    | string
    | null;

  receiptAvailable: boolean;

  paidAt:
    | string
    | null;

  createdAt: string;
}

/*
 * ============================================================
 * Payment Service
 * ============================================================
 *
 * IMPORTANT:
 *
 * Use the application's shared `api` client.
 *
 * src/lib/api.ts already provides:
 *
 * - Authorization header
 * - access-token lookup
 * - refresh-token flow
 * - automatic retry after refresh
 * - withCredentials
 * - centralized authentication behaviour
 *
 * Do not create another Axios instance here.
 */

class PaymentService {

  /*
   * ========================================================
   * Create Razorpay Order
   * ========================================================
   */

  async createOrder(
    plan: string,
    billingCycle: string,
    fullName: string,
    email: string,
    phone: string
  ): Promise<CreateOrderResponse> {

    const response:
      AxiosResponse<CreateOrderResponse> =
      await api.post(
        "/payments/create-order",
        {
          plan,
          billingCycle,
          fullName,
          email,
          phone,
        }
      );

    return response.data;
  }

  /*
   * ========================================================
   * Verify Razorpay Checkout Signature
   * ========================================================
   */

  async verifyPayment(
    request:
      VerifyPaymentRequest
  ): Promise<void> {

    await api.post(
      "/payments/verify",
      request
    );
  }

  /*
   * ========================================================
   * Transaction History
   * ========================================================
   */

  async getPaymentHistory():
    Promise<PaymentHistory[]> {

    const response:
      AxiosResponse<
        PaymentHistory[]
      > =
      await api.get(
        "/payments/history"
      );

    return Array.isArray(
      response.data
    )
      ? response.data
      : [];
  }

  /*
   * ========================================================
   * Download Membership Receipt
   * ========================================================
   */

  async downloadReceipt(
    paymentId: string
  ): Promise<void> {

    const response:
      AxiosResponse<Blob> =
      await api.get(
        `/payments/${paymentId}/receipt`,
        {
          responseType:
            "blob",
        }
      );

    const contentDisposition =
      response.headers[
        "content-disposition"
      ];

    const filename =
      this.extractFilename(
        contentDisposition
      ) ??
      `holy-matrimony-receipt-${paymentId}.pdf`;

    const objectUrl =
      window.URL.createObjectURL(
        response.data
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      objectUrl;

    link.download =
      filename;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      objectUrl
    );
  }

  /*
   * ========================================================
   * Receipt Filename
   * ========================================================
   */

  private extractFilename(
    contentDisposition?:
      string
  ): string | null {

    if (
      !contentDisposition
    ) {
      return null;
    }

    /*
     * RFC 5987:
     *
     * filename*=UTF-8''receipt.pdf
     */
    const utf8Match =
      contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/i
      );

    if (
      utf8Match?.[1]
    ) {

      try {

        return decodeURIComponent(
          utf8Match[1]
        );

      } catch {

        return utf8Match[1];
      }
    }

    /*
     * Standard:
     *
     * filename="receipt.pdf"
     */
    const filenameMatch =
      contentDisposition.match(
        /filename="?([^";]+)"?/i
      );

    return (
      filenameMatch?.[1] ??
      null
    );
  }
}

export const paymentService =
  new PaymentService();
