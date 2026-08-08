import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminMembership,
  AdminMembershipPage,
  ApiResponse,
  MembershipPlan,
  MembershipStatus,
} from "../types/adminMembership";

interface GetMembershipsParams {
  page?: number;

  size?: number;

  search?: string;

  status?:
    | MembershipStatus
    | "";

  plan?:
    | MembershipPlan
    | "";
}

function unwrap<T>(
  response: ApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin membership request failed."
    );
  }

  return response.data;
}

export async function getAdminMemberships({
  page = 0,
  size = 20,
  search = "",
  status = "",
  plan = "",
}: GetMembershipsParams = {}): Promise<AdminMembershipPage> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminMembershipPage>
      >(
        "/admin/memberships",
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

            ...(plan
              ? {
                  plan,
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
        "Unable to load memberships."
      )
    );
  }
}

export async function getAdminMembership(
  membershipId: string
): Promise<AdminMembership> {
  try {
    const response =
      await api.get<
        ApiResponse<AdminMembership>
      >(
        `/admin/memberships/${membershipId}`
      );

    return unwrap(
      response.data
    );
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load membership."
      )
    );
  }
}