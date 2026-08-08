"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  RefreshCw,
  Search,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import AdminMembershipTable from "@/features/admin/memberships/components/AdminMembershipTable";

import {
  getAdminMemberships,
} from "@/features/admin/memberships/services/adminMembershipService";

import type {
  AdminMembershipPage,
  MembershipPlan,
  MembershipStatus,
} from "@/features/admin/memberships/types/adminMembership";

const PAGE_SIZE = 20;

export default function AdminMembershipsPage() {
  const [
    data,
    setData,
  ] =
    useState<AdminMembershipPage | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<
      MembershipStatus | ""
    >("");

  const [
    plan,
    setPlan,
  ] =
    useState<
      MembershipPlan | ""
    >("");

  const loadMemberships =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await getAdminMemberships({
              page,
              size:
                PAGE_SIZE,
              search,
              status,
              plan,
            });

          setData(result);
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load memberships."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        status,
        plan,
      ]
    );

  useEffect(() => {
    void loadMemberships();
  }, [loadMemberships]);

  function handleSearch(): void {
    setPage(0);

    setSearch(
      searchInput.trim()
    );
  }

  const stats =
    useMemo(() => {
      const content =
        data?.content ??
        [];

      return {
        visible:
          content.length,

        active:
          content.filter(
            (membership) =>
              membership.status ===
              "ACTIVE"
          ).length,

        cancelled:
          content.filter(
            (membership) =>
              membership.status ===
              "CANCELLED"
          ).length,

        expiringSoon:
          content.filter(
            (membership) =>
              membership.status ===
                "ACTIVE" &&
              membership.daysRemaining <=
                7
          ).length,
      };
    }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
              <Crown
                size={14}
              />

              Memberships
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight">
              Membership Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Review premium
              memberships, billing
              cycles, payment-linked
              subscriptions,
              expirations and
              membership history.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200">
              Membership Records
            </p>

            <p className="mt-1 text-3xl font-black">
              {
                data?.totalElements ??
                0
              }
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Visible
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {
                  stats.visible
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <CreditCard
                size={21}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Active
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-900">
                {
                  stats.active
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck
                size={21}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                Expiring ≤ 7 Days
              </p>

              <p className="mt-2 text-2xl font-black text-amber-900">
                {
                  stats.expiringSoon
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <TimerReset
                size={21}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Cancelled
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {
                  stats.cancelled
                }
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <CreditCard
                size={21}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={
                searchInput
              }
              onChange={(
                event
              ) =>
                setSearchInput(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  handleSearch();
                }
              }}
              placeholder="Search name, email or mobile..."
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(
              event
            ) => {
              setStatus(
                event.target
                  .value as
                  | MembershipStatus
                  | ""
              );

              setPage(0);
            }}
            className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <select
            value={plan}
            onChange={(
              event
            ) => {
              setPlan(
                event.target
                  .value as
                  | MembershipPlan
                  | ""
              );

              setPage(0);
            }}
            className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All plans
            </option>

            <option value="SILVER">
              Silver
            </option>

            <option value="GOLD">
              Gold
            </option>

            <option value="PLATINUM">
              Platinum
            </option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                handleSearch
              }
              className="h-12 rounded-xl bg-[#0B2D5C] px-5 text-sm font-bold text-white transition hover:bg-[#123F78]"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() =>
                void loadMemberships()
              }
              disabled={
                loading
              }
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {error}
          </span>
        </div>
      )}

      {loading &&
      !data ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Loading
          memberships...
        </div>
      ) : (
        <AdminMembershipTable
          memberships={
            data?.content ??
            []
          }
        />
      )}

      {/* Pagination */}

      {data &&
        data.totalPages >
          0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-bold text-slate-800">
                {data.page + 1}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {
                  data.totalPages
                }
              </span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  data.first ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        0,
                        current -
                          1
                      )
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft
                  size={16}
                />

                Previous
              </button>

              <button
                type="button"
                disabled={
                  data.last ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current +
                      1
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next

                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </div>
        )}

      <p className="px-1 text-xs leading-5 text-slate-400">
        This page displays actual
        membership records. Users
        currently using the virtual
        FREE membership may not
        appear until we add a
        dedicated free-user view.
      </p>
    </div>
  );
}