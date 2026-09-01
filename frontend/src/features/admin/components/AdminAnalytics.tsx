"use client";

import {
  type ComponentType,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Eye,
  Loader2,
  RefreshCw,
  Search,
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
  AdminAnalyticsDetailData,
  AdminAnalyticsDetailRow,
  AdminAnalyticsMetric,
} from "../types";

type IconType =
  ComponentType<{
    size?: number;
    className?: string;
  }>;

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
      minimumFractionDigits: 2,
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function isUserMetric(
  metric: AdminAnalyticsMetric
): boolean {
  return (
    metric === "REGISTERED_USERS" ||
    metric === "TOTAL_USERS"
  );
}

function isProfileMetric(
  metric: AdminAnalyticsMetric
): boolean {
  return (
    metric === "PROFILES_CREATED" ||
    metric === "COMPLETED_PROFILES" ||
    metric === "INCOMPLETE_PROFILES" ||
    metric === "BROWSE_VISIBLE"
  );
}

function isMembershipMetric(
  metric: AdminAnalyticsMetric
): boolean {
  return (
    metric === "PAID_MEMBERSHIPS" ||
    metric === "SILVER_MEMBERSHIPS" ||
    metric === "GOLD_MEMBERSHIPS" ||
    metric === "PLATINUM_MEMBERSHIPS"
  );
}

function isPaymentMetric(
  metric: AdminAnalyticsMetric
): boolean {
  return (
    metric === "SUCCESSFUL_PAYMENTS" ||
    metric === "PENDING_PAYMENTS" ||
    metric === "FAILED_PAYMENTS" ||
    metric === "PERIOD_REVENUE" ||
    metric === "LIFETIME_REVENUE"
  );
}

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
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedMetric,
    setSelectedMetric,
  ] =
    useState<AdminAnalyticsMetric>(
      "REGISTERED_USERS"
    );

  const [
    details,
    setDetails,
  ] =
    useState<AdminAnalyticsDetailData | null>(
      null
    );

  const [
    detailsLoading,
    setDetailsLoading,
  ] =
    useState(false);

  const [
    detailsError,
    setDetailsError,
  ] =
    useState<string | null>(
      null
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] =
    useState("");

  const [
    page,
    setPage,
  ] =
    useState(0);

  const pageSize = 20;

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

  const loadDetails =
    useCallback(
      async () => {
        setDetailsLoading(true);
        setDetailsError(null);

        try {
          const result =
            await adminService
              .getAnalyticsDetails({
                metric:
                  selectedMetric,
                from:
                  appliedFrom,
                to:
                  appliedTo,
                search:
                  appliedSearch,
                page,
                size:
                  pageSize,
              });

          setDetails(result);
        } catch (
          caughtError: unknown
        ) {
          setDetails(null);

          setDetailsError(
            getApiErrorMessage(
              caughtError,
              "Unable to load analytics details."
            )
          );
        } finally {
          setDetailsLoading(false);
        }
      },
      [
        selectedMetric,
        appliedFrom,
        appliedTo,
        appliedSearch,
        page,
      ]
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

  useEffect(() => {
    void loadDetails();
  }, [
    loadDetails,
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

    setPage(0);
  }

  function selectMetric(
    metric: AdminAnalyticsMetric
  ) {
    setSelectedMetric(metric);

    setSearch("");
    setAppliedSearch("");
    setPage(0);

    window.setTimeout(
      () => {
        document
          .getElementById(
            "analytics-details"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
      80
    );
  }

  function submitSearch(
    event: FormEvent
  ) {
    event.preventDefault();

    setAppliedSearch(
      search.trim()
    );

    setPage(0);
  }

  return (
    <main className="space-y-5 sm:space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-indigo-700 p-5 text-white shadow-xl sm:rounded-3xl sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E8CB6A]">
          Business Intelligence
        </p>

        <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
          Analytics & Details
        </h1>

        <p className="mt-3 max-w-3xl text-blue-100">
          Analyze customer growth,
          profile completion,
          membership sales,
          payments and revenue.
          Click any metric to view
          the underlying records.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0B2D5C]">
              Reporting Period
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the period used
              for analytics and
              customer drill-down data.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end xl:w-auto">
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
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-5 font-bold text-white transition hover:bg-[#123e78] sm:w-auto"
            >
              <RefreshCw
                size={17}
              />

              Apply
            </button>
          </div>
        </div>
      </section>

      {error && (
        <ErrorBox
          message={error}
        />
      )}

      {loading && (
        <LoadingBlock
          label="Loading analytics..."
        />
      )}

      {!loading &&
        analytics && (
          <>
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Registered"
                value={formatNumber(
                  analytics.registeredUsers
                )}
                description="New accounts in selected period."
                icon={Users}
                active={
                  selectedMetric ===
                  "REGISTERED_USERS"
                }
                onClick={() =>
                  selectMetric(
                    "REGISTERED_USERS"
                  )
                }
              />

              <SummaryCard
                label="Completed Profiles"
                value={formatNumber(
                  analytics.completedProfiles
                )}
                description="Completed profiles created in period."
                icon={UserCheck}
                active={
                  selectedMetric ===
                  "COMPLETED_PROFILES"
                }
                onClick={() =>
                  selectMetric(
                    "COMPLETED_PROFILES"
                  )
                }
              />

              <SummaryCard
                label="Paid Memberships"
                value={formatNumber(
                  analytics.paidMemberships
                )}
                description="Successful paid membership purchases."
                icon={Crown}
                active={
                  selectedMetric ===
                  "PAID_MEMBERSHIPS"
                }
                onClick={() =>
                  selectMetric(
                    "PAID_MEMBERSHIPS"
                  )
                }
              />

              <SummaryCard
                label="Period Revenue"
                value={formatCurrency(
                  analytics.periodRevenue
                )}
                description="Successful payment revenue."
                icon={WalletCards}
                active={
                  selectedMetric ===
                  "PERIOD_REVENUE"
                }
                onClick={() =>
                  selectMetric(
                    "PERIOD_REVENUE"
                  )
                }
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
                  active={
                    selectedMetric ===
                    "REGISTERED_USERS"
                  }
                  onClick={() =>
                    selectMetric(
                      "REGISTERED_USERS"
                    )
                  }
                />

                <MetricRow
                  label="Total Platform Users"
                  value={formatNumber(
                    analytics.totalUsers
                  )}
                  active={
                    selectedMetric ===
                    "TOTAL_USERS"
                  }
                  onClick={() =>
                    selectMetric(
                      "TOTAL_USERS"
                    )
                  }
                />

                <MetricRow
                  label="Profiles Created"
                  value={formatNumber(
                    analytics.profilesCreated
                  )}
                  active={
                    selectedMetric ===
                    "PROFILES_CREATED"
                  }
                  onClick={() =>
                    selectMetric(
                      "PROFILES_CREATED"
                    )
                  }
                />

                <MetricRow
                  label="Completed Profiles"
                  value={formatNumber(
                    analytics.completedProfiles
                  )}
                  active={
                    selectedMetric ===
                    "COMPLETED_PROFILES"
                  }
                  onClick={() =>
                    selectMetric(
                      "COMPLETED_PROFILES"
                    )
                  }
                />

                <MetricRow
                  label="Incomplete Profiles"
                  value={formatNumber(
                    analytics.incompleteProfiles
                  )}
                  active={
                    selectedMetric ===
                    "INCOMPLETE_PROFILES"
                  }
                  onClick={() =>
                    selectMetric(
                      "INCOMPLETE_PROFILES"
                    )
                  }
                />

                <MetricRow
                  label="Browse Visible"
                  value={formatNumber(
                    analytics.browseVisibleProfiles
                  )}
                  active={
                    selectedMetric ===
                    "BROWSE_VISIBLE"
                  }
                  onClick={() =>
                    selectMetric(
                      "BROWSE_VISIBLE"
                    )
                  }
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
                  active={
                    selectedMetric ===
                    "PAID_MEMBERSHIPS"
                  }
                  onClick={() =>
                    selectMetric(
                      "PAID_MEMBERSHIPS"
                    )
                  }
                />

                <MetricRow
                  label="Silver"
                  value={formatNumber(
                    analytics.silverMemberships
                  )}
                  active={
                    selectedMetric ===
                    "SILVER_MEMBERSHIPS"
                  }
                  onClick={() =>
                    selectMetric(
                      "SILVER_MEMBERSHIPS"
                    )
                  }
                />

                <MetricRow
                  label="Gold"
                  value={formatNumber(
                    analytics.goldMemberships
                  )}
                  active={
                    selectedMetric ===
                    "GOLD_MEMBERSHIPS"
                  }
                  onClick={() =>
                    selectMetric(
                      "GOLD_MEMBERSHIPS"
                    )
                  }
                />

                <MetricRow
                  label="Platinum"
                  value={formatNumber(
                    analytics.platinumMemberships
                  )}
                  active={
                    selectedMetric ===
                    "PLATINUM_MEMBERSHIPS"
                  }
                  onClick={() =>
                    selectMetric(
                      "PLATINUM_MEMBERSHIPS"
                    )
                  }
                />
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Payment Health"
                icon={WalletCards}
              >
                <MetricRow
                  label="Successful"
                  value={formatNumber(
                    analytics.successfulPayments
                  )}
                  icon={
                    CheckCircle2
                  }
                  active={
                    selectedMetric ===
                    "SUCCESSFUL_PAYMENTS"
                  }
                  onClick={() =>
                    selectMetric(
                      "SUCCESSFUL_PAYMENTS"
                    )
                  }
                />

                <MetricRow
                  label="Pending"
                  value={formatNumber(
                    analytics.pendingPayments
                  )}
                  icon={Clock3}
                  active={
                    selectedMetric ===
                    "PENDING_PAYMENTS"
                  }
                  onClick={() =>
                    selectMetric(
                      "PENDING_PAYMENTS"
                    )
                  }
                />

                <MetricRow
                  label="Failed"
                  value={formatNumber(
                    analytics.failedPayments
                  )}
                  icon={XCircle}
                  active={
                    selectedMetric ===
                    "FAILED_PAYMENTS"
                  }
                  onClick={() =>
                    selectMetric(
                      "FAILED_PAYMENTS"
                    )
                  }
                />
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Revenue & Conversion"
                icon={TrendingUp}
              >
                <MetricRow
                  label="Period Revenue"
                  value={formatCurrency(
                    analytics.periodRevenue
                  )}
                  active={
                    selectedMetric ===
                    "PERIOD_REVENUE"
                  }
                  onClick={() =>
                    selectMetric(
                      "PERIOD_REVENUE"
                    )
                  }
                />

                <MetricRow
                  label="Lifetime Revenue"
                  value={formatCurrency(
                    analytics.lifetimeRevenue
                  )}
                  active={
                    selectedMetric ===
                    "LIFETIME_REVENUE"
                  }
                  onClick={() =>
                    selectMetric(
                      "LIFETIME_REVENUE"
                    )
                  }
                />

                <StaticMetricRow
                  label="Registered → Profile"
                  value={formatPercent(
                    analytics.registrationToProfileRate
                  )}
                />

                <StaticMetricRow
                  label="Registered → Paid"
                  value={formatPercent(
                    analytics.registrationToPaidRate
                  )}
                />
              </AnalyticsPanel>
            </section>
          </>
        )}

      <section
        id="analytics-details"
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
      >
        <div className="border-b border-slate-200 p-4 sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Eye
                    size={21}
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                    Drill-down
                  </p>

                  <h2 className="text-xl font-black text-[#0B2D5C] sm:text-2xl">
                    {details?.title ??
                      "Analytics Details"}
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {selectedMetric ===
                  "TOTAL_USERS" ||
                selectedMetric ===
                  "LIFETIME_REVENUE"
                  ? "Lifetime platform data."
                  : `${appliedFrom} through ${appliedTo}`}
              </p>
            </div>

            <form
              onSubmit={
                submitSearch
              }
              className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, email, mobile, plan..."
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#0B2D5C] px-5 text-sm font-bold text-white transition hover:bg-[#123e78] sm:w-auto"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {detailsError && (
          <div className="p-6">
            <ErrorBox
              message={
                detailsError
              }
            />
          </div>
        )}

        {detailsLoading && (
          <LoadingBlock
            label="Loading records..."
          />
        )}

        {!detailsLoading &&
          details && (
            <>
              <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="font-bold text-slate-700">
                  {formatNumber(
                    details.totalElements
                  )}{" "}
                  {details.totalElements ===
                  1
                    ? "record"
                    : "records"}
                </p>

                {appliedSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setAppliedSearch("");
                      setPage(0);
                    }}
                    className="text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>

              <DetailTable
                metric={
                  selectedMetric
                }
                rows={
                  details.rows
                }
              />

              <Pagination
                page={
                  details.page
                }
                totalPages={
                  details.totalPages
                }
                totalElements={
                  details.totalElements
                }
                pageSize={
                  details.size
                }
                onPrevious={() =>
                  setPage((current) =>
                    Math.max(
                      0,
                      current - 1
                    )
                  )
                }
                onNext={() =>
                  setPage((current) =>
                    Math.min(
                      Math.max(
                        0,
                        details.totalPages -
                          1
                      ),
                      current + 1
                    )
                  )
                }
              />
            </>
          )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: string;
  description: string;
  icon: IconType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-6 ${
        active
          ? "border-blue-400 ring-2 ring-blue-100"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-500">
            {label}
          </p>

          <p className="mt-2 break-words text-2xl font-black text-[#0B2D5C] sm:mt-3 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition ${
            active
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
          }`}
        >
          <Icon
            size={23}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-blue-600">
        View details →
      </p>
    </button>
  );
}

function AnalyticsPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: IconType;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon
            size={21}
          />
        </div>

        <h2 className="text-xl font-black text-[#0B2D5C] sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: string;
  icon?: IconType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-1 py-4 text-left transition ${
        active
          ? "bg-blue-50 px-3"
          : "hover:bg-slate-50 hover:px-3"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <Icon
            size={17}
            className={
              active
                ? "text-blue-700"
                : "text-slate-400"
            }
          />
        )}

        <span
          className={`font-semibold ${
            active
              ? "text-blue-800"
              : "text-slate-500"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="shrink-0 font-black text-slate-900">
          {value}
        </span>

        <Eye
          size={16}
          className={
            active
              ? "text-blue-700"
              : "text-slate-300"
          }
        />
      </div>
    </button>
  );
}

function StaticMetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="font-semibold text-slate-500">
        {label}
      </span>

      <span className="font-black text-slate-900">
        {value}
      </span>
    </div>
  );
}

function DetailTable({
  metric,
  rows,
}: {
  metric: AdminAnalyticsMetric;
  rows: AdminAnalyticsDetailRow[];
}) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-[250px] items-center justify-center p-8 text-center">
        <div>
          <Search
            size={34}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-black text-slate-700">
            No records found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            No data matches this
            metric and reporting period.
          </p>
        </div>
      </div>
    );
  }

  if (
    isUserMetric(metric)
  ) {
    return (
      <>
        <MobileDetailCards
          metric={metric}
          rows={rows}
        />
        <UserTable
          rows={rows}
        />
      </>
    );
  }

  if (
    isProfileMetric(metric)
  ) {
    return (
      <>
        <MobileDetailCards
          metric={metric}
          rows={rows}
        />
        <ProfileTable
          rows={rows}
        />
      </>
    );
  }

  if (
    isMembershipMetric(metric)
  ) {
    return (
      <>
        <MobileDetailCards
          metric={metric}
          rows={rows}
        />
        <MembershipTable
          rows={rows}
        />
      </>
    );
  }

  if (
    isPaymentMetric(metric)
  ) {
    return (
      <>
        <MobileDetailCards
          metric={metric}
          rows={rows}
        />
        <PaymentTable
          rows={rows}
        />
      </>
    );
  }

  return null;
}

function MobileDetailCards({
  metric,
  rows,
}: {
  metric: AdminAnalyticsMetric;
  rows: AdminAnalyticsDetailRow[];
}) {
  return (
    <div className="space-y-3 p-3 md:hidden">
      {rows.map((row) => (
        <article
          key={row.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-900">
                  {row.name || "Unnamed customer"}
                </p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {row.email || "No email"}
                </p>
              </div>

              {row.membershipPlan && (
                <div className="shrink-0">
                  <Badge value={row.membershipPlan} />
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 px-4">
            {isUserMetric(metric) && (
              <>
                <MobileField
                  label="Mobile"
                  value={row.mobile || "—"}
                />
                <MobileField
                  label="Membership"
                  value={row.membershipPlan || "—"}
                  badge
                />
                <MobileField
                  label="Account Status"
                  value={row.membershipStatus || "—"}
                  badge
                />
                <MobileField
                  label="Registered"
                  value={formatDateTime(row.registeredAt)}
                />
              </>
            )}

            {isProfileMetric(metric) && (
              <>
                <MobileField
                  label="Gender"
                  value={row.gender || "—"}
                />
                <MobileField
                  label="Location"
                  value={row.location || "—"}
                />
                <MobileField
                  label="Completion"
                  value={`${row.completionPercentage ?? 0}%`}
                />
                <MobileField
                  label="Browse"
                  value={
                    row.profileCompleted
                      ? "LIVE"
                      : "HIDDEN"
                  }
                  badge
                />
                <MobileField
                  label="Verification"
                  value={row.verificationStatus || "—"}
                  badge
                />
                <MobileField
                  label="Profile Created"
                  value={formatDate(row.createdAt)}
                />
              </>
            )}

            {isMembershipMetric(metric) && (
              <>
                <MobileField
                  label="Plan"
                  value={row.membershipPlan || "—"}
                  badge
                />
                <MobileField
                  label="Amount"
                  value={formatCurrency(row.amount ?? 0)}
                  strong
                />
                <MobileField
                  label="Membership"
                  value={row.membershipStatus || "—"}
                  badge
                />
                <MobileField
                  label="Payment"
                  value={row.paymentStatus || "—"}
                  badge
                />
                <MobileField
                  label="Paid"
                  value={formatDateTime(row.paidAt)}
                />
                <MobileField
                  label="Expires"
                  value={formatDate(row.expiryDate)}
                />
              </>
            )}

            {isPaymentMetric(metric) && (
              <>
                <MobileField
                  label="Plan"
                  value={row.membershipPlan || "—"}
                  badge
                />
                <MobileField
                  label="Amount"
                  value={formatCurrency(row.amount ?? 0)}
                  strong
                />
                <MobileField
                  label="Status"
                  value={row.paymentStatus || "—"}
                  badge
                />
                <MobileField
                  label="Source"
                  value={
                    row.paymentSource ||
                    row.paymentMethod ||
                    "—"
                  }
                />
                <MobileField
                  label="Payment ID"
                  value={
                    row.razorpayPaymentId ||
                    row.razorpayOrderId ||
                    "—"
                  }
                  mono
                />
                <MobileField
                  label="Paid / Created"
                  value={formatDateTime(
                    row.paidAt || row.createdAt
                  )}
                />
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function MobileField({
  label,
  value,
  badge = false,
  strong = false,
  mono = false,
}: {
  label: string;
  value: string;
  badge?: boolean;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-3">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <div className="min-w-0 text-right">
        {badge && value !== "—" ? (
          <Badge value={value} />
        ) : (
          <span
            className={`break-words text-sm ${
              strong
                ? "font-black text-slate-900"
                : "font-semibold text-slate-700"
            } ${
              mono
                ? "break-all font-mono text-xs"
                : ""
            }`}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

function UserTable({
  rows,
}: {
  rows: AdminAnalyticsDetailRow[];
}) {
  return (
    <TableShell>
      <thead>
        <tr>
          <TableHeader>
            Customer
          </TableHeader>
          <TableHeader>
            Mobile
          </TableHeader>
          <TableHeader>
            Membership
          </TableHeader>
          <TableHeader>
            Account Status
          </TableHeader>
          <TableHeader>
            Registered
          </TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr
            key={row.id}
            className="hover:bg-slate-50"
          >
            <TableCell>
              <PersonCell
                name={row.name}
                email={row.email}
              />
            </TableCell>

            <TableCell>
              {row.mobile ||
                "—"}
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.membershipPlan
                }
              />
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.membershipStatus
                }
              />
            </TableCell>

            <TableCell>
              {formatDateTime(
                row.registeredAt
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function ProfileTable({
  rows,
}: {
  rows: AdminAnalyticsDetailRow[];
}) {
  return (
    <TableShell>
      <thead>
        <tr>
          <TableHeader>
            Member
          </TableHeader>
          <TableHeader>
            Gender
          </TableHeader>
          <TableHeader>
            Location
          </TableHeader>
          <TableHeader>
            Completion
          </TableHeader>
          <TableHeader>
            Browse
          </TableHeader>
          <TableHeader>
            Verification
          </TableHeader>
          <TableHeader>
            Profile Created
          </TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr
            key={row.id}
            className="hover:bg-slate-50"
          >
            <TableCell>
              <PersonCell
                name={row.name}
                email={row.email}
              />
            </TableCell>

            <TableCell>
              {row.gender ||
                "—"}
            </TableCell>

            <TableCell>
              {row.location ||
                "—"}
            </TableCell>

            <TableCell>
              <div className="min-w-28">
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span>
                    {row.completionPercentage ??
                      0}
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          row.completionPercentage ??
                            0
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.profileCompleted
                    ? "LIVE"
                    : "HIDDEN"
                }
              />
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.verificationStatus
                }
              />
            </TableCell>

            <TableCell>
              {formatDate(
                row.createdAt
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function MembershipTable({
  rows,
}: {
  rows: AdminAnalyticsDetailRow[];
}) {
  return (
    <TableShell>
      <thead>
        <tr>
          <TableHeader>
            Customer
          </TableHeader>
          <TableHeader>
            Plan
          </TableHeader>
          <TableHeader>
            Amount
          </TableHeader>
          <TableHeader>
            Membership
          </TableHeader>
          <TableHeader>
            Payment
          </TableHeader>
          <TableHeader>
            Paid
          </TableHeader>
          <TableHeader>
            Expires
          </TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr
            key={row.id}
            className="hover:bg-slate-50"
          >
            <TableCell>
              <PersonCell
                name={row.name}
                email={row.email}
              />
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.membershipPlan
                }
              />
            </TableCell>

            <TableCell>
              <span className="font-bold text-slate-900">
                {formatCurrency(
                  row.amount ?? 0
                )}
              </span>
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.membershipStatus
                }
              />
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.paymentStatus
                }
              />
            </TableCell>

            <TableCell>
              {formatDateTime(
                row.paidAt
              )}
            </TableCell>

            <TableCell>
              {formatDate(
                row.expiryDate
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function PaymentTable({
  rows,
}: {
  rows: AdminAnalyticsDetailRow[];
}) {
  return (
    <TableShell>
      <thead>
        <tr>
          <TableHeader>
            Customer
          </TableHeader>
          <TableHeader>
            Plan
          </TableHeader>
          <TableHeader>
            Amount
          </TableHeader>
          <TableHeader>
            Status
          </TableHeader>
          <TableHeader>
            Source
          </TableHeader>
          <TableHeader>
            Payment ID
          </TableHeader>
          <TableHeader>
            Paid / Created
          </TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr
            key={row.id}
            className="hover:bg-slate-50"
          >
            <TableCell>
              <PersonCell
                name={row.name}
                email={row.email}
              />
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.membershipPlan
                }
              />
            </TableCell>

            <TableCell>
              <span className="font-bold text-slate-900">
                {formatCurrency(
                  row.amount ?? 0
                )}
              </span>
            </TableCell>

            <TableCell>
              <Badge
                value={
                  row.paymentStatus
                }
              />
            </TableCell>

            <TableCell>
              {row.paymentSource ||
                row.paymentMethod ||
                "—"}
            </TableCell>

            <TableCell>
              <div className="max-w-[190px] truncate font-mono text-xs text-slate-500">
                {row.razorpayPaymentId ||
                  row.razorpayOrderId ||
                  "—"}
              </div>
            </TableCell>

            <TableCell>
              {formatDateTime(
                row.paidAt ||
                  row.createdAt
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function TableShell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full text-sm">
        {children}
      </table>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4 align-middle text-slate-600">
      {children}
    </td>
  );
}

function PersonCell({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  return (
    <div>
      <p className="font-bold text-slate-900">
        {name ||
          "Unnamed customer"}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {email ||
          "No email"}
      </p>
    </div>
  );
}

function Badge({
  value,
}: {
  value?:
    | string
    | null;
}) {
  if (!value) {
    return (
      <span className="text-slate-400">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
      {value.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const start =
    totalElements === 0
      ? 0
      : page *
          pageSize +
        1;

  const end =
    Math.min(
      totalElements,
      (page + 1) *
        pageSize
    );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">
          {formatNumber(start)}
        </span>{" "}
        –{" "}
        <span className="font-bold text-slate-700">
          {formatNumber(end)}
        </span>{" "}
        of{" "}
        <span className="font-bold text-slate-700">
          {formatNumber(
            totalElements
          )}
        </span>
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={
            page <= 0
          }
          onClick={
            onPrevious
          }
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-300 px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <ChevronLeft
            size={16}
          />

          Previous
        </button>

        <span className="text-sm font-semibold text-slate-600">
          Page{" "}
          {totalPages === 0
            ? 0
            : page + 1}{" "}
          of{" "}
          {totalPages}
        </span>

        <button
          type="button"
          disabled={
            totalPages === 0 ||
            page >=
              totalPages - 1
          }
          onClick={
            onNext
          }
          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-300 px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4 sm:text-sm"
        >
          Next

          <ChevronRight
            size={16}
          />
        </button>
      </div>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) =>
      void;
}) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="h-[46px] w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-4"
      />
    </label>
  );
}

function ErrorBox({
  message,
}: {
  message: string;
}) {
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
      <AlertCircle
        size={20}
        className="mt-0.5 shrink-0"
      />

      <p className="font-medium">
        {message}
      </p>
    </section>
  );
}

function LoadingBlock({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center">
      <div className="text-center">
        <Loader2
          size={36}
          className="mx-auto animate-spin text-blue-700"
        />

        <p className="mt-4 font-semibold text-slate-600">
          {label}
        </p>
      </div>
    </div>
  );
}
