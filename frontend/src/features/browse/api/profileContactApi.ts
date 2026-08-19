import api from "@/lib/api";

export interface ProfileContact {
  profileId: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
  mobileVerified: boolean;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export async function getProfileContact(
  profileId: string
): Promise<ProfileContact> {
  const response =
    await api.get<
      ApiEnvelope<ProfileContact> |
      ProfileContact
    >(
      `/profiles/${profileId}/contact`
    );

  const payload =
    response.data;

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }

  return payload as ProfileContact;
}
