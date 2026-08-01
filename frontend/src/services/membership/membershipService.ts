import api from "@/lib/api";

import type {
  MembershipApiEnvelope,
  MembershipResponse,
} from "./types";

type MembershipApiResult =
  | MembershipResponse
  | MembershipApiEnvelope;

function isMembershipResponse(
  value: unknown
): value is MembershipResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const membership =
    value as Partial<MembershipResponse>;

  return (
    typeof membership.plan === "string" &&
    typeof membership.status === "string"
  );
}

export async function getMembership(): Promise<MembershipResponse> {
  const response =
    await api.get<MembershipApiResult>(
      "/membership/me"
    );

  const responseBody = response.data;

  /*
   * Supports a direct response:
   *
   * {
   *   "plan": "PREMIUM",
   *   "status": "ACTIVE"
   * }
   */
  if (isMembershipResponse(responseBody)) {
    return responseBody;
  }

  /*
   * Supports a wrapped response:
   *
   * {
   *   "success": true,
   *   "data": {
   *     "plan": "PREMIUM",
   *     "status": "ACTIVE"
   *   }
   * }
   */
  if (
    responseBody.data &&
    isMembershipResponse(responseBody.data)
  ) {
    return responseBody.data;
  }

  console.error(
    "Unexpected membership API response:",
    responseBody
  );

  throw new Error(
    responseBody.message ??
      "The membership API returned an invalid response."
  );
}