"use client";

import {
  CreditCard,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

const paymentsEnabled =
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

export default function PaymentHistoryCard() {
  if (!paymentsEnabled) {
    return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <ReceiptText
                size={22}
                className="text-[#0B2D5C]"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0B2D5C]">
                Payment History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Online payment records and receipts.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            Coming Soon
          </span>
        </div>

        <div className="px-6 py-12">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50">
              <CreditCard
                size={30}
                className="text-amber-700"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              Online payments are temporarily unavailable
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Razorpay payments, transaction history, and downloadable
              receipts will be enabled in the next update.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <p className="text-sm leading-6 text-emerald-800">
                  Silver, Gold, and Platinum monthly memberships can currently
                  be activated free using coupon{" "}
                  <strong>HOLY100</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <ReceiptText
              size={22}
              className="text-[#0B2D5C]"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0B2D5C]">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payment history is enabled, but the detailed payment table has
              not been loaded in this release.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 text-center">
        <p className="font-semibold text-slate-700">
          Payment history will appear here after online payments are enabled.
        </p>
      </div>
    </section>
  );
}