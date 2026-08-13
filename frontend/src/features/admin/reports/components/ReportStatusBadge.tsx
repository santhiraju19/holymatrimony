import type {
  ReportStatus,
} from "../types/adminReport";

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const styles: Record<
  ReportStatus,
  string
> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700",

  UNDER_REVIEW:
    "border-blue-200 bg-blue-50 text-blue-700",

  RESOLVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  DISMISSED:
    "border-slate-200 bg-slate-100 text-slate-600",
};

const labels: Record<
  ReportStatus,
  string
> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export default function ReportStatusBadge({
  status,
}: ReportStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold",
        styles[status],
      ].join(" ")}
    >
      {labels[status]}
    </span>
  );
}