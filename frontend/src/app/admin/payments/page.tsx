"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  RefreshCw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";

import AdminPaymentTable from "@/features/admin/payments/components/AdminPaymentTable";
import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

import {
  getAdminPayments,
} from "@/features/admin/payments/services/adminPaymentService";

import type {
  AdminPaymentPage,
  PaymentStatus,
} from "@/features/admin/payments/types/adminPayment";

const PAGE_SIZE = 20;

export default function AdminPaymentsPage() {
  const [
    data,
    setData,
  ] =
    useState<AdminPaymentPage | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<
      PaymentStatus | ""
    >("");

  const loadPayments =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await getAdminPayments({
              page,
              size:
                PAGE_SIZE,
              search,
              status,
            });

          setData(result);
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load payments."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        status,
      ]
    );

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  function handleSearch(): void {
    setPage(0);

    setSearch(
      searchInput.trim()
    );
  }

  const stats =
    useMemo(() => {
      const records =
        data?.content ??
        [];

      return {
        visible:
          records.length,

        success:
          records.filter(
            (payment) =>
              payment.status ===
              "SUCCESS"
          ).length,

        pending:
          records.filter(
            (payment) =>
              payment.status ===
              "PENDING" ||
              payment.status ===
                "CREATED"
          ).length,

        failed:
          records.filter(
            (payment) =>
              payment.status ===
                "FAILED" ||
              payment.status ===
                "CANCELLED"
          ).length,
      };
    }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <AdminPageHeader
        eyebrow="Commerce"
        title="Payment Management"
        description="Review Razorpay transactions, payment status, membership plans, billing cycles and transaction history."
      >
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:max-w-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <WalletCards size={20} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Payment Records
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {data?.totalElements ?? 0}
            </p>
          </div>
        </div>
      </AdminPageHeader>

      {/* Current-page statistics */}

      <AdminSectionCard
        title="Payment Snapshot"
        description="Current-page transaction status summary."
        icon={CreditCard}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Visible
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stats.visible}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CreditCard size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Successful
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-900">
                  {stats.success}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-black text-amber-900">
                  {stats.pending}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock3 size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                  Failed / Cancelled
                </p>

                <p className="mt-2 text-2xl font-black text-red-900">
                  {stats.failed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <XCircle size={21} />
              </div>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* Search & filters */}

      <AdminSectionCard
        title="Search & Filters"
        description="Find transactions by member, Razorpay identifiers, plan or payment status."
        icon={Search}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  handleSearch();
                }
              }}
              placeholder="Search name, email, order ID, payment ID or plan..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target
                  .value as
                  | PaymentStatus
                  | ""
              );

              setPage(0);
            }}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            <option value="CREATED">
              Created
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="SUCCESS">
              Success
            </option>

            <option value="FAILED">
              Failed
            </option>

            <option value="REFUNDED">
              Refunded
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <div className="flex flex-wrap gap-2">
            <AdminButton
              size="sm"
              icon={<Search size={16} />}
              onClick={handleSearch}
            >
              Search
            </AdminButton>

            <AdminButton
              variant="secondary"
              size="sm"
              loading={loading}
              disabled={loading}
              icon={
                loading
                  ? undefined
                  : <RefreshCw size={16} />
              }
              onClick={() =>
                void loadPayments()
              }
            >
              Refresh
            </AdminButton>
          </div>
        </div>
      </AdminSectionCard>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          {error}
        </div>
      )}

      <AdminSectionCard
        title="Payment Results"
        description="Transaction records matching the current search and status filters."
        icon={WalletCards}
        contentClassName="p-0"
      >
        {loading &&
        !data ? (
          <div className="px-6 py-16 text-center text-sm font-semibold text-slate-500">
            Loading payments...
          </div>
        ) : (
          <AdminPaymentTable
            payments={
              data?.content ??
              []
            }
          />
        )}

        {data &&
          data.totalPages >
            0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-bold text-slate-800">
                  {data.page + 1}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {
                    data.totalPages
                  }
                </span>
              </p>

              <div className="flex gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  disabled={
                    data.first ||
                    loading
                  }
                  icon={
                    <ChevronLeft size={16} />
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          0,
                          current - 1
                        )
                    )
                  }
                >
                  Previous
                </AdminButton>

                <AdminButton
                  variant="secondary"
                  size="sm"
                  disabled={
                    data.last ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    Next
                    <ChevronRight size={16} />
                  </span>
                </AdminButton>
              </div>
            </div>
          )}
      </AdminSectionCard>

      <p className="px-1 text-xs leading-5 text-slate-400">
        Dashboard statistics above
        currently summarize the
        loaded page. We can add
        backend-wide revenue and
        transaction statistics
        after the payment ledger is
        confirmed working.
      </p>
    </div>
  );
}