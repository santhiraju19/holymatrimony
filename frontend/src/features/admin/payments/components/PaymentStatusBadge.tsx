import type {
  PaymentStatus,
} from "../types/adminPayment";

interface Props {
  status: PaymentStatus;
}

const styles: Record<
  PaymentStatus,
  string
> = {
  CREATED:
    "border-blue-200 bg-blue-100 text-blue-800",

  PENDING:
    "border-amber-200 bg-amber-100 text-amber-800",

  SUCCESS:
    "border-emerald-200 bg-emerald-100 text-emerald-800",

  FAILED:
    "border-red-200 bg-red-100 text-red-700",

  REFUNDED:
    "border-violet-200 bg-violet-100 text-violet-800",

  CANCELLED:
    "border-slate-200 bg-slate-100 text-slate-700",
};

const labels: Record<
  PaymentStatus,
  string
> = {
  CREATED:
    "Created",

  PENDING:
    "Pending",

  SUCCESS:
    "Success",

  FAILED:
    "Failed",

  REFUNDED:
    "Refunded",

  CANCELLED:
    "Cancelled",
};

export default function PaymentStatusBadge({
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