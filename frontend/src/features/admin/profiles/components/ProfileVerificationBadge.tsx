import type {
  ProfileVerificationStatus,
} from "../types/adminProfile";

interface Props {
  status:
    ProfileVerificationStatus;
}

const styles: Record<
  ProfileVerificationStatus,
  string
> = {
  NOT_SUBMITTED:
    "border-slate-200 bg-slate-100 text-slate-700",

  PENDING:
    "border-amber-200 bg-amber-100 text-amber-800",

  APPROVED:
    "border-emerald-200 bg-emerald-100 text-emerald-800",

  REJECTED:
    "border-red-200 bg-red-100 text-red-700",
};

const labels: Record<
  ProfileVerificationStatus,
  string
> = {
  NOT_SUBMITTED:
    "Not Submitted",

  PENDING:
    "Pending",

  APPROVED:
    "Approved",

  REJECTED:
    "Rejected",
};

export default function ProfileVerificationBadge({
  status,
}: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        styles[status],
      ].join(" ")}
    >
      {labels[status]}
    </span>
  );
}