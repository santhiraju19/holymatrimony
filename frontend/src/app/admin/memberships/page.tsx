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
import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

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

      <AdminPageHeader
        eyebrow="Commerce"
        title="Membership Management"
        description="Review premium memberships, billing cycles, payment-linked subscriptions, expirations and membership history."
      >
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:w-fit">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <Crown size={21} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Membership Records
            </p>

            <p className="mt-0.5 text-2xl font-black text-[#0B2D5C]">
              {data?.totalElements ?? 0}
            </p>
          </div>
        </div>
      </AdminPageHeader>

      {/* Stats */}

      <AdminSectionCard
        title="Membership Snapshot"
        description="Summary of the membership records currently visible on this page."
        icon={CreditCard}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Visible
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.visible}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CreditCard size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Active
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-900">
                  {stats.active}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Expiring ≤ 7 Days
                </p>

                <p className="mt-2 text-2xl font-black text-amber-900">
                  {stats.expiringSoon}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <TimerReset size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Cancelled
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.cancelled}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                <CreditCard size={21} />
              </div>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* Filters */}

      <AdminSectionCard
        title="Search & Filters"
        description="Find memberships by member details, membership status or plan."
        icon={Search}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
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
            onChange={(event) => {
              setStatus(
                event.target.value as
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
            onChange={(event) => {
              setPlan(
                event.target.value as
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
            <AdminButton
              variant="primary"
              icon={<Search size={16} />}
              onClick={handleSearch}
              className="h-12"
            >
              Search
            </AdminButton>

            <AdminButton
              variant="secondary"
              loading={loading}
              disabled={loading}
              icon={
                loading
                  ? undefined
                  : <RefreshCw size={16} />
              }
              onClick={() =>
                void loadMemberships()
              }
              className="h-12"
            >
              Refresh
            </AdminButton>
          </div>
        </div>
      </AdminSectionCard>

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

      <AdminSectionCard
        title="Membership Records"
        description={
          data
            ? `${data.totalElements} membership record${
                data.totalElements === 1
                  ? ""
                  : "s"
              } found.`
            : "Premium membership records and subscription details."
        }
        icon={CreditCard}
        contentClassName="p-0"
      >
        {loading &&
        !data ? (
          <div className="px-6 py-16 text-center text-sm font-semibold text-slate-500">
            Loading memberships...
          </div>
        ) : (
          <AdminMembershipTable
            memberships={
              data?.content ??
              []
            }
          />
        )}
      </AdminSectionCard>

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
              <AdminButton
                variant="secondary"
                size="sm"
                disabled={
                  data.first ||
                  loading
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
                icon={<ChevronLeft size={16} />}
              >
                Previous
              </AdminButton>

              <AdminButton
                variant="secondary"
                size="sm"
                disabled={
                  data.last ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                icon={<ChevronRight size={16} />}
              >
                Next
              </AdminButton>
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