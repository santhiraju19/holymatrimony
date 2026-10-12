
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

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileWarning,
  RefreshCw,
  ShieldAlert,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";
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
      <AdminSectionCard
        title="Loading Report"
        description="Retrieving the report and member information."
        icon={ShieldAlert}
      >
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading report...
          </p>
        </div>
      </AdminSectionCard>
    );
  }

  if (!report) {
    return (
      <AdminSectionCard
        title="Report Unavailable"
        description="The requested safety report could not be loaded."
        icon={AlertTriangle}
        className="border-red-200"
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            {error || "The requested report could not be found."}
          </p>

          <Link href="/admin/reports" className="mt-5 inline-flex">
            <AdminButton
              variant="secondary"
              icon={<ArrowLeft size={16} />}
            >
              Back to Reports
            </AdminButton>
          </Link>
        </div>
      </AdminSectionCard>
    );
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Safety / Reports"
        title="Review Member Report"
        description={`Report ID: ${report.id}`}
        actions={
          <>
            <Link href="/admin/reports">
              <AdminButton
                variant="secondary"
                icon={<ArrowLeft size={16} />}
              >
                Back to Reports
              </AdminButton>
            </Link>

            <AdminButton
              variant="secondary"
              icon={<RefreshCw size={16} />}
              disabled={loading || updating}
              onClick={() => void loadReport()}
            >
              Refresh
            </AdminButton>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <ReportReasonBadge reason={report.reason} />
          <ReportStatusBadge status={report.status} />
        </div>
      </AdminPageHeader>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AdminSectionCard
            title="Report Details"
            description="Review the submitted reason, context, and member-provided report."
            icon={FileWarning}
          >
            <div className="grid gap-x-8 md:grid-cols-3">
              <InfoRow
                label="Reason"
                value={report.reason.replaceAll("_", " ")}
              />

              <InfoRow
                label="Submitted"
                value={formatDate(report.createdAt)}
              />

              <InfoRow
                label="Conversation ID"
                value={report.conversationId}
              />
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Member&apos;s Report
              </p>

              <div className="mt-2 min-h-32 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {report.details?.trim() ||
                  "No additional details were provided."}
              </div>
            </div>
          </AdminSectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminSectionCard
              title="Reporter"
              description={report.reporterName}
              icon={UserRound}
            >
              <InfoRow
                label="Email"
                value={report.reporterEmail}
              />

              <InfoRow
                label="Mobile"
                value={report.reporterMobile}
              />

              <InfoRow
                label="User ID"
                value={report.reporterId}
              />

              <Link
                href={`/admin/users/${report.reporterId}`}
                className="mt-5 inline-flex"
              >
                <AdminButton
                  variant="secondary"
                  icon={<UserRound size={16} />}
                >
                  View Reporter
                </AdminButton>
              </Link>
            </AdminSectionCard>

            <AdminSectionCard
              title="Reported Member"
              description={report.reportedUserName}
              icon={UsersRound}
              className="border-red-200"
            >
              <InfoRow
                label="Email"
                value={report.reportedUserEmail}
              />

              <InfoRow
                label="Mobile"
                value={report.reportedUserMobile}
              />

              <InfoRow
                label="User ID"
                value={report.reportedUserId}
              />

              <Link
                href={`/admin/users/${report.reportedUserId}`}
                className="mt-5 inline-flex"
              >
                <AdminButton
                  variant="danger"
                  icon={<UsersRound size={16} />}
                >
                  View Reported Member
                </AdminButton>
              </Link>
            </AdminSectionCard>
          </div>

          {report.reviewedAt && (
            <AdminSectionCard
              title="Review Information"
              description="Administrative review metadata for this report."
              icon={Clock3}
            >
              <div className="grid gap-x-8 md:grid-cols-3">
                <InfoRow
                  label="Reviewed At"
                  value={formatDate(report.reviewedAt)}
                />

                <InfoRow
                  label="Reviewed By"
                  value={report.reviewedByName}
                />

                <InfoRow
                  label="Administrator Email"
                  value={report.reviewedByEmail}
                />
              </div>
            </AdminSectionCard>
          )}
        </div>

        <aside>
          <AdminSectionCard
            title="Moderation Action"
            description="Update the investigation status after reviewing the report and member information."
            icon={ShieldAlert}
            className="xl:sticky xl:top-6"
          >
            <div className="space-y-3">
              {report.status !== "UNDER_REVIEW" && (
                <AdminButton
                  variant="primary"
                  className="w-full"
                  icon={<Clock3 size={16} />}
                  disabled={updating}
                  loading={updating}
                  onClick={() =>
                    void changeStatus("UNDER_REVIEW")
                  }
                >
                  Mark Under Review
                </AdminButton>
              )}

              {report.status !== "RESOLVED" && (
                <AdminButton
                  variant="success"
                  className="w-full"
                  icon={<CheckCircle2 size={16} />}
                  disabled={updating}
                  loading={updating}
                  onClick={() =>
                    void changeStatus("RESOLVED")
                  }
                >
                  Resolve Report
                </AdminButton>
              )}

              {report.status !== "DISMISSED" && (
                <AdminButton
                  variant="secondary"
                  className="w-full"
                  icon={<XCircle size={16} />}
                  disabled={updating}
                  loading={updating}
                  onClick={() =>
                    void changeStatus("DISMISSED")
                  }
                >
                  Dismiss Report
                </AdminButton>
              )}
            </div>

            {updating && (
              <p className="mt-4 text-center text-xs font-semibold text-blue-600">
                Updating report...
              </p>
            )}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Status
              </p>

              <div className="mt-2">
                <ReportStatusBadge status={report.status} />
              </div>
            </div>
          </AdminSectionCard>
        </aside>
      </div>
    </div>
  );
}
