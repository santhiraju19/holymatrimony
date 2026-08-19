"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";

import InterestCard from "./InterestCard";

import { interestService } from "../services/interest.service";

import type {
  Interest,
  InterestStatus,
} from "../types";

type StatusFilter =
  | "ALL"
  | InterestStatus;

const PAGE_SIZE = 8;

const filters: {
  label: string;
  value: StatusFilter;
}[] = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Pending",
    value: "PENDING",
  },
  {
    label: "Accepted",
    value: "ACCEPTED",
  },
  {
    label: "Declined",
    value: "DECLINED",
  },
];

export default function ReceivedInterestList() {
  const [interests, setInterests] =
    useState<Interest[]>([]);

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [page, setPage] =
    useState(0);

  const [
    totalElements,
    setTotalElements,
  ] = useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [hasNext, setHasNext] =
    useState(false);

  const [
    hasPrevious,
    setHasPrevious,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadInterests =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await interestService.getReceived({
            page,
            size: PAGE_SIZE,
            status:
              status === "ALL"
                ? undefined
                : status,
          });

        setInterests(
          result.interests ?? []
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
        setInterests([]);
        setTotalElements(0);
        setTotalPages(0);
        setHasNext(false);
        setHasPrevious(false);

        setError(
          getApiErrorMessage(
            caughtError,
            "Unable to load received interests."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [page, status]);

  useEffect(() => {
    void loadInterests();
  }, [loadInterests]);

  function changeFilter(
    nextStatus: StatusFilter
  ): void {
    setStatus(nextStatus);
    setPage(0);
  }

  async function acceptInterest(
    interestId: string
  ): Promise<void> {
    if (updatingId) {
      return;
    }

    setUpdatingId(interestId);

    try {
      const updated =
        await interestService.accept(
          interestId
        );

      setInterests((current) =>
        current.map((interest) =>
          interest.id === interestId
            ? updated
            : interest
        )
      );

      alert(
        "Interest accepted successfully."
      );
    } catch (caughtError: unknown) {
      alert(
        getApiErrorMessage(
          caughtError,
          "Unable to accept interest."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function declineInterest(
    interestId: string
  ): Promise<void> {
    if (updatingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Decline this interest?"
      );

    if (!confirmed) {
      return;
    }

    setUpdatingId(interestId);

    try {
      const updated =
        await interestService.decline(
          interestId
        );

      setInterests((current) =>
        current.map((interest) =>
          interest.id === interestId
            ? updated
            : interest
        )
      );

      alert(
        "Interest declined successfully."
      );
    } catch (caughtError: unknown) {
      alert(
        getApiErrorMessage(
          caughtError,
          "Unable to decline interest."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="space-y-4 pb-8">

      {/* =========================================================
          Compact Premium Header
          ========================================================= */}

      <section className="overflow-hidden rounded-2xl border border-blue-900/10 bg-gradient-to-r from-[#0B2D5C] via-[#10396F] to-indigo-700 shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/15 backdrop-blur">
              <HeartHandshake size={21} />
            </div>

            <div>
              <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                Received Interests
              </h1>

              <p className="mt-0.5 text-xs leading-5 text-blue-100 sm:text-sm">
                Review members who would like
                to connect with you.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                Total
              </p>

              <p className="text-xl font-black leading-none text-white">
                {totalElements}
              </p>
            </div>

            <Inbox
              size={19}
              className="text-blue-200"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          Filter Toolbar
          ========================================================= */}

      <section className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/80 p-1">
            {filters.map((filter) => {
              const active =
                status === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    changeFilter(
                      filter.value
                    )
                  }
                  className={[
                    "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all sm:text-sm",
                    active
                      ? "bg-white text-[#0B2D5C] shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void loadInterests()
            }
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
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
        </div>
      </section>

      {/* =========================================================
          Error
          ========================================================= */}

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50/70 px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
            <RefreshCw size={20} />
          </div>

          <h2 className="mt-4 text-lg font-black text-red-800">
            Unable to load interests
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadInterests()
            }
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </section>
      ) : loading ? (

        /* =======================================================
            Loading
            ======================================================= */

        <section className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[#0B2D5C]"
            />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading interests...
            </p>
          </div>
        </section>
      ) : interests.length === 0 ? (

        /* =======================================================
            Empty State
            ======================================================= */

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-300">
            <HeartHandshake size={28} />
          </div>

          <h2 className="mt-4 text-lg font-black text-slate-800">
            No interests found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            There are no interests matching
            the selected filter.
          </p>
        </section>
      ) : (

        /* =======================================================
            Interest Cards
            ======================================================= */

        <section className="space-y-3">
          {interests.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              updating={
                updatingId ===
                interest.id
              }
              onAccept={(id) =>
                void acceptInterest(id)
              }
              onDecline={(id) =>
                void declineInterest(id)
              }
            />
          ))}
        </section>
      )}

      {/* =========================================================
          Pagination
          ========================================================= */}

      {!loading &&
        !error &&
        totalPages > 1 && (
          <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft size={16} />

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
              disabled={!hasNext}
              onClick={() =>
                setPage((current) =>
                  current + 1
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight size={16} />
            </button>
          </section>
        )}
    </main>
  );
}
