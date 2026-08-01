"use client";

import {
  Download,
  Loader2,
  ReceiptText,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  PaymentHistory,
  paymentService,
} from "@/features/membership/services/payment.service";

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatPlan(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatBillingCycle(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function getStatusClasses(
  status: string
): string {
  switch (status.toUpperCase()) {
    case "SUCCESS":
    case "PAID":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "FAILED":
      return "bg-red-50 text-red-700 ring-red-200";

    case "PENDING":
    case "CREATED":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "REFUNDED":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function formatAmount(
  payment: PaymentHistory
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency:
        payment.currency || "INR",
      maximumFractionDigits: 2,
    }
  ).format(payment.amountInRupees);
}

export default function PaymentHistoryCard() {
  const [payments, setPayments] =
    useState<PaymentHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    downloadingPaymentId,
    setDownloadingPaymentId,
  ] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPaymentHistory() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await paymentService
            .getPaymentHistory();

        if (active) {
          setPayments(data);
        }
      } catch (requestError) {
        console.error(
          "Failed to load payment history:",
          requestError
        );

        if (active) {
          setError(
            "Unable to load payment history."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPaymentHistory();

    return () => {
      active = false;
    };
  }, []);

  async function handleDownloadReceipt(
    paymentId: number
  ) {
    try {
      setDownloadingPaymentId(
        paymentId
      );

      await paymentService
        .downloadReceipt(paymentId);
    } catch (downloadError) {
      console.error(
        "Failed to download receipt:",
        downloadError
      );

      alert(
        "Unable to download the receipt. Please try again."
      );
    } finally {
      setDownloadingPaymentId(null);
    }
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
              Review transactions and
              download receipts.
            </p>
          </div>
        </div>

        {!loading &&
          !error &&
          payments.length > 0 && (
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {payments.length}{" "}
              {payments.length === 1
                ? "payment"
                : "payments"}
            </span>
          )}
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="grid animate-pulse gap-3 rounded-2xl border border-slate-100 p-4 sm:grid-cols-6"
            >
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 rounded bg-slate-200"
                />
              ))}
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-12 text-center">
          <div className="text-4xl">
            ⚠️
          </div>

          <p className="mt-3 font-semibold text-slate-700">
            Payment history unavailable
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {error}
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-4xl">
            🧾
          </div>

          <p className="mt-3 font-semibold text-slate-700">
            No payment records yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Successful membership
            payments will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Plan
                  </th>

                  <th className="px-6 py-4">
                    Billing
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Receipt
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map(
                  (payment) => {
                    const downloading =
                      downloadingPaymentId ===
                      payment.id;

                    const receiptAvailable =
                      payment.status.toUpperCase() ===
                      "SUCCESS";

                    return (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(
                            payment.paidAt ??
                              payment.createdAt
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#0B2D5C]">
                            {formatPlan(
                              payment.plan
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              payment.razorpayOrderId
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatBillingCycle(
                            payment.billingCycle
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">
                          {formatAmount(
                            payment
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
                              getStatusClasses(
                                payment.status
                              ),
                            ].join(" ")}
                          >
                            {formatPlan(
                              payment.status
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={
                              !receiptAvailable ||
                              downloading
                            }
                            onClick={() =>
                              handleDownloadReceipt(
                                payment.id
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0B2D5C] transition hover:border-[#D4AF37] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {downloading ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Download
                                size={16}
                              />
                            )}

                            {downloading
                              ? "Downloading"
                              : "Download"}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {payments.map(
              (payment) => {
                const downloading =
                  downloadingPaymentId ===
                  payment.id;

                const receiptAvailable =
                  payment.status.toUpperCase() ===
                  "SUCCESS";

                return (
                  <article
                    key={payment.id}
                    className="space-y-4 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-[#0B2D5C]">
                          {formatPlan(
                            payment.plan
                          )}{" "}
                          Plan
                        </h3>

                        <p className="mt-1 break-all text-xs text-slate-400">
                          {
                            payment.razorpayOrderId
                          }
                        </p>
                      </div>

                      <span
                        className={[
                          "inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
                          getStatusClasses(
                            payment.status
                          ),
                        ].join(" ")}
                      >
                        {formatPlan(
                          payment.status
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">
                          Date
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {formatDate(
                            payment.paidAt ??
                              payment.createdAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Billing
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {formatBillingCycle(
                            payment.billingCycle
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Amount
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {formatAmount(
                            payment
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Payment ID
                        </p>

                        <p className="mt-1 truncate font-semibold text-slate-700">
                          {payment.razorpayPaymentId ??
                            "—"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !receiptAvailable ||
                        downloading
                      }
                      onClick={() =>
                        handleDownloadReceipt(
                          payment.id
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Download size={17} />
                      )}

                      {downloading
                        ? "Downloading receipt..."
                        : "Download receipt"}
                    </button>
                  </article>
                );
              }
            )}
          </div>
        </>
      )}
    </section>
  );
}