"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
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
            Math.max(
              0,
              current - 1
            )
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
    <main className="space-y-4 pb-8">

      {/* Compact premium header */}
      <section className="overflow-hidden rounded-2xl border border-blue-900/10 bg-gradient-to-r from-[#0B2D5C] via-[#10396F] to-indigo-700 shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/15 backdrop-blur">
              <Bookmark size={20} />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                My Shortlists
              </h1>

              <p className="mt-0.5 text-xs leading-5 text-blue-100 sm:text-sm">
                Profiles you saved for future consideration.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                Saved
              </p>

              <p className="text-xl font-black leading-none text-white">
                {totalElements}
              </p>
            </div>

            <Bookmark
              size={18}
              className="text-amber-200"
            />
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="flex justify-end rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm sm:px-4">
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            void loadShortlists()
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          <RefreshCw
            size={15}
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
        <section className="rounded-2xl border border-red-200 bg-red-50/70 px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
            <RefreshCw size={20} />
          </div>

          <h2 className="mt-4 text-lg font-black text-red-800">
            Unable to load shortlists
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadShortlists()
            }
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </section>
      ) : loading ? (
        <section className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[#0B2D5C]"
            />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading shortlists...
            </p>
          </div>
        </section>
      ) : shortlists.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-400">
            <Bookmark size={28} />
          </div>

          <h2 className="mt-4 text-lg font-black text-slate-800">
            No shortlisted profiles
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Profiles you shortlist will appear here.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shortlists.map(
            (shortlist) => (
              <ShortlistCard
                key={
                  shortlist.id
                }
                shortlist={
                  shortlist
                }
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
          <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
            <button
              type="button"
              disabled={
                !hasPrevious
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      0,
                      current - 1
                    )
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft
                size={16}
              />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:text-sm">
              Page{" "}
              <span className="text-[#0B2D5C]">
                {page + 1}
              </span>{" "}
              of {totalPages}
            </div>

            <button
              type="button"
              disabled={
                !hasNext
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight
                size={16}
              />
            </button>
          </section>
        )}
    </main>
  );
}
