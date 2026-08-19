"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getApiErrorMessage,
} from "@/lib/api";

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

  goToPage: (
    page: number
  ) => void;

  refresh: () => Promise<void>;
}

function createEmptyFilters():
BrowseSearchFilters {

  return {
    ...EMPTY_BROWSE_SEARCH_FILTERS,
  };
}

export default function useBrowseProfiles(
  options: UseBrowseProfilesOptions = {}
): UseBrowseProfilesReturn {

  const initialPage =
    options.initialPage ??
    0;

  const pageSize =
    options.pageSize ??
    12;

  const [
    profiles,
    setProfiles,
  ] =
    useState<
      BrowseProfile[]
    >([]);

  const [
    filters,
    setFilters,
  ] =
    useState<
      BrowseSearchFilters
    >(
      createEmptyFilters
    );

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<
      BrowseSearchFilters
    >(
      createEmptyFilters
    );

  const [
    page,
    setPage,
  ] =
    useState(
      initialPage
    );

  const [
    size,
  ] =
    useState(
      pageSize
    );

  const [
    totalElements,
    setTotalElements,
  ] =
    useState(0);

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(0);

  const [
    first,
    setFirst,
  ] =
    useState(true);

  const [
    last,
    setLast,
  ] =
    useState(true);

  const [
    hasNext,
    setHasNext,
  ] =
    useState(false);

  const [
    hasPrevious,
    setHasPrevious,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const isFiltering =
    hasActiveBrowseFilters(
      appliedFilters
    );

  /*
   * ============================================================
   * APPLY API RESULT
   * ============================================================
   */

  const applyResult =
    useCallback(
      (
        result:
          BrowseProfilesResult
      ): void => {

        setProfiles(
          result.profiles ??
            []
        );

        setPage(
          result.page ??
            0
        );

        setTotalElements(
          result.totalElements ??
            0
        );

        setTotalPages(
          result.totalPages ??
            0
        );

        setFirst(
          result.first ??
            true
        );

        setLast(
          result.last ??
            true
        );

        setHasNext(
          result.hasNext ??
            false
        );

        setHasPrevious(
          result.hasPrevious ??
            false
        );
      },
      []
    );

  /*
   * ============================================================
   * RESET RESULT METADATA
   * ============================================================
   */

  const clearResults =
    useCallback(
      (): void => {

        setProfiles([]);

        setTotalElements(0);

        setTotalPages(0);

        setFirst(true);

        setLast(true);

        setHasNext(false);

        setHasPrevious(false);
      },
      []
    );

  /*
   * ============================================================
   * LOAD PROFILES
   * ============================================================
   *
   * Normal browsing:
   *
   * GET /profiles
   *
   * Advanced filtered search:
   *
   * GET /profiles/search
   *
   * The backend remains the source of truth for membership
   * entitlement enforcement.
   */

  const loadProfiles =
    useCallback(
      async (
        targetPage: number,

        activeFilters:
          BrowseSearchFilters
      ): Promise<void> => {

        setLoading(true);

        setError(null);

        try {

          const hasFilters =
            hasActiveBrowseFilters(
              activeFilters
            );

          const result =
            hasFilters
              ? await searchBrowseProfiles(
                  buildBrowseSearchParams(
                    activeFilters,
                    {
                      page:
                        targetPage,

                      size,
                    }
                  )
                )
              : await getBrowseProfiles(
                  {
                    page:
                      targetPage,

                    size,
                  }
                );

          applyResult(
            result
          );

        } catch (
          caughtError:
            unknown
        ) {

          clearResults();

          /*
           * IMPORTANT:
           *
           * Do not use:
           *
           * caughtError instanceof Error
           *     ? caughtError.message
           *
           * Axios would reduce a useful backend 403 response to:
           *
           * "Request failed with status code 403"
           *
           * getApiErrorMessage() extracts the application's
           * response body instead, including membership messages
           * such as:
           *
           * "Upgrade your membership to access advanced search."
           */
          const message =
            getApiErrorMessage(
              caughtError,
              "Unable to load profiles."
            );

          setError(
            message
          );

        } finally {

          setLoading(false);
        }
      },
      [
        applyResult,
        clearResults,
        size,
      ]
    );

  /*
   * ============================================================
   * INITIAL LOAD / PAGE CHANGE / FILTER CHANGE
   * ============================================================
   */

  useEffect(
    () => {

      void loadProfiles(
        page,
        appliedFilters
      );

    },
    [
      page,
      appliedFilters,
      loadProfiles,
    ]
  );

  /*
   * ============================================================
   * UPDATE DRAFT FILTER
   * ============================================================
   */

  const updateFilter =
    useCallback(
      (
        name:
          keyof BrowseSearchFilters,

        value:
          string
      ): void => {

        setFilters(
          (
            currentFilters
          ) => ({
            ...currentFilters,

            [name]:
              value,
          })
        );
      },
      []
    );

  /*
   * ============================================================
   * APPLY FILTERS
   * ============================================================
   */

  const applyFilters =
    useCallback(
      (): void => {

        const nextFilters = {
          ...filters,
        };

        if (
          page ===
          0
        ) {

          setAppliedFilters(
            nextFilters
          );

          return;
        }

        setPage(0);

        setAppliedFilters(
          nextFilters
        );
      },
      [
        filters,
        page,
      ]
    );

  /*
   * ============================================================
   * RESET FILTERS
   * ============================================================
   */

  const resetFilters =
    useCallback(
      (): void => {

        const emptyFilters =
          createEmptyFilters();

        setFilters(
          emptyFilters
        );

        setError(
          null
        );

        if (
          page ===
          0
        ) {

          setAppliedFilters({
            ...emptyFilters,
          });

          return;
        }

        setPage(0);

        setAppliedFilters({
          ...emptyFilters,
        });
      },
      [
        page,
      ]
    );

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const nextPage =
    useCallback(
      (): void => {

        if (
          loading ||
          !hasNext
        ) {
          return;
        }

        setPage(
          (
            currentPage
          ) =>
            currentPage +
            1
        );
      },
      [
        hasNext,
        loading,
      ]
    );

  const previousPage =
    useCallback(
      (): void => {

        if (
          loading ||
          !hasPrevious
        ) {
          return;
        }

        setPage(
          (
            currentPage
          ) =>
            Math.max(
              currentPage -
                1,
              0
            )
        );
      },
      [
        hasPrevious,
        loading,
      ]
    );

  const goToPage =
    useCallback(
      (
        targetPage:
          number
      ): void => {

        if (
          loading
        ) {
          return;
        }

        const maximumPage =
          Math.max(
            totalPages -
              1,
            0
          );

        const safePage =
          Math.min(
            Math.max(
              targetPage,
              0
            ),
            maximumPage
          );

        setPage(
          safePage
        );
      },
      [
        loading,
        totalPages,
      ]
    );

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const refresh =
    useCallback(
      async (): Promise<void> => {

        await loadProfiles(
          page,
          appliedFilters
        );
      },
      [
        appliedFilters,
        loadProfiles,
        page,
      ]
    );

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
