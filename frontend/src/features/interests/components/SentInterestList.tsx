"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";

import SentInterestCard from "./SentInterestCard";

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

export default function SentInterestList() {
  const [interests, setInterests] =
    useState<Interest[]>([]);

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [page, setPage] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [hasNext, setHasNext] =
    useState(false);

  const [hasPrevious, setHasPrevious] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    withdrawingId,
    setWithdrawingId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadInterests =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await interestService.getSent({
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
            "Unable to load sent interests."
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

  async function withdrawInterest(
    interestId: string
  ): Promise<void> {
    if (withdrawingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Withdraw this pending interest?"
      );

    if (!confirmed) {
      return;
    }

    setWithdrawingId(interestId);

    try {
      await interestService.withdraw(
        interestId
      );

      setInterests((current) =>
        current.filter(
          (interest) =>
            interest.id !== interestId
        )
      );

      setTotalElements((current) =>
        Math.max(0, current - 1)
      );

      alert(
        "Interest withdrawn successfully."
      );

      if (interests.length === 1) {
        await loadInterests();
      }
    } catch (caughtError: unknown) {
      alert(
        getApiErrorMessage(
          caughtError,
          "Unable to withdraw interest."
        )
      );
    } finally {
      setWithdrawingId(null);
    }
  }

  return (
    <main className="space-y-4 pb-8">
      <section className="rounded-2xl bg-gradient-to-r from-[#0B2D5C] to-indigo-700 px-5 py-5 text-white shadow-md sm:px-6 sm:py-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Send size={24} />

              <h1 className="text-xl font-black sm:text-2xl">
                Sent Interests
              </h1>
            </div>

            <p className="mt-1.5 text-sm text-blue-100">
              Track the interests you have
              sent to other members.
            </p>
          </div>

          <div className="rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur">
            <p className="text-sm text-blue-100">
              Total sent
            </p>

            <p className="text-xl font-black">
              {totalElements}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  changeFilter(filter.value)
                }
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  status === filter.value
                    ? "bg-[#0B2D5C] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void loadInterests()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
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
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Unable to load interests
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadInterests()
            }
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </section>
      ) : loading ? (
        <section className="flex min-h-[190px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2
              size={34}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 font-medium text-slate-600">
              Loading sent interests...
            </p>
          </div>
        </section>
      ) : interests.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Send
            size={48}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            No sent interests found
          </h2>

          <p className="mt-2 text-slate-500">
            Interests you send will appear
            here.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {interests.map((interest) => (
            <SentInterestCard
              key={interest.id}
              interest={interest}
              withdrawing={
                withdrawingId ===
                interest.id
              }
              onWithdraw={(id) =>
                void withdrawInterest(id)
              }
            />
          ))}
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
                  Math.max(0, current - 1)
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
                setPage((current) =>
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