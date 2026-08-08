import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminProfileDetail,
  AdminProfilePage,
  ApiResponse,
  ProfileVerificationStatus,
  UpdateProfileVerificationRequest,
} from "../types/adminProfile";

interface GetAdminProfilesParams {
  page?: number;
  size?: number;
  search?: string;
  status?:
    | ProfileVerificationStatus
    | "";
}

function unwrap<T>(
  response: ApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin profile request failed."
    );
  }

  return response.data;
}

export async function getAdminProfiles({
  page = 0,
  size = 20,
  search = "",
  status = "PENDING",
}: GetAdminProfilesParams = {}): Promise<AdminProfilePage> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminProfilePage>
      >(
        "/admin/profiles",
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
        "Unable to load profile verifications."
      )
    );
  }
}

export async function getAdminProfile(
  profileId: string
): Promise<AdminProfileDetail> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminProfileDetail>
      >(
        `/admin/profiles/${profileId}`
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load profile."
      )
    );
  }
}

export async function updateAdminProfileVerification(
  profileId: string,
  request: UpdateProfileVerificationRequest
): Promise<AdminProfileDetail> {
  try {
    const response =
      await api.patch<
        ApiResponse<AdminProfileDetail>
      >(
        `/admin/profiles/${profileId}/verification`,
        request
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to update profile verification."
      )
    );
  }
}