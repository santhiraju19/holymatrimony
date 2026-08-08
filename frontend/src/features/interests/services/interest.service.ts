import api from "@/lib/api";

import type {
  Interest,
  InterestCount,
  InterestPage,
  InterestStatus,
} from "../types";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

interface SendInterestPayload {
  receiverProfileId: string;
  message?: string;
}

interface InterestListParams {
  page?: number;
  size?: number;
  status?: InterestStatus;
}

function validateId(
  value: string,
  label: string
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

export const interestService = {
  async send(
    receiverProfileId: string,
    message?: string
  ): Promise<Interest> {
    const profileId = validateId(
      receiverProfileId,
      "Receiver profile ID"
    );

    const payload: SendInterestPayload = {
      receiverProfileId: profileId,
    };

    if (message?.trim()) {
      payload.message = message.trim();
    }

    const response = await api.post<
      ApiEnvelope<Interest>
    >("/interests", payload);

    return response.data.data;
  },

  async getReceived(
    params: InterestListParams = {}
  ): Promise<InterestPage> {
    const response = await api.get<
      ApiEnvelope<InterestPage>
    >("/interests/received", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 12,
        status: params.status,
      },
    });

    return response.data.data;
  },

  async getSent(
    params: InterestListParams = {}
  ): Promise<InterestPage> {
    const response = await api.get<
      ApiEnvelope<InterestPage>
    >("/interests/sent", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 12,
        status: params.status,
      },
    });

    return response.data.data;
  },

  async accept(
    interestId: string
  ): Promise<Interest> {
    const id = validateId(
      interestId,
      "Interest ID"
    );

    const response = await api.post<
      ApiEnvelope<Interest>
    >(`/interests/${id}/accept`);

    return response.data.data;
  },

  async decline(
    interestId: string
  ): Promise<Interest> {
    const id = validateId(
      interestId,
      "Interest ID"
    );

    const response = await api.post<
      ApiEnvelope<Interest>
    >(`/interests/${id}/decline`);

    return response.data.data;
  },

  async withdraw(
    interestId: string
  ): Promise<void> {
    const id = validateId(
      interestId,
      "Interest ID"
    );

    await api.delete(`/interests/${id}`);
  },

  async getPendingCount(): Promise<InterestCount> {
    const response = await api.get<
      ApiEnvelope<InterestCount>
    >("/interests/pending-count");

    return response.data.data;
  },
};