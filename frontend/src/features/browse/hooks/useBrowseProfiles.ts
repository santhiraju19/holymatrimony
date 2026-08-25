"use client";

import {
  useCallback,
  useEffect,
  useMemo,
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
  BrowseSearchLocation,
} from "../types";

export type BrowseLocationMode =
  | "ANYWHERE"
  | "CUSTOM"
  | "PARTNER_PREFERENCES";

interface UseBrowseProfilesOptions {
  initialPage?: number;
  pageSize?: number;

  initialFilters?:
    Partial<BrowseSearchFilters>;

  locationMode?: BrowseLocationMode;

  preferredLocations?:
    BrowseSearchLocation[];
}

interface UseBrowseProfilesReturn {
  profiles: BrowseProfile[];

  filters: BrowseSearchFilters;

  appliedFilters:
    BrowseSearchFilters;

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
    name:
      keyof BrowseSearchFilters,
    value: string
  ) => void;

  applyFilters: () => void;

  resetFilters: () => void;

  nextPage: () => void;

  previousPage: () => void;

  goToPage: (
    page: number
  ) => void;

  refresh:
    () => Promise<void>;
}

function createEmptyFilters():
BrowseSearchFilters {
  return {
    ...EMPTY_BROWSE_SEARCH_FILTERS,
  };
}

function createInitialFilters(
  initialFilters:
    | Partial<BrowseSearchFilters>
    | undefined
): BrowseSearchFilters {
  return {
    ...EMPTY_BROWSE_SEARCH_FILTERS,
    ...(initialFilters ?? {}),
  };
}

function hasUsableLocation(
  location:
    | BrowseSearchLocation
    | null
    | undefined
): boolean {
  if (!location) {
    return false;
  }

  return Boolean(
    location.country?.trim() ||
    location.state?.trim() ||
    location.district?.trim() ||
    location.city?.trim()
  );
}

function normalizeLocations(
  locations:
    | BrowseSearchLocation[]
    | undefined
): BrowseSearchLocation[] {
  return (
    locations ??
    []
  )
    .filter(
      hasUsableLocation
    )
    .map(
      (location) => ({
        country:
          location.country?.trim() ??
          "",

        state:
          location.state?.trim() ??
          "",

        district:
          location.district?.trim() ??
          "",

        city:
          location.city?.trim() ??
          "",
      })
    );
}

export default function useBrowseProfiles(
  options:
    UseBrowseProfilesOptions = {}
): UseBrowseProfilesReturn {
  const initialPage =
    options.initialPage ?? 0;

  const pageSize =
    options.pageSize ?? 12;

  const locationMode =
    options.locationMode ??
    "CUSTOM";

  const rawPreferredLocations =
    options.preferredLocations;

  const preferredLocations =
    useMemo(
      () =>
        normalizeLocations(
          rawPreferredLocations
        ),
      [
        rawPreferredLocations,
      ]
    );

  const [
    filters,
    setFilters,
  ] =
    useState<
      BrowseSearchFilters
    >(() =>
      createInitialFilters(
        options.initialFilters
      )
    );

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<
      BrowseSearchFilters
    >(() =>
      createInitialFilters(
        options.initialFilters
      )
    );

  const [
    profiles,
    setProfiles,
  ] =
    useState<
      BrowseProfile[]
    >([]);

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

  const partnerLocationFiltering =
    locationMode ===
      "PARTNER_PREFERENCES" &&
    preferredLocations.length > 0;

  const isFiltering =
    hasActiveBrowseFilters(
      appliedFilters
    ) ||
    partnerLocationFiltering;

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
          result.page ?? 0
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
          const normalFiltersActive =
            hasActiveBrowseFilters(
              activeFilters
            );

          const usePartnerLocations =
            locationMode ===
              "PARTNER_PREFERENCES" &&
            preferredLocations.length >
              0;

          const searchParams =
            buildBrowseSearchParams(
              activeFilters,
              {
                page:
                  targetPage,

                size,
              }
            );

          if (
            locationMode ===
            "PARTNER_PREFERENCES"
          ) {
            /*
             * Structured preferredLocations[]
             * becomes the complete location
             * source for this mode.
             */

            searchParams.country =
              undefined;

            searchParams.state =
              undefined;

            searchParams.district =
              undefined;

            searchParams.city =
              undefined;

            searchParams.locations =
              preferredLocations;

          } else if (
            locationMode ===
            "ANYWHERE"
          ) {
            searchParams.country =
              undefined;

            searchParams.state =
              undefined;

            searchParams.district =
              undefined;

            searchParams.city =
              undefined;

            searchParams.locations =
              undefined;

          } else {
            /*
             * CUSTOM location uses the normal
             * scalar Country / State /
             * District / City controls.
             */

            searchParams.locations =
              undefined;
          }

          const shouldSearch =
            normalFiltersActive ||
            usePartnerLocations;

          const result =
            shouldSearch
              ? await searchBrowseProfiles(
                  searchParams
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
        locationMode,
        preferredLocations,
        size,
      ]
    );

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

  const applyFilters =
    useCallback(
      (): void => {
        const nextFilters = {
          ...filters,
        };

        if (
          page === 0
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

  const resetFilters =
    useCallback(
      (): void => {
        const emptyFilters =
          createEmptyFilters();

        setFilters(
          emptyFilters
        );

        setError(null);

        if (
          page === 0
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
            currentPage + 1
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
              currentPage - 1,
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
        if (loading) {
          return;
        }

        const maximumPage =
          Math.max(
            totalPages - 1,
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
