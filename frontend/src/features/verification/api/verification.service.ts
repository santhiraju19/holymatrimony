import api from "@/lib/api";

import type {
  IdentityDocumentResponse,
  MobileOtpResponse,
  TrustVerificationResponse,
  UploadIdentityDocumentRequest,
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
          note:
            note?.trim() ||
            null,
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

  async uploadIdentityDocument(
    request: UploadIdentityDocumentRequest
  ): Promise<IdentityDocumentResponse> {

    const formData =
      new FormData();

    formData.append(
      "documentType",
      request.documentType
    );

    formData.append(
      "file",
      request.file
    );

    if (
      request.note?.trim()
    ) {
      formData.append(
        "note",
        request.note.trim()
      );
    }

    const response =
      await api.post<IdentityDocumentResponse>(
        "/verifications/identity/document",
        formData
      );

    return response.data;
  },

  async getMyIdentityDocument():
    Promise<IdentityDocumentResponse> {

    const response =
      await api.get<IdentityDocumentResponse>(
        "/verifications/identity/document"
      );

    return response.data;
  },
};

export default verificationService;