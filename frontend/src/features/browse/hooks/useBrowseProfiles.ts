"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getBrowseProfiles } from "../api/browseApi";

import {
  BrowseProfile,
  BrowseProfilesResult,
} from "../types";

interface UseBrowseProfilesOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseBrowseProfilesReturn {
  profiles: BrowseProfile[];

  page: number;
  pageSize: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;

  hasNext: boolean;
  hasPrevious: boolean;

  loading: boolean;
  error: string | null;

  loadProfiles: (
    requestedPage?: number
  ) => Promise<void>;

  nextPage: () => void;
  previousPage: () => void;
  goToPage: (pageNumber: number) => void;

  refresh: () => Promise<void>;
}

const EMPTY_RESULT: BrowseProfilesResult = {
  profiles: [],
  page: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
};

export function useBrowseProfiles(
  options: UseBrowseProfilesOptions = {}
): UseBrowseProfilesReturn {
  const {
    initialPage = 0,
    pageSize = 12,
    autoLoad = true,
  } = options;

  const [result, setResult] =
    useState<BrowseProfilesResult>({
      ...EMPTY_RESULT,
      page: initialPage,
      size: pageSize,
    });

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadProfiles = useCallback(
    async (requestedPage = initialPage) => {
      setLoading(true);
      setError(null);

      try {
        const browseResult =
          await getBrowseProfiles({
            page: requestedPage,
            size: pageSize,
          });

        setResult(browseResult);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load profiles.";

        setError(message);

        setResult((current) => ({
          ...current,
          profiles: [],
        }));
      } finally {
        setLoading(false);
      }
    },
    [initialPage, pageSize]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadProfiles(initialPage);
  }, [
    autoLoad,
    initialPage,
    loadProfiles,
  ]);

  const nextPage = useCallback(() => {
    if (!result.hasNext || loading) {
      return;
    }

    void loadProfiles(result.page + 1);
  }, [
    loadProfiles,
    loading,
    result.hasNext,
    result.page,
  ]);

  const previousPage = useCallback(() => {
    if (!result.hasPrevious || loading) {
      return;
    }

    void loadProfiles(
      Math.max(0, result.page - 1)
    );
  }, [
    loadProfiles,
    loading,
    result.hasPrevious,
    result.page,
  ]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (loading) {
        return;
      }

      const safePage = Math.max(
        0,
        Math.min(
          pageNumber,
          Math.max(0, result.totalPages - 1)
        )
      );

      void loadProfiles(safePage);
    },
    [
      loadProfiles,
      loading,
      result.totalPages,
    ]
  );

  const refresh = useCallback(async () => {
    await loadProfiles(result.page);
  }, [loadProfiles, result.page]);

  return {
    profiles: result.profiles,

    page: result.page,
    pageSize: result.size,

    totalElements: result.totalElements,
    totalPages: result.totalPages,

    first: result.first,
    last: result.last,

    hasNext: result.hasNext,
    hasPrevious: result.hasPrevious,

    loading,
    error,

    loadProfiles,
    nextPage,
    previousPage,
    goToPage,
    refresh,
  };
}

export default useBrowseProfiles;