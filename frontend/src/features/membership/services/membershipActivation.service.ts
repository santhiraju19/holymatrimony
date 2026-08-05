import api from "@/lib/api";

export type WaiverPlan =
  | "SILVER"
  | "GOLD"
  | "PLATINUM";

export interface ActivateWaiverRequest {
  plan: WaiverPlan;
  billingCycle: "MONTHLY";
  couponCode: string;
}

export interface MembershipResponse {
  membershipId: string | null;

  plan:
    | "FREE"
    | "SILVER"
    | "GOLD"
    | "PLATINUM";

  billingCycle:
    | "MONTHLY"
    | "QUARTERLY"
    | "YEARLY"
    | null;

  status:
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED";

  startDate: string | null;
  expiryDate: string | null;
  daysRemaining: number;
  autoRenew: boolean;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export const membershipActivationService = {
  async activateHoly100(
    request: ActivateWaiverRequest
  ): Promise<MembershipResponse> {
    const response =
      await api.post<
        ApiResponse<MembershipResponse>
      >(
        "/membership/activate-waiver",
        request
      );

    if (!response.data.data) {
      throw new Error(
        response.data.message ??
          "Membership activation failed."
      );
    }

    return response.data.data;
  },
};

export default membershipActivationService;
