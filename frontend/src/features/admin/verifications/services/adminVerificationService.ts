import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminMemberVerification,
  AdminMemberVerificationPage,
  ApiResponse,
  UpdateMemberVerificationRequest,
  VerificationStatus,
  VerificationType,
} from "../types/adminVerification";

interface GetAdminVerificationsParams {
  page?: number;
  size?: number;
  search?: string;

  status?:
    | VerificationStatus
    | "";

  type?:
    | VerificationType
    | "";
}

function unwrap<T>(
  response: ApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin verification request failed."
    );
  }

  return response.data;
}

export async function getAdminVerifications({
  page = 0,
  size = 20,
  search = "",
  status = "PENDING",
  type = "",
}: GetAdminVerificationsParams = {}): Promise<AdminMemberVerificationPage> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminMemberVerificationPage>
      >(
        "/admin/verifications",
        {
          params: {
            page,
            size,

            ...(search.trim()
              ? {
                  search:
                    search.trim(),
                }
              : {}),

            ...(status
              ? {
                  status,
                }
              : {}),

            ...(type
              ? {
                  type,
                }
              : {}),
          },
        }
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load member verifications."
      )
    );
  }
}

export async function getAdminVerification(
  verificationId: string
): Promise<AdminMemberVerification> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminMemberVerification>
      >(
        `/admin/verifications/${verificationId}`
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load verification request."
      )
    );
  }
}

export async function updateAdminVerification(
  verificationId: string,
  request: UpdateMemberVerificationRequest
): Promise<AdminMemberVerification> {
  try {
    const response =
      await api.patch<
        ApiResponse<AdminMemberVerification>
      >(
        `/admin/verifications/${verificationId}`,
        request
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to update verification request."
      )
    );
  }
}