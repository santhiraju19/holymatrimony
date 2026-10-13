import type {
  SubAdminStatus,
} from "../types/adminSubAdmin";

interface SubAdminStatusBadgeProps {
  status: SubAdminStatus;
}

const styles: Record<
  SubAdminStatus,
  string
> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  DEACTIVATED:
    "border-slate-200 bg-slate-100 text-slate-600",
};

export default function SubAdminStatusBadge({
  status,
}: SubAdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status === "ACTIVE"
        ? "Active"
        : "Deactivated"}
    </span>
  );
}
