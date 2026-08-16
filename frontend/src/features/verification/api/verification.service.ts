import api from "@/lib/api";

import type {
  MobileOtpResponse,
  TrustVerificationResponse,
  VerificationType,
  VerifyMobileOtpRequest,
} from "@/features/verification/types";

export const verificationService = {

  async getVerificationCenter():
    Promise<TrustVerificationResponse> {

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

  async requestMobileOtp():
    Promise<MobileOtpResponse> {

    const response =
      await api.post<MobileOtpResponse>(
        "/verifications/mobile/request-otp"
      );

    return response.data;
  },

  async resendMobileOtp():
    Promise<MobileOtpResponse> {

    const response =
      await api.post<MobileOtpResponse>(
        "/verifications/mobile/resend-otp"
      );

    return response.data;
  },

  async verifyMobileOtp(
    request: VerifyMobileOtpRequest
  ): Promise<MobileOtpResponse> {

    const response =
      await api.post<MobileOtpResponse>(
        "/verifications/mobile/verify-otp",
        request
      );

    return response.data;
  },
};

export default verificationService;
