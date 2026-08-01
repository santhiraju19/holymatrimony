
import api from "@/lib/api";

import {
  ApiResponse,
  PrivacySettings,
  UpdatePrivacySettingsRequest,
} from "@/features/privacy/types";

export const privacyService = {
  async getMySettings(): Promise<PrivacySettings> {
    const response = await api.get<
      ApiResponse<PrivacySettings>
    >("/privacy/me");

    return response.data.data;
  },

  async updateMySettings(
    request: UpdatePrivacySettingsRequest
  ): Promise<PrivacySettings> {
    const response = await api.put<
      ApiResponse<PrivacySettings>
    >(
      "/privacy/me",
      request
    );

    return response.data.data;
  },
};

export default privacyService;