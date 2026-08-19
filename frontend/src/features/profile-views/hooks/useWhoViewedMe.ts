"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getApiErrorMessage } from "@/lib/api";

import profileViewService from "../services/profileView.service";

import type {
  ProfileViewer,
  ProfileViewersPage,
} from "../types";

interface UseWhoViewedMeOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UseWhoViewedMeReturn {
  viewers: ProfileViewer[];

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

  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;

  refresh: () => Promise<void>;
}

export default function useWhoViewedMe(
  options: UseWhoViewedMeOptions = {}
): UseWhoViewedMeReturn {
  const initialPage =
    options.initialPage ?? 0;

  const pageSize =
    options.pageSize ?? 20;

  const [
    viewers,
    setViewers,
  ] = useState<ProfileViewer[]>([]);

  const [
    page,
    setPage,
  ] = useState(initialPage);

  const [size] =
    useState(pageSize);

  const [
    totalElements,
    setTotalElements,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    first,
    setFirst,
  ] = useState(true);

  const [
    last,
    setLast,
  ] = useState(true);

  const [
    hasNext,
    setHasNext,
  ] = useState(false);

  const [
    hasPrevious,
    setHasPrevious,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const applyResult =
    useCallback(
      (
        result: ProfileViewersPage
      ): void => {
        setViewers(
          result.viewers ?? []
        );

        setPage(
          result.page ?? 0
        );

        setTotalElements(
          result.totalElements ?? 0
        );

        setTotalPages(
          result.totalPages ?? 0
        );

        setFirst(
          result.first ?? true
        );

        setLast(
          result.last ?? true
        );

        setHasNext(
          result.hasNext ?? false
        );

        setHasPrevious(
          result.hasPrevious ?? false
        );
      },
      []
    );

  const load =
    useCallback(
      async (
        targetPage: number
      ): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await profileViewService
              .getWhoViewedMe({
                page: targetPage,
                size,
              });

          applyResult(result);
        } catch (
          caughtError: unknown
        ) {
          setViewers([]);
          setTotalElements(0);
          setTotalPages(0);
          setFirst(true);
          setLast(true);
          setHasNext(false);
          setHasPrevious(false);

          const message =
            getApiErrorMessage(
              caughtError,
              "Unable to load profile visitors."
            );

          setError(message);
        } finally {
          setLoading(false);
        }
      },
      [
        applyResult,
        size,
      ]
    );

  useEffect(() => {
    void load(page);
  }, [
    load,
    page,
  ]);

  const nextPage =
    useCallback((): void => {
      if (
        loading ||
        !hasNext
      ) {
        return;
      }

      setPage(
        (currentPage) =>
          currentPage + 1
      );
    }, [
      hasNext,
      loading,
    ]);

  const previousPage =
    useCallback((): void => {
      if (
        loading ||
        !hasPrevious
      ) {
        return;
      }

      setPage(
        (currentPage) =>
          Math.max(
            currentPage - 1,
            0
          )
      );
    }, [
      hasPrevious,
      loading,
    ]);

  const goToPage =
    useCallback(
      (
        targetPage: number
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

        setPage(safePage);
      },
      [
        loading,
        totalPages,
      ]
    );

  const refresh =
    useCallback(
      async (): Promise<void> => {
        await load(page);
      },
      [
        load,
        page,
      ]
    );

  return {
    viewers,

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

    nextPage,
    previousPage,
    goToPage,

    refresh,
  };
}