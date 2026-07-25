import axios from "axios";

import {
  Membership,
  MembershipPlan,
} from "../types/membership";

class MembershipService {
  private readonly api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async getPlans(): Promise<MembershipPlan[]> {
    const { data } = await this.api.get("/membership/plans");
    return data;
  }

  async getCurrentMembership(): Promise<Membership> {
    const { data } = await this.api.get("/membership/me");
    return data;
  }

  async activateMembership(paymentId: string) {
    const { data } = await this.api.post("/membership/activate", {
      paymentId,
    });

    return data;
  }

  async cancelMembership() {
    const { data } = await this.api.post("/membership/cancel");
    return data;
  }
}

export const membershipService = new MembershipService();