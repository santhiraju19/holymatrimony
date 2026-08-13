
"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import ReportReasonBadge from "@/features/admin/reports/components/ReportReasonBadge";
import ReportStatusBadge from "@/features/admin/reports/components/ReportStatusBadge";

import {
  getAdminReport,
  updateAdminReportStatus,
} from "@/features/admin/reports/services/adminReportService";

import type {
  AdminReportDetail,
  ReportStatus,
} from "@/features/admin/reports/types/adminReport";

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

export default function AdminReportDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const reportId =
    params.id;

  const [
    report,
    setReport,
  ] =
    useState<AdminReportDetail | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    updating,
    setUpdating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const loadReport =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getAdminReport(
              reportId
            );

          setReport(response);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load report."
          );
        } finally {
          setLoading(false);
        }
      },
      [reportId]
    );

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function changeStatus(
    status: ReportStatus
  ) {
    if (!report) {
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const updated =
        await updateAdminReportStatus(
          report.id,
          status
        );

      setReport(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update report."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading report...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <h2 className="font-bold text-red-700">
          Report unavailable
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error ||
            "The requested report could not be found."}
        </p>

        <Link
          href="/admin/reports"
          className="mt-5 inline-flex rounded-lg bg-[#0B2D5C] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px]">
      <div className="mb-6">
        <Link
          href="/admin/reports"
          className="text-sm font-semibold text-[#0B2D5C] hover:underline"
        >
          ← Back to Reports
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#B78A22]">
            Trust & Safety
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Review Member Report
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Report ID: {report.id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ReportReasonBadge
            reason={report.reason}
          />

          <ReportStatusBadge
            status={report.status}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Report Details
            </h2>

            <div className="mt-5">
              <InfoRow
                label="Reason"
                value={
                  report.reason.replaceAll(
                    "_",
                    " "
                  )
                }
              />

              <InfoRow
                label="Submitted"
                value={
                  formatDate(
                    report.createdAt
                  )
                }
              />

              <InfoRow
                label="Conversation ID"
                value={
                  report.conversationId
                }
              />
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Member's Report
              </p>

              <div className="mt-2 min-h-32 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {report.details?.trim() ||
                  "No additional details were provided."}
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
                Reporter
              </p>

              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {report.reporterName}
              </h2>

              <div className="mt-4">
                <InfoRow
                  label="Email"
                  value={
                    report.reporterEmail
                  }
                />

                <InfoRow
                  label="Mobile"
                  value={
                    report.reporterMobile
                  }
                />

                <InfoRow
                  label="User ID"
                  value={
                    report.reporterId
                  }
                />
              </div>

              <Link
                href={`/admin/users/${report.reporterId}`}
                className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
              >
                View Reporter
              </Link>
            </section>

            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                Reported Member
              </p>

              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {report.reportedUserName}
              </h2>

              <div className="mt-4">
                <InfoRow
                  label="Email"
                  value={
                    report.reportedUserEmail
                  }
                />

                <InfoRow
                  label="Mobile"
                  value={
                    report.reportedUserMobile
                  }
                />

                <InfoRow
                  label="User ID"
                  value={
                    report.reportedUserId
                  }
                />
              </div>

              <Link
                href={`/admin/users/${report.reportedUserId}`}
                className="mt-5 inline-flex rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                View Reported Member
              </Link>
            </section>
          </div>

          {report.reviewedAt && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Review Information
              </h2>

              <div className="mt-4">
                <InfoRow
                  label="Reviewed At"
                  value={
                    formatDate(
                      report.reviewedAt
                    )
                  }
                />

                <InfoRow
                  label="Reviewed By"
                  value={
                    report.reviewedByName
                  }
                />

                <InfoRow
                  label="Administrator Email"
                  value={
                    report.reviewedByEmail
                  }
                />
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Moderation Action
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update the investigation status
              after reviewing the report and
              member information.
            </p>

            <div className="mt-6 space-y-3">
              {report.status !==
                "UNDER_REVIEW" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    void changeStatus(
                      "UNDER_REVIEW"
                    )
                  }
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mark Under Review
                </button>
              )}

              {report.status !==
                "RESOLVED" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    void changeStatus(
                      "RESOLVED"
                    )
                  }
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Resolve Report
                </button>
              )}

              {report.status !==
                "DISMISSED" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    void changeStatus(
                      "DISMISSED"
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Dismiss Report
                </button>
              )}
            </div>

            {updating && (
              <p className="mt-4 text-center text-xs font-semibold text-blue-600">
                Updating report...
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}