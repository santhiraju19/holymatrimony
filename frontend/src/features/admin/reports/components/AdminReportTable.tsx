"use client";

import Link from "next/link";

import type {
  AdminReport,
} from "../types/adminReport";

import ReportReasonBadge from "./ReportReasonBadge";
import ReportStatusBadge from "./ReportStatusBadge";

interface AdminReportTableProps {
  reports: AdminReport[];
}

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

function initials(
  name?: string | null
) {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .charAt(0)
    .toUpperCase();
}

export default function AdminReportTable({
  reports,
}: AdminReportTableProps) {
  if (!reports?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <h3 className="font-semibold text-slate-900">
          No reports found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          There are no safety reports matching
          the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Reported Member
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Reporter
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Reason
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Submitted
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {reports.map(
              (report) => (
                <tr
                  key={report.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-red-700">
                        {initials(
                          report.reportedUserName
                        )}
                      </div>

                      <div>
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                          {
                            report.reportedUserName
                          }
                        </p>

                        <p className="mt-0.5 whitespace-nowrap text-xs text-slate-400">
                          {
                            report.reportedUserEmail
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                      {report.reporterName}
                    </p>

                    <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                      {report.reporterEmail}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <ReportReasonBadge
                      reason={
                        report.reason
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    <ReportStatusBadge
                      status={
                        report.status
                      }
                    />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      report.createdAt
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}