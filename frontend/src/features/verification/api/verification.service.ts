import api from "@/lib/api";

import type {
  ChurchVerificationSubmission,
  IdentityDocumentResponse,
  MobileOtpResponse,
  SubmitChurchVerificationRequest,
  TrustVerificationResponse,
  UploadIdentityDocumentRequest,
  VerificationType,
  VerifyMobileOtpRequest,
} from "@/features/verification/types";

export const verificationService = {

  /*
   * ============================================================
   * Verification Center
   * ============================================================
   */

  async getVerificationCenter():
    Promise<TrustVerificationResponse> {

    const response =
      await api.get<TrustVerificationResponse>(
        "/verifications"
      );

    return response.data;
  },

  /*
   * ============================================================
   * Generic Manual Verification
   * ============================================================
   *
   * Do not use this for:
   *
   * MOBILE   -> OTP workflow
   * IDENTITY -> secure document workflow
   * CHURCH   -> dedicated Church submission workflow
   */

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

  /*
   * ============================================================
   * Mobile Verification
   * ============================================================
   */

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

  /*
   * ============================================================
   * Identity Verification
   * ============================================================
   */

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

  /*
   * ============================================================
   * Church Verification
   * ============================================================
   */

  async submitChurchVerification(
    request: SubmitChurchVerificationRequest
  ): Promise<ChurchVerificationSubmission> {

    const formData =
      new FormData();

    formData.append(
      "verificationMethod",
      request.verificationMethod
    );

    if (
      request.pastorName?.trim()
    ) {

      formData.append(
        "pastorName",
        request.pastorName.trim()
      );
    }

    if (
      request.churchPhone?.trim()
    ) {

      formData.append(
        "churchPhone",
        request.churchPhone.trim()
      );
    }

    if (
      request.churchEmail?.trim()
    ) {

      formData.append(
        "churchEmail",
        request.churchEmail.trim()
      );
    }

    if (
      request.membershipId?.trim()
    ) {

      formData.append(
        "membershipId",
        request.membershipId.trim()
      );
    }

    if (request.file) {

      formData.append(
        "file",
        request.file
      );
    }

    if (
      request.note?.trim()
    ) {

      formData.append(
        "note",
        request.note.trim()
      );
    }

    const response =
      await api.post<ChurchVerificationSubmission>(
        "/verifications/church/submission",
        formData
      );

    return response.data;
  },

  async getMyChurchVerification():
    Promise<ChurchVerificationSubmission> {

    const response =
      await api.get<ChurchVerificationSubmission>(
        "/verifications/church/submission"
      );

    return response.data;
  },
};

export default verificationService;