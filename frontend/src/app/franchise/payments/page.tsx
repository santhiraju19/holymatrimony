"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getFranchisePayments,
} from "@/features/franchise/api/franchiseApi";

import {
  useFranchiseAccess,
} from "@/features/franchise/access/FranchiseAccessProvider";

import type {
  FranchisePayment,
  FranchisePaymentStatus,
} from "@/features/franchise/types/franchisePayment";

function formatCurrency(
  amount: number | null,
  currency: string | null
): string {
  if (amount === null) {
    return "—";
  }

  const value = amount / 100;

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 2,
      }
    ).format(value);
  } catch {
    return `₹${value.toLocaleString("en-IN")}`;
  }
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function formatLabel(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function getStatusClasses(
  status: FranchisePaymentStatus
): string {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "FAILED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-red-600/20";

    case "REFUNDED":
      return "bg-purple-50 text-purple-700 ring-purple-600/20";

    case "PENDING":
    case "CREATED":
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}

interface SummaryCardProps {
  label: string;
  value: string;
  helper: string;
}

function SummaryCard({
  label,
  value,
  helper,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#0B2D5C]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {helper}
      </p>
    </div>
  );
}

export default function FranchisePaymentsPage() {
  const {
    access,
  } = useFranchiseAccess();

  const [payments, setPayments] =
    useState<FranchisePayment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const canViewPayments =
    access?.permissions.includes(
      "PAYMENTS_VIEW"
    ) ?? false;

  const loadPayments =
    useCallback(async () => {
      if (!canViewPayments) {
        setPayments([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getFranchisePayments();

        setPayments(response);
      } catch {
        setPayments([]);
        setError(
          "We could not load the payment records. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, [canViewPayments]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const summary =
    useMemo(() => {
      let successfulCount = 0;
      let pendingCount = 0;
      let successfulAmount = 0;

      for (const payment of payments) {
        if (payment.status === "SUCCESS") {
          successfulCount += 1;

          successfulAmount +=
            payment.amount ?? 0;
        }

        if (
          payment.status === "PENDING" ||
          payment.status === "CREATED"
        ) {
          pendingCount += 1;
        }
      }

      return {
        totalCount: payments.length,
        successfulCount,
        pendingCount,
        successfulAmount,
      };
    }, [payments]);

  if (!canViewPayments) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Finance
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0B2D5C]">
            Payments
          </h1>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-900">
            Payment access is not assigned
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">
            Your franchise account does not currently have permission
            to view payment records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
            Finance
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0B2D5C]">
            Payments
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            View payment activity for members within your allocated
            district.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            District Scope
          </p>

          <p className="mt-1 text-sm font-bold text-[#0B2D5C]">
            {access
              ? `${access.districtName}, ${access.stateName}`
              : "Assigned district"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-800">
            Unable to load payments
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadPayments();
            }}
            className="mt-5 rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Payments"
              value={summary.totalCount.toLocaleString(
                "en-IN"
              )}
              helper="District payment records"
            />

            <SummaryCard
              label="Successful"
              value={summary.successfulCount.toLocaleString(
                "en-IN"
              )}
              helper="Completed payments"
            />

            <SummaryCard
              label="Pending"
              value={summary.pendingCount.toLocaleString(
                "en-IN"
              )}
              helper="Created or pending"
            />

            <SummaryCard
              label="Successful Value"
              value={formatCurrency(
                summary.successfulAmount,
                "INR"
              )}
              helper="Successful payment value"
            />
          </div>

          {payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-lg font-bold text-[#0B2D5C]">
                No payment records
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                There are currently no payment records available for
                members in your allocated district.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold text-[#0B2D5C]">
                  Payment History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Read-only district payment activity.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Member
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Plan
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Method
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Payment ID
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Paid / Created
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {payments.map(
                      (payment) => (
                        <tr
                          key={payment.paymentId}
                          className="align-top hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                              {payment.customerName ||
                                "Member"}
                            </p>

                            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                              {payment.email || "—"}
                            </p>

                            {payment.phone && (
                              <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                                {payment.phone}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                              {formatLabel(
                                payment.plan
                              )}
                            </p>

                            <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                              {formatLabel(
                                payment.billingCycle
                              )}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">
                            {formatCurrency(
                              payment.amount,
                              payment.currency
                            )}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                                getStatusClasses(
                                  payment.status
                                ),
                              ].join(" ")}
                            >
                              {formatLabel(
                                payment.status
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                              {formatLabel(
                                payment.paymentMethod
                              )}
                            </p>

                            <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                              {formatLabel(
                                payment.paymentSource
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="max-w-[220px] truncate text-xs font-medium text-slate-600">
                              {payment.razorpayPaymentId ||
                                payment.razorpayOrderId ||
                                payment.paymentId}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {formatDateTime(
                              payment.paidAt ??
                                payment.createdAt
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
