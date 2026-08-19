"use client";

import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  WalletCards,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  paymentService,
  type PaymentHistory,
} from "@/features/membership/services/payment.service";

/*
 * ============================================================
 * Formatting
 * ============================================================
 */

function formatEnum(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "—";
  }

  const normalized =
    value
      .replace(
        /_/g,
        " "
      )
      .toLowerCase();

  return normalized
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatAmount(
  payment:
    PaymentHistory
): string {
  const amount =
    Number.isFinite(
      payment.amountInRupees
    )
      ? payment.amountInRupees
      : payment.amountInPaise /
        100;

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency:
          payment.currency ||
          "INR",
        minimumFractionDigits:
          2,
        maximumFractionDigits:
          2,
      }
    ).format(amount);
  } catch {
    return `₹${amount.toFixed(
      2
    )}`;
  }
}

function formatDate(
  value:
    | string
    | null
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function truncateReference(
  value:
    | string
    | null
): string {
  if (!value) {
    return "—";
  }

  if (
    value.length <= 24
  ) {
    return value;
  }

  return `${value.slice(
    0,
    10
  )}…${value.slice(-8)}`;
}

/*
 * ============================================================
 * Main Card
 * ============================================================
 */

export default function PaymentHistoryCard() {
  const [
    payments,
    setPayments,
  ] =
    useState<
      PaymentHistory[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<
      string | null
    >(null);

  const loadHistory =
    useCallback(
      async (
        background =
          false
      ) => {
        try {
          if (
            background
          ) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError("");

          const history =
            await paymentService
              .getPaymentHistory();

          setPayments(
            history
          );
        } catch (
          requestError
        ) {
          console.error(
            "Unable to load payment history:",
            requestError
          );

          setError(
            "Unable to load your transaction history right now."
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const successfulCount =
    useMemo(
      () =>
        payments.filter(
          (payment) =>
            payment.status ===
            "SUCCESS"
        ).length,
      [payments]
    );

  const couponCount =
    useMemo(
      () =>
        payments.filter(
          (payment) =>
            payment.paymentSource ===
            "COUPON"
        ).length,
      [payments]
    );

  async function handleDownload(
    payment:
      PaymentHistory
  ) {
    if (
      !payment
        .receiptAvailable ||
      payment.status !==
        "SUCCESS"
    ) {
      return;
    }

    try {
      setDownloadingId(
        payment.id
      );

      await paymentService
        .downloadReceipt(
          payment.id
        );
    } catch (
      downloadError
    ) {
      console.error(
        "Unable to download receipt:",
        downloadError
      );

      setError(
        "Unable to download the receipt. Please try again."
      );
    } finally {
      setDownloadingId(
        null
      );
    }
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-white to-amber-50/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-[#F2D675] shadow-sm">
            <ReceiptText
              size={17}
            />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <Sparkles
                size={9}
                className="text-[#B38B19]"
              />

              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
                Transactions
              </p>
            </div>

            <h2 className="mt-0.5 text-base font-black text-[#0B2D5C] sm:text-lg">
              Payment History
            </h2>

            <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
              Membership purchases, coupon activations and downloadable receipts.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() => {
            void loadHistory(
              true
            );
          }}
          className="inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B2D5C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={11}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =====================================================
          Summary
          ===================================================== */}

      {!loading &&
        payments.length >
          0 && (
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/60">
            <SummaryStat
              label="Transactions"
              value={
                payments.length
              }
            />

            <SummaryStat
              label="Successful"
              value={
                successfulCount
              }
            />

            <SummaryStat
              label="Coupons"
              value={
                couponCount
              }
            />
          </div>
        )}

      {/* =====================================================
          Error
          ===================================================== */}

      {error && (
        <div className="border-b border-red-100 bg-red-50/80 px-4 py-2.5 sm:px-5">
          <div className="flex items-start gap-2 text-[10px] font-semibold leading-5 text-red-700">
            <AlertCircle
              size={13}
              className="mt-0.5 shrink-0"
            />

            {error}
          </div>
        </div>
      )}

      {/* =====================================================
          Body
          ===================================================== */}

      {loading ? (
        <LoadingState />
      ) : payments.length ===
        0 ? (
        <EmptyState />
      ) : (
        <div className="divide-y divide-slate-100">
          {payments.map(
            (payment) => (
              <TransactionRow
                key={
                  payment.id
                }
                payment={
                  payment
                }
                downloading={
                  downloadingId ===
                  payment.id
                }
                onDownload={() => {
                  void handleDownload(
                    payment
                  );
                }}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

/*
 * ============================================================
 * Transaction
 * ============================================================
 */

function TransactionRow({
  payment,
  downloading,
  onDownload,
}: {
  payment:
    PaymentHistory;

  downloading: boolean;

  onDownload: () => void;
}) {
  const coupon =
    payment.paymentSource ===
    "COUPON";

  const success =
    payment.status ===
    "SUCCESS";

  const transactionDate =
    payment.paidAt ??
    payment.createdAt;

  return (
    <article className="group px-4 py-3.5 transition hover:bg-slate-50/60 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

        {/* Main */}
        <div className="flex min-w-0 gap-3">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",

              coupon
                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                : "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
            ].join(" ")}
          >
            {coupon ? (
              <Tag
                size={17}
              />
            ) : (
              <CreditCard
                size={17}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs font-black text-[#0B2D5C] sm:text-sm">
                {formatEnum(
                  payment.plan
                )}{" "}
                Membership
              </h3>

              <StatusBadge
                status={
                  payment.status
                }
              />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-semibold text-slate-400 sm:text-[10px]">
              <span className="inline-flex items-center gap-1">
                <CalendarDays
                  size={10}
                />

                {formatEnum(
                  payment.billingCycle
                )}
              </span>

              <span>
                {success
                  ? coupon
                    ? "Activated"
                    : "Paid"
                  : "Created"}{" "}
                {formatDate(
                  transactionDate
                )}
              </span>
            </div>

            {/* Source */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <SourceBadge
                payment={
                  payment
                }
              />

              {coupon &&
                payment.couponCode && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-800">
                    <Tag
                      size={9}
                    />

                    {
                      payment.couponCode
                    }
                  </span>
                )}

              {!coupon &&
                payment.paymentMethod && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[8px] font-black text-blue-700">
                    <WalletCards
                      size={9}
                    />

                    {formatEnum(
                      payment.paymentMethod
                    )}
                  </span>
                )}
            </div>

            {/* Gateway reference */}
            {!coupon &&
              payment.razorpayPaymentId && (
                <div className="mt-2">
                  <p className="text-[9px] text-slate-400">
                    Payment ID{" "}
                    <span
                      className="font-mono font-semibold text-slate-500"
                      title={
                        payment.razorpayPaymentId
                      }
                    >
                      {truncateReference(
                        payment.razorpayPaymentId
                      )}
                    </span>
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Amount + Receipt */}
        <div className="flex items-center justify-between gap-4 pl-[52px] lg:min-w-[180px] lg:flex-col lg:items-end lg:pl-0">
          <div className="text-left lg:text-right">
            <p
              className={[
                "text-lg font-black tracking-[-0.02em]",

                coupon
                  ? "text-emerald-700"
                  : "text-[#0B2D5C]",
              ].join(" ")}
            >
              {formatAmount(
                payment
              )}
            </p>

            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {coupon
                ? "Coupon waiver"
                : "Amount paid"}
            </p>
          </div>

          {payment.receiptAvailable &&
            success && (
              <button
                type="button"
                disabled={
                  downloading
                }
                onClick={
                  onDownload
                }
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-black text-[#0B2D5C] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2
                    size={11}
                    className="animate-spin"
                  />
                ) : (
                  <Download
                    size={11}
                  />
                )}

                {downloading
                  ? "Preparing"
                  : "Receipt"}
              </button>
            )}
        </div>
      </div>
    </article>
  );
}

/*
 * ============================================================
 * Source
 * ============================================================
 */

function SourceBadge({
  payment,
}: {
  payment:
    PaymentHistory;
}) {
  if (
    payment.paymentSource ===
    "COUPON"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-800">
        <Tag
          size={9}
        />

        Coupon
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[8px] font-black text-blue-700">
      <CreditCard
        size={9}
      />

      Razorpay
    </span>
  );
}

/*
 * ============================================================
 * Status
 * ============================================================
 */

function StatusBadge({
  status,
}: {
  status:
    PaymentHistory["status"];
}) {
  const styles:
    Record<
      PaymentHistory["status"],
      string
    > = {
      SUCCESS:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

      PENDING:
        "border-amber-200 bg-amber-50 text-amber-700",

      CREATED:
        "border-blue-200 bg-blue-50 text-blue-700",

      FAILED:
        "border-red-200 bg-red-50 text-red-700",

      REFUNDED:
        "border-violet-200 bg-violet-50 text-violet-700",

      CANCELLED:
        "border-slate-200 bg-slate-100 text-slate-600",
    };

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-black",
        styles[status],
      ].join(" ")}
    >
      {status ===
      "SUCCESS" ? (
        <CheckCircle2
          size={9}
        />
      ) : null}

      {formatEnum(
        status
      )}
    </span>
  );
}

/*
 * ============================================================
 * Summary
 * ============================================================
 */

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border-r border-slate-100 px-3 py-2.5 text-center last:border-r-0">
      <p className="text-sm font-black text-[#0B2D5C]">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * Loading
 * ============================================================
 */

function LoadingState() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({
        length: 3,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-3 rounded-xl px-2 py-3"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/5 rounded bg-slate-200" />

              <div className="h-2.5 w-3/5 rounded bg-slate-100" />

              <div className="h-2 w-1/4 rounded bg-slate-100" />
            </div>

            <div className="h-7 w-20 rounded-lg bg-slate-100" />
          </div>
        )
      )}
    </div>
  );
}

/*
 * ============================================================
 * Empty
 * ============================================================
 */

function EmptyState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-amber-50 text-[#0B2D5C] ring-1 ring-blue-100">
        <ReceiptText
          size={18}
        />
      </div>

      <h3 className="mt-3 text-sm font-black text-[#0B2D5C]">
        No transactions yet
      </h3>

      <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-500">
        Your successful membership payments and coupon activations will appear here along with downloadable receipts.
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-700">
        <ShieldCheck
          size={11}
        />

        Secure membership records
      </div>
    </div>
  );
}
