"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Loader2,
  ReceiptText,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import api, {
  getApiErrorMessage,
} from "@/lib/api";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";
import PaymentStatusBadge from "@/features/admin/payments/components/PaymentStatusBadge";

import {
  getAdminPayment,
} from "@/features/admin/payments/services/adminPaymentService";

import type {
  AdminPayment,
} from "@/features/admin/payments/types/adminPayment";

function formatDateTime(
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

function extractFilename(
  contentDisposition?: string
): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match =
    contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(
        utf8Match[1]
      );
    } catch {
      return utf8Match[1];
    }
  }

  const filenameMatch =
    contentDisposition.match(
      /filename="?([^";]+)"?/
    );

  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  return null;
}

function DetailItem({
  label,
  value,
  copyable = false,
}: {
  label: string;

  value:
    | string
    | number
    | null
    | undefined;

  copyable?: boolean;
}) {
  const displayValue =
    value === null ||
    value === undefined ||
    String(value).trim() === ""
      ? "—"
      : String(value);

  async function copy(): Promise<void> {
    if (
      !copyable ||
      displayValue === "—"
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        displayValue
      );
    } catch {
      // Clipboard access may be blocked.
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="break-all text-sm font-semibold text-slate-800">
          {displayValue}
        </p>

        {copyable &&
          displayValue !==
            "—" && (
            <button
              type="button"
              onClick={() =>
                void copy()
              }
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-[#0B2D5C]"
              aria-label={`Copy ${label}`}
            >
              <Copy
                size={14}
              />
            </button>
          )}
      </div>
    </div>
  );
}

export default function AdminPaymentDetailPage() {
  const params =
    useParams();

  const rawId =
    params?.id;

  const paymentId =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId;

  const [
    payment,
    setPayment,
  ] =
    useState<AdminPayment | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    downloadingReceipt,
    setDownloadingReceipt,
  ] = useState(false);

  const [
    receiptError,
    setReceiptError,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const loadPayment =
    useCallback(
      async (
        fullLoader = true
      ) => {
        if (
          !paymentId ||
          typeof paymentId !==
            "string"
        ) {
          setError(
            "Invalid payment ID."
          );

          setLoading(false);

          return;
        }

        if (fullLoader) {
          setLoading(true);
        } else {
          setRefreshing(
            true
          );
        }

        setError(null);

        try {
          const result =
            await getAdminPayment(
              paymentId
            );

          setPayment(
            result
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load payment."
          );
        } finally {
          setLoading(false);

          setRefreshing(
            false
          );
        }
      },
      [paymentId]
    );

  useEffect(() => {
    void loadPayment();
  }, [loadPayment]);

  async function downloadReceipt(): Promise<void> {
    if (
      !paymentId ||
      !payment ||
      payment.status !==
        "SUCCESS"
    ) {
      return;
    }

    setDownloadingReceipt(
      true
    );

    setReceiptError(
      null
    );

    try {
      const response =
        await api.get(
          `/admin/payments/${paymentId}/receipt`,
          {
            responseType:
              "blob",
          }
        );

      /*
       * Axios header values are not guaranteed
       * to be strings, so normalize them first.
       */
      const rawContentType =
        response.headers[
          "content-type"
        ];

      const contentType =
        typeof rawContentType ===
        "string"
          ? rawContentType
          : "application/pdf";

      const blob =
        new Blob(
          [response.data],
          {
            type:
              contentType,
          }
        );

      const objectUrl =
        window.URL.createObjectURL(
          blob
        );

      const rawContentDisposition =
        response.headers[
          "content-disposition"
        ];

      const contentDisposition =
        typeof rawContentDisposition ===
        "string"
          ? rawContentDisposition
          : undefined;

      const filename =
        extractFilename(
          contentDisposition
        ) ||
        `holy-matrimony-receipt-${paymentId}.pdf`;

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        objectUrl;

      anchor.download =
        filename;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      /*
       * Give the browser a moment to start
       * processing the download before releasing
       * the temporary object URL.
       */
      window.setTimeout(
        () => {
          window.URL.revokeObjectURL(
            objectUrl
          );
        },
        1000
      );
    } catch (
      receiptDownloadError
    ) {
      setReceiptError(
        getApiErrorMessage(
          receiptDownloadError,
          "Unable to download receipt."
        )
      );
    } finally {
      setDownloadingReceipt(
        false
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#0B2D5C]"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading payment...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !payment
  ) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C]"
        >
          <ArrowLeft
            size={17}
          />

          Back to Payments
        </Link>

        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="mt-0.5 text-red-600"
            />

            <div>
              <h2 className="font-black text-red-900">
                Payment could not
                be loaded
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error ||
                  "Unable to load this payment."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const successful =
    payment.status ===
    "SUCCESS";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}

      <AdminPageHeader
        eyebrow="Commerce / Payments"
        title={payment.fullName}
        description={payment.accountEmail}
        actions={
          <>
            <Link href="/admin/payments">
              <AdminButton
                variant="secondary"
                size="sm"
                icon={<ArrowLeft size={16} />}
              >
                Back to Payments
              </AdminButton>
            </Link>

            {successful && (
              <AdminButton
                variant="success"
                size="sm"
                loading={downloadingReceipt}
                disabled={downloadingReceipt}
                icon={
                  downloadingReceipt
                    ? undefined
                    : <Download size={16} />
                }
                onClick={() =>
                  void downloadReceipt()
                }
              >
                Download Receipt
              </AdminButton>
            )}

            <AdminButton
              variant="secondary"
              size="sm"
              loading={refreshing}
              disabled={refreshing}
              icon={
                refreshing
                  ? undefined
                  : <RefreshCw size={16} />
              }
              onClick={() =>
                void loadPayment(false)
              }
            >
              Refresh
            </AdminButton>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Payment Status
            </p>

            <div className="mt-2">
              <PaymentStatusBadge
                status={payment.status}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Amount
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {formatMoney(
                payment.amountInRupees,
                payment.currency
              )}
            </p>
          </div>
        </div>
      </AdminPageHeader>

      {/* Receipt error */}

      {receiptError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>
            {receiptError}
          </span>
        </div>
      )}

      {/* Success status */}

      {successful && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2
            size={22}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <h3 className="font-black text-emerald-900">
              Payment successful
            </h3>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Razorpay payment was completed successfully on{" "}
              {formatDateTime(
                payment.paidAt
              )}
              .
            </p>
          </div>
        </div>
      )}

      {/* Member Information */}

      <AdminSectionCard
        title="Member Information"
        description="Account and customer details associated with this transaction."
        icon={UserRound}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Account Name"
            value={
              payment.fullName
            }
          />

          <DetailItem
            label="Account Email"
            value={
              payment.accountEmail
            }
          />

          <DetailItem
            label="User ID"
            value={
              payment.userId
            }
            copyable
          />

          <DetailItem
            label="Customer Name"
            value={
              payment.customerName
            }
          />

          <DetailItem
            label="Payment Email"
            value={
              payment.email
            }
          />

          <DetailItem
            label="Phone"
            value={
              payment.phone
            }
          />
        </div>
      </AdminSectionCard>

      {/* Transaction Details */}

      <AdminSectionCard
        title="Transaction Details"
        description="Payment identifiers and gateway transaction status."
        icon={CreditCard}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Payment Record ID"
            value={
              payment.paymentId
            }
            copyable
          />

          <DetailItem
            label="Razorpay Order ID"
            value={
              payment.razorpayOrderId
            }
            copyable
          />

          <DetailItem
            label="Razorpay Payment ID"
            value={
              payment.razorpayPaymentId
            }
            copyable
          />

          <DetailItem
            label="Status"
            value={
              payment.status
            }
          />
        </div>
      </AdminSectionCard>

      {/* Purchase Details */}

      <AdminSectionCard
        title="Purchase Details"
        description="Plan, billing cycle and transaction amount information."
        icon={ReceiptText}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Plan"
            value={
              payment.plan
            }
          />

          <DetailItem
            label="Billing Cycle"
            value={formatCycle(
              payment.billingCycle
            )}
          />

          <DetailItem
            label="Currency"
            value={
              payment.currency
            }
          />

          <DetailItem
            label="Amount in Paise"
            value={
              payment.amountInPaise
            }
          />

          <DetailItem
            label="Amount"
            value={formatMoney(
              payment.amountInRupees,
              payment.currency
            )}
          />

          <DetailItem
            label="Paid At"
            value={formatDateTime(
              payment.paidAt
            )}
          />
        </div>
      </AdminSectionCard>

      {/* Receipt */}

      {successful && (
        <AdminSectionCard
          title="Payment Receipt"
          description="Official Holy Matrimony receipt for this successful transaction."
          icon={ReceiptText}
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-emerald-900">
                Receipt ready
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                Download the official Holy Matrimony PDF receipt generated
                from this payment transaction.
              </p>
            </div>

            <AdminButton
              variant="success"
              loading={downloadingReceipt}
              disabled={downloadingReceipt}
              icon={
                downloadingReceipt
                  ? undefined
                  : <Download size={17} />
              }
              onClick={() =>
                void downloadReceipt()
              }
            >
              Download PDF
            </AdminButton>
          </div>
        </AdminSectionCard>
      )}

      {/* Timeline */}

      <AdminSectionCard
        title="Transaction Timeline"
        description="Creation, payment and latest update timestamps."
        icon={Clock3}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Created"
            value={formatDateTime(
              payment.createdAt
            )}
          />

          <DetailItem
            label="Paid"
            value={formatDateTime(
              payment.paidAt
            )}
          />

          <DetailItem
            label="Updated"
            value={formatDateTime(
              payment.updatedAt
            )}
          />
        </div>
      </AdminSectionCard>

      {/* Pending state */}

      {payment.status ===
        "PENDING" && (
        <section className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <CalendarDays
            size={22}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <h3 className="font-black text-amber-900">
              Payment still
              pending
            </h3>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              The Razorpay order
              was created but a
              successful payment
              has not been
              recorded. No receipt
              is available until
              the payment succeeds.
            </p>
          </div>
        </section>
      )}

      {/* Amount summary */}

      <AdminSectionCard
        title="Transaction Amount"
        description="Final recorded amount for this payment."
        icon={Banknote}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white">
            <Banknote
              size={23}
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Transaction Amount
            </p>

            <p className="mt-1 text-2xl font-black text-[#0B2D5C]">
              {formatMoney(
                payment.amountInRupees,
                payment.currency
              )}
            </p>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}