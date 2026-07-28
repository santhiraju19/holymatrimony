import axios from "axios";

import api from "@/lib/api";

import {
  ApiResponse,
  BrowseProfile,
  BrowseProfilesData,
  BrowseProfilesParams,
  BrowseProfilesResult,
} from "../types";

const DEFAULT_PAGE_SIZE = 12;

function createEmptyResult(
  page = 0,
  size = DEFAULT_PAGE_SIZE
): BrowseProfilesResult {
  return {
    profiles: [],
    page,
    size,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  };
}

export async function getBrowseProfiles(
  params: BrowseProfilesParams = {}
): Promise<BrowseProfilesResult> {
  const {
    page = 0,
    size = DEFAULT_PAGE_SIZE,
    sortBy,
    sortDirection,
  } = params;

  try {
    const response = await api.get<
      ApiResponse<BrowseProfilesData>
    >("/profiles", {
      params: {
        page,
        size,
        ...(sortBy ? { sortBy } : {}),
        ...(sortDirection ? { sortDirection } : {}),
      },
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Unable to load profiles."
      );
    }

    const data = response.data.data;

    if (!data) {
      return createEmptyResult(page, size);
    }

    return {
      profiles: data.profiles ?? [],
      page: data.page ?? page,
      size: data.size ?? size,
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      first: data.first ?? page === 0,
      last: data.last ?? true,
      hasNext: data.hasNext ?? false,
      hasPrevious: data.hasPrevious ?? page > 0,
    };
  } catch (error) {
    throw new Error(getBrowseApiErrorMessage(error));
  }
}

export async function getBrowseProfileById(
  profileId: string
): Promise<BrowseProfile> {
  if (!profileId.trim()) {
    throw new Error("Profile ID is required.");
  }

  try {
    const response = await api.get<
      ApiResponse<BrowseProfile>
    >(`/profiles/${profileId}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Unable to load the profile."
      );
    }

    if (!response.data.data) {
      throw new Error("Profile was not found.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getBrowseApiErrorMessage(error));
  }
}

function getBrowseApiErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string;
          error?: string;
        }
      | undefined;

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    switch (error.response?.status) {
      case 400:
        return "The profile request is invalid.";

      case 401:
        return "Your session has expired. Please log in again.";

      case 403:
        return "You are not allowed to view these profiles.";

      case 404:
        return "The requested profile was not found.";

      case 500:
        return "The server could not load profiles. Please try again.";

      default:
        if (error.code === "ECONNABORTED") {
          return "The request timed out. Please try again.";
        }

        if (!error.response) {
          return "Unable to connect to the server.";
        }

        return "Unable to load profiles.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}