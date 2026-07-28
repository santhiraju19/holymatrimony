
import api from "@/lib/api";

import {
  MembershipResponse,
  UpgradeMembershipRequest,
} from "./types";

export async function getMembership(): Promise<MembershipResponse> {
  const response =
    await api.get<MembershipResponse>(
      "/membership/me"
    );

  return response.data;
}

export async function upgradeMembership(
  request: UpgradeMembershipRequest
) {
  const response = await api.post(
    "/membership/upgrade",
    request
  );

  return response.data;
}