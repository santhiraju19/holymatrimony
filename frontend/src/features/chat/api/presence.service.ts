import api from "@/lib/api";

export interface PresenceStatus {
  userId: string;
  online: boolean;
  lastSeenAt: string | null;
}

class PresenceService {
  async getPresence(
    userId: string
  ): Promise<PresenceStatus> {
    const response =
      await api.get<PresenceStatus>(
        `/presence/${userId}`
      );

    return response.data;
  }
}

const presenceService =
  new PresenceService();

export default presenceService;