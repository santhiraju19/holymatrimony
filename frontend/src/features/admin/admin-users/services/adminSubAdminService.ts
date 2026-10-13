import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminApiResponse,
} from "@/features/admin/access/types";

import type {
  AdminSubAdmin,
  AdminSubAdminListParams,
  AdminSubAdminPage,
  CreateSubAdminRequest,
  SubAdminMessageResponse,
  UpdateSubAdminPermissionsRequest,
  UpdateSubAdminStatusRequest,
} from "../types/adminSubAdmin";

function unwrap<T>(
  response: AdminApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin user management request failed."
    );
  }

  return response.data;
}

function validateUserId(
  userId: string
): void {
  if (
    !userId ||
    userId === "undefined" ||
    userId === "null"
  ) {
    throw new Error(
      "Invalid admin user ID."
    );
  }
}

export async function getSubAdmins({
  page = 0,
  size = 20,
  search = "",
  status = "",
}: AdminSubAdminListParams = {}): Promise<AdminSubAdminPage> {
  try {
    const response =
      await api.get<
        AdminApiResponse<AdminSubAdminPage>
      >(
        "/admin/admin-users",
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
        "Unable to load admin users."
      )
    );
  }
}

export async function getSubAdmin(
  userId: string
): Promise<AdminSubAdmin> {
  validateUserId(userId);

  try {
    const response =
      await api.get<
        AdminApiResponse<AdminSubAdmin>
      >(
        `/admin/admin-users/${encodeURIComponent(
          userId
        )}`
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load admin user."
      )
    );
  }
}

export async function createSubAdmin(
  request: CreateSubAdminRequest
): Promise<AdminSubAdmin> {
  try {
    const response =
      await api.post<
        AdminApiResponse<AdminSubAdmin>
      >(
        "/admin/admin-users",
        {
          fullName:
            request.fullName.trim(),

          email:
            request.email.trim(),

          permissions:
            request.permissions,
        }
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to create admin user."
      )
    );
  }
}

export async function updateSubAdminPermissions(
  userId: string,
  request: UpdateSubAdminPermissionsRequest
): Promise<AdminSubAdmin> {
  validateUserId(userId);

  try {
    const response =
      await api.patch<
        AdminApiResponse<AdminSubAdmin>
      >(
        `/admin/admin-users/${encodeURIComponent(
          userId
        )}/permissions`,
        {
          permissions:
            request.permissions,
        }
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to update admin permissions."
      )
    );
  }
}

export async function updateSubAdminStatus(
  userId: string,
  request: UpdateSubAdminStatusRequest
): Promise<AdminSubAdmin> {
  validateUserId(userId);

  try {
    const response =
      await api.patch<
        AdminApiResponse<AdminSubAdmin>
      >(
        `/admin/admin-users/${encodeURIComponent(
          userId
        )}/status`,
        {
          status:
            request.status,

          reason:
            request.reason?.trim() ||
            null,
        }
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to update admin user status."
      )
    );
  }
}

export async function resendSubAdminSetupOtp(
  userId: string
): Promise<SubAdminMessageResponse> {
  validateUserId(userId);

  try {
    const response =
      await api.post<
        AdminApiResponse<SubAdminMessageResponse>
      >(
        `/admin/admin-users/${encodeURIComponent(
          userId
        )}/resend-setup-otp`
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to resend password setup OTP."
      )
    );
  }
}
