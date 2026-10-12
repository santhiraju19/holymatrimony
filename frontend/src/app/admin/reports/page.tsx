"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";
import AdminReportTable from "@/features/admin/reports/components/AdminReportTable";

import {
  getAdminReports,
} from "@/features/admin/reports/services/adminReportService";

import type {
  AdminReportPage,
  ReportReason,
  ReportStatus,
} from "@/features/admin/reports/types/adminReport";

const PAGE_SIZE = 20;

export default function AdminReportsPage() {
  const [
    data,
    setData,
  ] =
    useState<AdminReportPage | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState<ReportStatus | "">(
      ""
    );

  const [
    reason,
    setReason,
  ] =
    useState<ReportReason | "">(
      ""
    );

  const [
    page,
    setPage,
  ] =
    useState(0);

  const loadReports =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getAdminReports({
              page,
              size: PAGE_SIZE,
              search,
              status,
              reason,
            });

          setData(response);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load reports."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        status,
        reason,
      ]
    );

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPage(0);

    setSearch(
      searchInput.trim()
    );
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setReason("");
    setPage(0);
  }

  const hasFilters =
    Boolean(
      search ||
        status ||
        reason
    );

  return (
    <div className="mx-auto max-w-[1500px]">
      <AdminPageHeader
        eyebrow="Safety"
        title="Member Reports"
        description="Review member safety reports and take appropriate action."
        actions={
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={16} />}
            disabled={loading}
            onClick={() =>
              void loadReports()
            }
          >
            Refresh
          </AdminButton>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <ShieldAlert size={19} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                  Total Reports
                </p>

                <p className="mt-1 text-2xl font-black text-red-700">
                  {data?.totalElements ?? "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle size={19} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Safety Queue
                </p>

                <p className="mt-1 text-sm font-bold text-amber-900">
                  Review and resolve member concerns
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminPageHeader>

      <AdminSectionCard
        title="Search & Filters"
        description="Find reports by member and narrow the safety queue by status or reason."
        icon={Search}
        className="mt-6"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <form
            onSubmit={
              handleSearch
            }
            className="flex min-w-0 flex-1 gap-2"
          >
            <input
              value={
                searchInput
              }
              onChange={(
                event
              ) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Search reporter or reported member..."
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <AdminButton
              type="submit"
              icon={<Search size={16} />}
            >
              Search
            </AdminButton>
          </form>

          <select
            value={status}
            onChange={(
              event
            ) => {
              setPage(0);

              setStatus(
                event.target
                  .value as
                  | ReportStatus
                  | ""
              );
            }}
            className="h-11 min-w-[180px] rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="UNDER_REVIEW">
              Under Review
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="DISMISSED">
              Dismissed
            </option>
          </select>

          <select
            value={reason}
            onChange={(
              event
            ) => {
              setPage(0);

              setReason(
                event.target
                  .value as
                  | ReportReason
                  | ""
              );
            }}
            className="h-11 min-w-[220px] rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All reasons
            </option>

            <option value="INAPPROPRIATE_MESSAGES">
              Inappropriate Messages
            </option>

            <option value="HARASSMENT">
              Harassment
            </option>

            <option value="FAKE_PROFILE">
              Fake Profile
            </option>

            <option value="SCAM_OR_FRAUD">
              Scam / Fraud
            </option>

            <option value="OFFENSIVE_CONTENT">
              Offensive Content
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>

          {hasFilters && (
            <AdminButton
              type="button"
              variant="secondary"
              icon={<X size={16} />}
              onClick={clearFilters}
            >
              Clear
            </AdminButton>
          )}
        </div>
      </AdminSectionCard>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle
            size={21}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="min-w-0 flex-1">
            <p className="font-bold text-red-800">
              Unable to load reports
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <AdminButton
              type="button"
              variant="danger"
              size="sm"
              className="mt-4"
              icon={<RefreshCw size={16} />}
              onClick={() =>
                void loadReports()
              }
            >
              Retry
            </AdminButton>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading reports...
          </p>
        </div>
      ) : (
        data && (
          <AdminSectionCard
            title="Report Results"
            description={`${data.totalElements} report${
              data.totalElements === 1 ? "" : "s"
            } found across the safety queue.`}
            icon={ShieldAlert}
            className="mt-6"
            contentClassName="p-0"
          >
            <AdminReportTable
              reports={data.content}
            />

            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-900">
                  {data.page + 1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {Math.max(
                    data.totalPages,
                    1
                  )}
                </span>

                {" · "}

                {data.totalElements}{" "}
                reports
              </p>

              <div className="flex gap-2">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={data.first}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          0,
                          current - 1
                        )
                    )
                  }
                >
                  Previous
                </AdminButton>

                <AdminButton
                  type="button"
                  size="sm"
                  disabled={data.last}
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                >
                  Next
                </AdminButton>
              </div>
            </div>
          </AdminSectionCard>
        )
      )}
    </div>
  );
}