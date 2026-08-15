import api from "@/lib/api";

import type {
  TrustVerificationResponse,
  VerificationType,
} from "@/features/verification/types";

export const verificationService = {
  async getVerificationCenter(): Promise<TrustVerificationResponse> {
    const response =
      await api.get<TrustVerificationResponse>(
        "/verifications"
      );

    return response.data;
  },

  async submitVerification(
    type: VerificationType,
    note?: string
  ): Promise<TrustVerificationResponse> {
    const response =
      await api.post<TrustVerificationResponse>(
        `/verifications/${type}/submit`,
        {
          note: note?.trim() || null,
        }
      );

    return response.data;
  },
};

export default verificationService;