import api from "@/lib/api";

import type {
  CreateSavedSearchRequest,
  SavedSearch,
  SavedSearchAlertFrequency,
  UpdateSavedSearchAlertsRequest,
} from "../types";

interface ApiEnvelope<T> {
  success?: boolean;

  message?: string;

  data: T;
}

function unwrap<T>(
  response:
    | ApiEnvelope<T>
    | T
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (
      response as ApiEnvelope<T>
    ).data;
  }

  return response as T;
}

export async function getSavedSearches():
Promise<SavedSearch[]> {
  const response =
    await api.get<
      | ApiEnvelope<SavedSearch[]>
      | SavedSearch[]
    >(
      "/saved-searches"
    );

  return unwrap(
    response.data
  );
}

export async function getSavedSearch(
  savedSearchId: string
): Promise<SavedSearch> {
  const response =
    await api.get<
      | ApiEnvelope<SavedSearch>
      | SavedSearch
    >(
      `/saved-searches/${savedSearchId}`
    );

  return unwrap(
    response.data
  );
}

export async function createSavedSearch(
  request:
    CreateSavedSearchRequest
): Promise<SavedSearch> {
  const response =
    await api.post<
      | ApiEnvelope<SavedSearch>
      | SavedSearch
    >(
      "/saved-searches",
      request
    );

  return unwrap(
    response.data
  );
}

export async function updateSavedSearch(
  savedSearchId: string,
  request:
    CreateSavedSearchRequest
): Promise<SavedSearch> {
  const response =
    await api.put<
      | ApiEnvelope<SavedSearch>
      | SavedSearch
    >(
      `/saved-searches/${savedSearchId}`,
      request
    );

  return unwrap(
    response.data
  );
}

export async function deleteSavedSearch(
  savedSearchId: string
): Promise<void> {
  await api.delete(
    `/saved-searches/${savedSearchId}`
  );
}

export async function setDefaultSavedSearch(
  savedSearchId: string
): Promise<SavedSearch> {
  const response =
    await api.put<
      | ApiEnvelope<SavedSearch>
      | SavedSearch
    >(
      `/saved-searches/${savedSearchId}/default`
    );

  return unwrap(
    response.data
  );
}

export async function updateSavedSearchAlerts(
  savedSearchId: string,
  enabled: boolean,
  frequency:
    SavedSearchAlertFrequency =
      "DAILY"
): Promise<SavedSearch> {
  const payload:
    UpdateSavedSearchAlertsRequest =
    {
      enabled,
      frequency,
    };

  const response =
    await api.put<
      | ApiEnvelope<SavedSearch>
      | SavedSearch
    >(
      `/saved-searches/${savedSearchId}/alerts`,
      payload
    );

  return unwrap(
    response.data
  );
}