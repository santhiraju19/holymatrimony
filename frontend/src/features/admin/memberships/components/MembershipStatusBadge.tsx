import type {
  MembershipStatus,
} from "../types/adminMembership";

interface Props {
  status: MembershipStatus;
}

const styles: Record<
  MembershipStatus,
  string
> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-100 text-emerald-800",

  EXPIRED:
    "border-amber-200 bg-amber-100 text-amber-800",

  CANCELLED:
    "border-slate-200 bg-slate-100 text-slate-700",
};

const labels: Record<
  MembershipStatus,
  string
> = {
  ACTIVE:
    "Active",

  EXPIRED:
    "Expired",

  CANCELLED:
    "Cancelled",
};

export default function MembershipStatusBadge({
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