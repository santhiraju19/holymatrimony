"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bookmark,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";

import ShortlistCard from "./ShortlistCard";

import {
  shortlistService,
  type ShortlistProfile,
} from "../services/shortlist.service";

const PAGE_SIZE = 8;

export default function ShortlistList() {
  const [
    shortlists,
    setShortlists,
  ] = useState<ShortlistProfile[]>([]);

  const [page, setPage] =
    useState(0);

  const [
    totalElements,
    setTotalElements,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    hasNext,
    setHasNext,
  ] = useState(false);

  const [
    hasPrevious,
    setHasPrevious,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    removingProfileId,
    setRemovingProfileId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadShortlists =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await shortlistService.list(
            page,
            PAGE_SIZE
          );

        setShortlists(
          result.shortlists ?? []
        );

        setTotalElements(
          result.totalElements ?? 0
        );

        setTotalPages(
          result.totalPages ?? 0
        );

        setHasNext(
          result.hasNext ?? false
        );

        setHasPrevious(
          result.hasPrevious ?? false
        );
      } catch (caughtError: unknown) {
        setShortlists([]);
        setTotalElements(0);
        setTotalPages(0);
        setHasNext(false);
        setHasPrevious(false);

        setError(
          getApiErrorMessage(
            caughtError,
            "Unable to load shortlisted profiles."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [page]);

  useEffect(() => {
    void loadShortlists();
  }, [loadShortlists]);

  async function removeShortlist(
    profileId: string
  ): Promise<void> {
    if (removingProfileId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove this profile from your shortlist?"
      );

    if (!confirmed) {
      return;
    }

    setRemovingProfileId(
      profileId
    );

    try {
      await shortlistService.remove(
        profileId
      );

      setShortlists((current) =>
        current.filter(
          (item) =>
            item.profileId !==
            profileId
        )
      );

      setTotalElements((current) =>
        Math.max(0, current - 1)
      );

      if (
        shortlists.length === 1 &&
        page > 0
      ) {
        setPage(
          (current) =>
            Math.max(0, current - 1)
        );
      }

      alert(
        "Profile removed from your shortlist."
      );
    } catch (caughtError: unknown) {
      alert(
        getApiErrorMessage(
          caughtError,
          "Unable to remove this profile."
        )
      );
    } finally {
      setRemovingProfileId(null);
    }
  }

  return (
    <main className="space-y-6 pb-10">
      <section className="rounded-3xl bg-gradient-to-r from-[#0B2D5C] to-indigo-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Bookmark size={30} />

              <h1 className="text-3xl font-bold">
                My Shortlists
              </h1>
            </div>

            <p className="mt-3 text-blue-100">
              Profiles you saved for
              future consideration.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur">
            <p className="text-sm text-blue-100">
              Total shortlisted
            </p>

            <p className="text-2xl font-bold">
              {totalElements}
            </p>
          </div>
        </div>
      </section>

      <section className="flex justify-end rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            void loadShortlists()
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Unable to load shortlists
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadShortlists()
            }
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </section>
      ) : loading ? (
        <section className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2
              size={34}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 font-medium text-slate-600">
              Loading shortlists...
            </p>
          </div>
        </section>
      ) : shortlists.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Bookmark
            size={48}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            No shortlisted profiles
          </h2>

          <p className="mt-2 text-slate-500">
            Profiles you shortlist will
            appear here.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shortlists.map(
            (shortlist) => (
              <ShortlistCard
                key={shortlist.id}
                shortlist={shortlist}
                removing={
                  removingProfileId ===
                  shortlist.profileId
                }
                onRemove={(profileId) =>
                  void removeShortlist(
                    profileId
                  )
                }
              />
            )
          )}
        </section>
      )}

      {!loading &&
        !error &&
        totalPages > 1 && (
          <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <button
              type="button"
              disabled={!hasPrevious}
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    0,
                    current - 1
                  )
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-slate-600">
              Page {page + 1} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={!hasNext}
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </section>
        )}
    </main>
  );
}