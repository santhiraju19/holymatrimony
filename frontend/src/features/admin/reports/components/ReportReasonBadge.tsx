import type {
  ReportReason,
} from "../types/adminReport";

interface ReportReasonBadgeProps {
  reason: ReportReason;
}

const labels: Record<
  ReportReason,
  string
> = {
  INAPPROPRIATE_MESSAGES:
    "Inappropriate Messages",

  HARASSMENT:
    "Harassment",

  FAKE_PROFILE:
    "Fake Profile",

  SCAM_OR_FRAUD:
    "Scam / Fraud",

  OFFENSIVE_CONTENT:
    "Offensive Content",

  OTHER:
    "Other",
};

export default function ReportReasonBadge({
  reason,
}: ReportReasonBadgeProps) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      {labels[reason]}
    </span>
  );
}