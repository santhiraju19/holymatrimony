import {
  UserStatus,
} from "../types/adminUser";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const styles: Record<
  UserStatus,
  string
> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  SUSPENDED:
    "border-amber-200 bg-amber-50 text-amber-700",

  BLOCKED:
    "border-red-200 bg-red-50 text-red-700",

  DEACTIVATED:
    "border-slate-200 bg-slate-100 text-slate-600",
};

export default function UserStatusBadge({
  status,
}: UserStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status
        .toLowerCase()
        .replace(
          /^\w/,
          (value) =>
            value.toUpperCase()
        )}
    </span>
  );
}