import api from "@/lib/api";

import type {
  ApiResponse,
  ProfileViewersPage,
} from "../types";

interface GetWhoViewedMeParams {
  page?: number;
  size?: number;
}

async function getWhoViewedMe({
  page = 0,
  size = 20,
}: GetWhoViewedMeParams = {}): Promise<ProfileViewersPage> {
  const response =
    await api.get<
      ApiResponse<ProfileViewersPage>
    >(
      "/profile-views/who-viewed-me",
      {
        params: {
          page,
          size,
        },
      }
    );

  return response.data.data;
}

export const profileViewService = {
  getWhoViewedMe,
};

export default profileViewService;