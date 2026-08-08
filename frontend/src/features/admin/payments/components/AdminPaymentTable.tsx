"use client";

import Link from "next/link";

import {
  CreditCard,
  Eye,
  UserRound,
} from "lucide-react";

import PaymentStatusBadge from "./PaymentStatusBadge";

import type {
  AdminPayment,
} from "../types/adminPayment";

interface Props {
  payments:
    AdminPayment[];
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString();
}

function formatMoney(
  amount?: number | null,
  currency = "INR"
): string {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits:
          2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatCycle(
  value: string
): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

export default function AdminPaymentTable({
  payments,
}: Props) {
  if (
    payments.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <CreditCard
            size={27}
          />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No payments found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No payment records match
          the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Member
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Plan
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Razorpay Order
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Payment ID
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Created
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {payments.map(
              (payment) => (
                <tr
                  key={
                    payment.paymentId
                  }
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                        <UserRound
                          size={21}
                        />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {
                            payment.fullName
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            payment.accountEmail
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-[#0B2D5C]">
                      {
                        payment.plan
                      }
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatCycle(
                        payment.billingCycle
                      )}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-800">
                    {formatMoney(
                      payment.amountInRupees,
                      payment.currency
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <PaymentStatusBadge
                      status={
                        payment.status
                      }
                    />
                  </td>

                  <td className="max-w-[190px] px-5 py-4">
                    <p className="truncate text-xs font-semibold text-slate-600">
                      {payment.razorpayOrderId ||
                        "—"}
                    </p>
                  </td>

                  <td className="max-w-[190px] px-5 py-4">
                    <p className="truncate text-xs font-semibold text-slate-600">
                      {payment.razorpayPaymentId ||
                        "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      payment.createdAt
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/payments/${payment.paymentId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
                    >
                      <Eye
                        size={15}
                      />

                      View
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