"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Crown,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  adminService,
} from "../api/admin.service";

import type {
  AdminAnalyticsData,
  AdminAnalyticsExportType,
} from "../types";

function localDateValue(
  date: Date
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function defaultFrom(): string {
  const now = new Date();

  return localDateValue(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )
  );
}

function defaultTo(): string {
  return localDateValue(
    new Date()
  );
}

function formatNumber(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value ?? 0);
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value ?? 0);
}

function formatPercent(
  value: number
): string {
  return `${Number(
    value ?? 0
  ).toFixed(1)}%`;
}

const exportOptions: Array<{
  type: AdminAnalyticsExportType;
  label: string;
  description: string;
}> = [
  {
    type: "users",
    label: "Users CSV",
    description:
      "Registration and account details.",
  },
  {
    type: "profiles",
    label: "Profiles CSV",
    description:
      "Completion, visibility and verification.",
  },
  {
    type: "memberships",
    label: "Memberships CSV",
    description:
      "Plans, dates and membership status.",
  },
  {
    type: "payments",
    label: "Payments CSV",
    description:
      "Transactions and payment reconciliation.",
  },
];

export default function AdminAnalytics() {
  const [
    from,
    setFrom,
  ] =
    useState(defaultFrom);

  const [
    to,
    setTo,
  ] =
    useState(defaultTo);

  const [
    appliedFrom,
    setAppliedFrom,
  ] =
    useState(defaultFrom);

  const [
    appliedTo,
    setAppliedTo,
  ] =
    useState(defaultTo);

  const [
    analytics,
    setAnalytics,
  ] =
    useState<AdminAnalyticsData | null>(
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
    downloading,
    setDownloading,
  ] =
    useState<
      AdminAnalyticsExportType | null
    >(null);

  const loadAnalytics =
    useCallback(
      async (
        rangeFrom: string,
        rangeTo: string
      ) => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await adminService
              .getAnalytics({
                from: rangeFrom,
                to: rangeTo,
              });

          setAnalytics(result);
        } catch (
          caughtError: unknown
        ) {
          setAnalytics(null);

          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to load business analytics."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadAnalytics(
      appliedFrom,
      appliedTo
    );
  }, [
    appliedFrom,
    appliedTo,
    loadAnalytics,
  ]);

  function applyRange() {
    if (
      from &&
      to &&
      from > to
    ) {
      setError(
        "From date cannot be after to date."
      );
      return;
    }

    setError(null);
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  async function download(
    type: AdminAnalyticsExportType
  ) {
    try {
      setDownloading(type);

      await adminService
        .downloadAnalyticsCsv(
          type,
          {
            from: appliedFrom,
            to: appliedTo,
          }
        );
    } catch (
      caughtError: unknown
    ) {
      setError(
        getApiErrorMessage(
          caughtError,
          "Unable to download the report."
        )
      );
    } finally {
      setDownloading(null);
    }
  }

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-indigo-700 p-7 text-white shadow-xl sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E8CB6A]">
          Business Intelligence
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Analytics & Exports
        </h1>

        <p className="mt-3 max-w-3xl text-blue-100">
          Analyze customer growth,
          profile completion, membership
          sales, payments, revenue and
          conversion for any date range.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0B2D5C]">
              Reporting Period
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the period used for
              analytics and CSV exports.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <DateInput
              label="From"
              value={from}
              onChange={setFrom}
            />

            <DateInput
              label="To"
              value={to}
              onChange={setTo}
            />

            <button
              type="button"
              onClick={applyRange}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-5 font-bold text-white transition hover:bg-[#123e78]"
            >
              <RefreshCw size={17} />
              Apply
            </button>
          </div>
        </div>
      </section>

      {error && (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p className="font-medium">
            {error}
          </p>
        </section>
      )}

      {loading && (
        <div className="flex min-h-[360px] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={38}
              className="mx-auto animate-spin text-blue-700"
            />

            <p className="mt-4 font-semibold text-slate-600">
              Loading analytics...
            </p>
          </div>
        </div>
      )}

      {!loading && analytics && (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Registered"
              value={formatNumber(
                analytics.registeredUsers
              )}
              description="New accounts in selected period."
              icon={Users}
            />

            <SummaryCard
              label="Completed Profiles"
              value={formatNumber(
                analytics.completedProfiles
              )}
              description="Completed profiles created in period."
              icon={UserCheck}
            />

            <SummaryCard
              label="Paid Memberships"
              value={formatNumber(
                analytics.paidMemberships
              )}
              description="Successful paid membership purchases."
              icon={Crown}
            />

            <SummaryCard
              label="Period Revenue"
              value={formatCurrency(
                analytics.periodRevenue
              )}
              description="Successful payment revenue."
              icon={WalletCards}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <AnalyticsPanel
              title="Customer Growth"
              icon={Users}
            >
              <MetricRow
                label="Registered Users"
                value={formatNumber(
                  analytics.registeredUsers
                )}
              />

              <MetricRow
                label="Total Platform Users"
                value={formatNumber(
                  analytics.totalUsers
                )}
              />

              <MetricRow
                label="Profiles Created"
                value={formatNumber(
                  analytics.profilesCreated
                )}
              />

              <MetricRow
                label="Completed Profiles"
                value={formatNumber(
                  analytics.completedProfiles
                )}
              />

              <MetricRow
                label="Incomplete Profiles"
                value={formatNumber(
                  analytics.incompleteProfiles
                )}
              />

              <MetricRow
                label="Browse Visible"
                value={formatNumber(
                  analytics.browseVisibleProfiles
                )}
              />
            </AnalyticsPanel>

            <AnalyticsPanel
              title="Membership Sales"
              icon={Crown}
            >
              <MetricRow
                label="Total Paid"
                value={formatNumber(
                  analytics.paidMemberships
                )}
              />

              <MetricRow
                label="Silver"
                value={formatNumber(
                  analytics.silverMemberships
                )}
              />

              <MetricRow
                label="Gold"
                value={formatNumber(
                  analytics.goldMemberships
                )}
              />

              <MetricRow
                label="Platinum"
                value={formatNumber(
                  analytics.platinumMemberships
                )}
              />
            </AnalyticsPanel>

            <AnalyticsPanel
              title="Payment Health"
              icon={WalletCards}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <StatusBox
                  label="Successful"
                  value={
                    analytics.successfulPayments
                  }
                  icon={CheckCircle2}
                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                />

                <StatusBox
                  label="Pending"
                  value={
                    analytics.pendingPayments
                  }
                  icon={Clock3}
                  className="border-amber-200 bg-amber-50 text-amber-700"
                />

                <StatusBox
                  label="Failed"
                  value={
                    analytics.failedPayments
                  }
                  icon={XCircle}
                  className="border-red-200 bg-red-50 text-red-700"
                />
              </div>
            </AnalyticsPanel>

            <AnalyticsPanel
              title="Revenue"
              icon={WalletCards}
            >
              <MetricRow
                label="Selected Period"
                value={formatCurrency(
                  analytics.periodRevenue
                )}
              />

              <MetricRow
                label="Lifetime"
                value={formatCurrency(
                  analytics.lifetimeRevenue
                )}
              />
            </AnalyticsPanel>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <TrendingUp size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#0B2D5C]">
                  Conversion
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customer progression
                  during the selected period.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <ConversionBox
                label="Registration → Profile"
                value={
                  analytics.registrationToProfileRate
                }
              />

              <ConversionBox
                label="Registration → Paid"
                value={
                  analytics.registrationToPaidRate
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <FileSpreadsheet
                  size={22}
                />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#0B2D5C]">
                  Export Reports
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  CSV files use the
                  currently applied date
                  range.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {exportOptions.map(
                (option) => {
                  const active =
                    downloading ===
                    option.type;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      disabled={
                        downloading !== null
                      }
                      onClick={() =>
                        void download(
                          option.type
                        )
                      }
                      className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {active ? (
                        <Loader2
                          size={22}
                          className="animate-spin text-blue-700"
                        />
                      ) : (
                        <Download
                          size={22}
                          className="text-blue-700"
                        />
                      )}

                      <p className="mt-4 font-black text-slate-900">
                        {option.label}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {
                          option.description
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-[46px] rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    size?: number;
  }>;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-[#0B2D5C]">
            {value}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
}

function AnalyticsPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{
    size?: number;
  }>;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={20} />
        </div>

        <h2 className="text-xl font-black text-[#0B2D5C]">
          {title}
        </h2>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </article>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-none last:pb-0">
      <span className="text-sm font-semibold text-slate-500">
        {label}
      </span>

      <span className="font-black text-slate-900">
        {value}
      </span>
    </div>
  );
}

function StatusBox({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{
    size?: number;
  }>;
  className: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${className}`}
    >
      <Icon size={20} />

      <p className="mt-3 text-2xl font-black">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function ConversionBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue =
    Math.min(
      100,
      Math.max(
        0,
        Number(value ?? 0)
      )
    );

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
      <p className="font-semibold text-indigo-700">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-indigo-950">
        {formatPercent(
          safeValue
        )}
      </p>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}
