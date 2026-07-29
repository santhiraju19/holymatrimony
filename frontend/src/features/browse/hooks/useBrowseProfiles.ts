"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getBrowseProfiles,
  searchBrowseProfiles,
} from "../api/browseApi";

import {
  buildBrowseSearchParams,
  EMPTY_BROWSE_SEARCH_FILTERS,
  hasActiveBrowseFilters,
} from "../types";

import type {
  BrowseProfile,
  BrowseProfilesResult,
  BrowseSearchFilters,
} from "../types";

interface UseBrowseProfilesOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UseBrowseProfilesReturn {
  profiles: BrowseProfile[];
  filters: BrowseSearchFilters;
  appliedFilters: BrowseSearchFilters;

  page: number;
  size: number;
  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;

  loading: boolean;
  error: string | null;
  isFiltering: boolean;

  updateFilter: (
    name: keyof BrowseSearchFilters,
    value: string
  ) => void;

  applyFilters: () => void;
  resetFilters: () => void;

  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;

  refresh: () => Promise<void>;
}

function createEmptyFilters(): BrowseSearchFilters {
  return { ...EMPTY_BROWSE_SEARCH_FILTERS };
}

export default function useBrowseProfiles(
  options: UseBrowseProfilesOptions = {}
): UseBrowseProfilesReturn {
  const initialPage = options.initialPage ?? 0;
  const pageSize = options.pageSize ?? 12;

  const [profiles, setProfiles] = useState<BrowseProfile[]>([]);
  const [filters, setFilters] = useState<BrowseSearchFilters>(
    createEmptyFilters
  );
  const [appliedFilters, setAppliedFilters] =
    useState<BrowseSearchFilters>(createEmptyFilters);

  const [page, setPage] = useState(initialPage);
  const [size] = useState(pageSize);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFiltering = hasActiveBrowseFilters(appliedFilters);

  const applyResult = useCallback(
    (result: BrowseProfilesResult): void => {
      setProfiles(result.profiles ?? []);
      setPage(result.page ?? 0);
      setTotalElements(result.totalElements ?? 0);
      setTotalPages(result.totalPages ?? 0);
      setFirst(result.first ?? true);
      setLast(result.last ?? true);
      setHasNext(result.hasNext ?? false);
      setHasPrevious(result.hasPrevious ?? false);
    },
    []
  );

  const loadProfiles = useCallback(
    async (
      targetPage: number,
      activeFilters: BrowseSearchFilters
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = hasActiveBrowseFilters(activeFilters)
          ? await searchBrowseProfiles(
              buildBrowseSearchParams(activeFilters, {
                page: targetPage,
                size,
              })
            )
          : await getBrowseProfiles({
              page: targetPage,
              size,
            });

        applyResult(result);
      } catch (caughtError: unknown) {
        setProfiles([]);
        setTotalElements(0);
        setTotalPages(0);
        setFirst(true);
        setLast(true);
        setHasNext(false);
        setHasPrevious(false);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load profiles."
        );
      } finally {
        setLoading(false);
      }
    },
    [applyResult, size]
  );

  useEffect(() => {
    void loadProfiles(page, appliedFilters);
  }, [page, appliedFilters, loadProfiles]);

  const updateFilter = useCallback(
    (
      name: keyof BrowseSearchFilters,
      value: string
    ): void => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        [name]: value,
      }));
    },
    []
  );

  const applyFilters = useCallback((): void => {
    const nextFilters = { ...filters };

    if (page === 0) {
      setAppliedFilters(nextFilters);
      return;
    }

    setPage(0);
    setAppliedFilters(nextFilters);
  }, [filters, page]);

  const resetFilters = useCallback((): void => {
    const emptyFilters = createEmptyFilters();

    setFilters(emptyFilters);

    if (page === 0) {
      setAppliedFilters({ ...emptyFilters });
      return;
    }

    setPage(0);
    setAppliedFilters({ ...emptyFilters });
  }, [page]);

  const nextPage = useCallback((): void => {
    if (loading || !hasNext) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  }, [hasNext, loading]);

  const previousPage = useCallback((): void => {
    if (loading || !hasPrevious) {
      return;
    }

    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }, [hasPrevious, loading]);

  const goToPage = useCallback(
    (targetPage: number): void => {
      if (loading) {
        return;
      }

      const maximumPage = Math.max(totalPages - 1, 0);
      const safePage = Math.min(
        Math.max(targetPage, 0),
        maximumPage
      );

      setPage(safePage);
    },
    [loading, totalPages]
  );

  const refresh = useCallback(async (): Promise<void> => {
    await loadProfiles(page, appliedFilters);
  }, [appliedFilters, loadProfiles, page]);

  return {
    profiles,
    filters,
    appliedFilters,

    page,
    size,
    totalElements,
    totalPages,

    first,
    last,
    hasNext,
    hasPrevious,

    loading,
    error,
    isFiltering,

    updateFilter,
    applyFilters,
    resetFilters,

    nextPage,
    previousPage,
    goToPage,

    refresh,
  };
}