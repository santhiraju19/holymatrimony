import axios from "axios";

class PaymentService {
  private readonly api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  private getAuthHeaders() {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  async createOrder(
    plan: string,
    billingCycle: string,
    fullName: string,
    email: string,
    phone: string
  ) {
    const { data } = await this.api.post(
      "/payments/create-order",
      {
        plan,
        billingCycle,
        fullName,
        email,
        phone,
      },
      {
        headers: this.getAuthHeaders(),
      }
    );

    return data;
  }

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { data } = await this.api.post(
      "/payments/verify",
      payload,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return data;
  }
}

export const paymentService = new PaymentService();