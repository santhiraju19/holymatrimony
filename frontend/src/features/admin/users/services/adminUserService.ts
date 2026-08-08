import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminUserDetail,
  AdminUserPage,
  ApiResponse,
  UserStatus,
} from "../types/adminUser";

interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: UserStatus | "";
}

function unwrap<T>(
  response: ApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin request failed."
    );
  }

  return response.data;
}

export async function getAdminUsers({
  page = 0,
  size = 20,
  search = "",
  status = "",
}: GetUsersParams = {}): Promise<AdminUserPage> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminUserPage>
      >(
        "/admin/users",
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
        "Unable to load users."
      )
    );
  }
}

export async function getAdminUser(
  userId: string
): Promise<AdminUserDetail> {
  if (
    !userId ||
    userId === "undefined" ||
    userId === "null"
  ) {
    throw new Error(
      "Invalid user ID."
    );
  }

  try {
    const response =
      await api.get<
        ApiResponse<AdminUserDetail>
      >(
        `/admin/users/${encodeURIComponent(
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
        "Unable to load user."
      )
    );
  }
}

export async function updateAdminUserStatus(
  userId: string,
  status: UserStatus,
  reason?: string
): Promise<AdminUserDetail> {
  if (
    !userId ||
    userId === "undefined" ||
    userId === "null"
  ) {
    throw new Error(
      "Invalid user ID."
    );
  }

  try {
    const response =
      await api.patch<
        ApiResponse<AdminUserDetail>
      >(
        `/admin/users/${encodeURIComponent(
          userId
        )}/status`,
        {
          status,

          reason:
            reason?.trim() ||
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
        "Unable to update user status."
      )
    );
  }
}