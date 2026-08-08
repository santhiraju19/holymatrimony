import api from "@/lib/api";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface ShortlistStatus {
  profileId: string;
  shortlisted: boolean;
  shortlistId?: string | null;
}

export interface ShortlistProfile {
  id: string;
  profileId: string;
  userId: string;
  fullName: string;
  gender?: string | null;
  age?: number | null;
  maritalStatus?: string | null;
  denomination?: string | null;
  churchName?: string | null;
  highestEducation?: string | null;
  profession?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  completionPercentage?: number | null;
  primaryPhotoId?: string | null;
  primaryPhotoUrl?: string | null;
  createdAt: string;
}

export interface ShortlistPage {
  shortlists: ShortlistProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ShortlistCount {
  totalShortlisted: number;
}

function validateProfileId(
  profileId: string
): string {
  const normalizedProfileId =
    profileId.trim();

  if (!normalizedProfileId) {
    throw new Error(
      "Profile ID is required."
    );
  }

  return normalizedProfileId;
}

export const shortlistService = {
  async add(
    profileId: string
  ): Promise<ShortlistProfile> {
    const normalizedProfileId =
      validateProfileId(profileId);

    const response = await api.post<
      ApiEnvelope<ShortlistProfile>
    >(
      `/shortlists/${normalizedProfileId}`
    );

    return response.data.data;
  },

  async remove(
    profileId: string
  ): Promise<void> {
    const normalizedProfileId =
      validateProfileId(profileId);

    await api.delete(
      `/shortlists/${normalizedProfileId}`
    );
  },

  async getStatus(
    profileId: string
  ): Promise<ShortlistStatus> {
    const normalizedProfileId =
      validateProfileId(profileId);

    const response = await api.get<
      ApiEnvelope<ShortlistStatus>
    >(
      `/shortlists/${normalizedProfileId}/status`
    );

    return response.data.data;
  },

  async list(
    page = 0,
    size = 12
  ): Promise<ShortlistPage> {
    const response = await api.get<
      ApiEnvelope<ShortlistPage>
    >("/shortlists", {
      params: {
        page,
        size,
      },
    });

    return response.data.data;
  },

  async getCount(): Promise<ShortlistCount> {
    const response = await api.get<
      ApiEnvelope<ShortlistCount>
    >("/shortlists/count");

    return response.data.data;
  },
};