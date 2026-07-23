import axios from "axios";
import {
  MembershipResponse,
  UpgradeMembershipRequest,
} from "./types";

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

export async function getMembership() {
  const token = localStorage.getItem("token");

  const response = await axios.get<MembershipResponse>(
    `${API}/membership/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function upgradeMembership(
  request: UpgradeMembershipRequest
) {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API}/membership/upgrade`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}