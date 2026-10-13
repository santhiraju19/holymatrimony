import api, {
  getApiErrorMessage,
} from "@/lib/api";

import type {
  AdminAccess,
  AdminApiResponse,
} from "./types";

function unwrap<T>(
  response: AdminApiResponse<T>
): T {
  if (!response.success) {
    throw new Error(
      response.message ||
        "Admin access request failed."
    );
  }

  return response.data;
}

export async function getCurrentAdminAccess():
  Promise<AdminAccess> {
  try {
    const response =
      await api.get<
        AdminApiResponse<AdminAccess>
      >("/admin/access/me");

    return unwrap(response.data);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        "Unable to load administrator access."
      )
    );
  }
}
