import axios, {
  AxiosInstance,
  AxiosResponse,
} from "axios";

export interface CreateOrderResponse {
  orderId: string;
  key: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentHistory {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  plan: string;
  billingCycle: string;
  amountInPaise: number;
  amountInRupees: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

class PaymentService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:8080/api/v1",

      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token =
            localStorage.getItem(
              "hm_access_token"
            ) ??
            localStorage.getItem("hm_token");

          if (token) {
            config.headers.Authorization =
              `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async createOrder(
    plan: string,
    billingCycle: string,
    fullName: string,
    email: string,
    phone: string
  ): Promise<CreateOrderResponse> {
    const response: AxiosResponse<CreateOrderResponse> =
      await this.api.post(
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

  async verifyPayment(
    request: VerifyPaymentRequest
  ): Promise<string> {
    const response: AxiosResponse<string> =
      await this.api.post(
        "/payments/verify",
        request
      );

    return response.data;
  }

  async getPaymentHistory(): Promise<
    PaymentHistory[]
  > {
    const response: AxiosResponse<
      PaymentHistory[]
    > = await this.api.get("/payments/history");

    return response.data;
  }

  async downloadReceipt(
    paymentId: number
  ): Promise<void> {
    const response: AxiosResponse<Blob> =
      await this.api.get(
        `/payments/${paymentId}/receipt`,
        {
          responseType: "blob",
        }
      );

    const contentDisposition =
      response.headers["content-disposition"];

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
      document.createElement("a");

    link.href = objectUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(objectUrl);
  }

  private extractFilename(
    contentDisposition?: string
  ): string | null {
    if (!contentDisposition) {
      return null;
    }

    const match =
      contentDisposition.match(
        /filename="?([^"]+)"?/i
      );

    return match?.[1] ?? null;
  }
}

export const paymentService =
  new PaymentService();