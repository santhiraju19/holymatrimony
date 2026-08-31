"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Crown,
  HeartHandshake,
  Loader2,
  MessageCircle,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  adminService,
} from "../api/admin.service";

import type {
  AdminDashboardData,
} from "../types";

import AdminStatCard from "./AdminStatCard";

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value ?? 0);
}

function formatNumber(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value ?? 0);
}

function formatPercent(
  value: number
): string {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

export default function AdminDashboard() {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboardData | null>(
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

  const loadDashboard =
    useCallback(
      async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await adminService.getDashboard();

          setDashboard(result);
        } catch (
          caughtError: unknown
        ) {
          setDashboard(null);

          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to load the admin dashboard."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="mx-auto animate-spin text-blue-700"
          />

          <p className="mt-4 font-semibold text-slate-600">
            Loading business analytics...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !dashboard
  ) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle
          size={40}
          className="mx-auto text-red-600"
        />

        <h2 className="mt-4 text-xl font-bold text-red-700">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-red-600">
          {error ??
            "The dashboard data is unavailable."}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadDashboard()
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw size={17} />
          Try Again
        </button>
      </section>
    );
  }

  const primaryCards = [
    {
      title: "Total Users",
      value: formatNumber(
        dashboard.totalUsers
      ),
      description:
        "All registered customer accounts.",
      icon: Users,
    },
    {
      title: "Completed Profiles",
      value: formatNumber(
        dashboard.completedProfiles
      ),
      description:
        `${formatPercent(
          dashboard.profileCompletionRate
        )} of created profiles are complete.`,
      icon: UserRoundCheck,
    },
    {
      title: "Paid Members",
      value: formatNumber(
        dashboard.activePaidMemberships
      ),
      description:
        "Currently active paid memberships.",
      icon: Crown,
    },
    {
      title: "Lifetime Revenue",
      value: formatCurrency(
        dashboard.totalRevenue
      ),
      description:
        "Revenue from successful payments.",
      icon: BadgeIndianRupee,
    },
  ];

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-indigo-700 p-7 text-white shadow-xl sm:p-9">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E8CB6A]">
              Holy Matrimony Administration
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Business Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-blue-100">
              Monitor registrations,
              profile completion,
              memberships, payments,
              revenue and customer
              conversion from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map(
          (card) => (
            <AdminStatCard
              key={card.title}
              {...card}
            />
          )
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardSection
          title="User Registrations"
          description="Track how quickly the customer base is growing."
          icon={Users}
          href="/admin/users"
          hrefLabel="View Users"
        >
          <MetricGrid>
            <Metric
              label="Today"
              value={formatNumber(
                dashboard.usersToday
              )}
            />

            <Metric
              label="Last 7 Days"
              value={formatNumber(
                dashboard.usersLast7Days
              )}
            />

            <Metric
              label="This Month"
              value={formatNumber(
                dashboard.usersThisMonth
              )}
            />

            <Metric
              label="All Time"
              value={formatNumber(
                dashboard.totalUsers
              )}
            />
          </MetricGrid>
        </DashboardSection>

        <DashboardSection
          title="Profile Completion"
          description="Completed profiles are eligible for Browse visibility."
          icon={UserCheck}
          href="/admin/profiles"
          hrefLabel="View Profiles"
        >
          <MetricGrid>
            <Metric
              label="Profiles Started"
              value={formatNumber(
                dashboard.totalProfiles
              )}
            />

            <Metric
              label="Completed"
              value={formatNumber(
                dashboard.completedProfiles
              )}
              positive
            />

            <Metric
              label="Incomplete"
              value={formatNumber(
                dashboard.incompleteProfiles
              )}
              warning
            />

            <Metric
              label="Browse Visible"
              value={formatNumber(
                dashboard.browseVisibleProfiles
              )}
              positive
            />
          </MetricGrid>

          <ProgressMetric
            label="Profile Completion Rate"
            value={
              dashboard.profileCompletionRate
            }
          />
        </DashboardSection>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardSection
          title="Memberships"
          description="Current active paid membership distribution."
          icon={Crown}
          href="/admin/memberships"
          hrefLabel="View Memberships"
        >
          <MetricGrid>
            <Metric
              label="Silver"
              value={formatNumber(
                dashboard.activeSilverMemberships
              )}
            />

            <Metric
              label="Gold"
              value={formatNumber(
                dashboard.activeGoldMemberships
              )}
            />

            <Metric
              label="Platinum"
              value={formatNumber(
                dashboard.activePlatinumMemberships
              )}
            />

            <Metric
              label="Paid Active"
              value={formatNumber(
                dashboard.activePaidMemberships
              )}
              positive
            />
          </MetricGrid>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <CalendarClock
                size={21}
                className="text-amber-700"
              />

              <div>
                <p className="font-semibold text-amber-900">
                  Expiring in 7 days
                </p>

                <p className="text-sm text-amber-700">
                  Paid memberships needing
                  renewal attention.
                </p>
              </div>
            </div>

            <span className="text-2xl font-black text-amber-800">
              {formatNumber(
                dashboard
                  .membershipsExpiringIn7Days
              )}
            </span>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Revenue"
          description="Successful payment revenue only."
          icon={CircleDollarSign}
          href="/admin/payments"
          hrefLabel="View Payments"
        >
          <MetricGrid>
            <Metric
              label="Today"
              value={formatCurrency(
                dashboard.revenueToday
              )}
              positive
            />

            <Metric
              label="This Month"
              value={formatCurrency(
                dashboard.revenueThisMonth
              )}
              positive
            />

            <Metric
              label="Lifetime"
              value={formatCurrency(
                dashboard.totalRevenue
              )}
              positive
            />

            <Metric
              label="Transactions"
              value={formatNumber(
                dashboard.totalPayments
              )}
            />
          </MetricGrid>
        </DashboardSection>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardSection
          title="Payment Health"
          description="Status of recorded payment transactions."
          icon={CreditCard}
          href="/admin/payments"
          hrefLabel="Payment Details"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <StatusMetric
              label="Successful"
              value={
                dashboard.successfulPayments
              }
              icon={CheckCircle2}
              type="success"
            />

            <StatusMetric
              label="Pending"
              value={
                dashboard.pendingPayments
              }
              icon={Clock3}
              type="warning"
            />

            <StatusMetric
              label="Failed"
              value={
                dashboard.failedPayments
              }
              icon={XCircle}
              type="danger"
            />
          </div>
        </DashboardSection>

        <DashboardSection
          title="Matchmaking Activity"
          description="Overall customer engagement across the platform."
          icon={HeartHandshake}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ActivityMetric
              icon={HeartHandshake}
              label="Interests Sent"
              value={
                dashboard.totalInterests
              }
            />

            <ActivityMetric
              icon={MessageCircle}
              label="Messages"
              value={
                dashboard.totalMessages
              }
            />
          </div>
        </DashboardSection>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <TrendingUp size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-[#0B2D5C]">
              Customer Conversion Funnel
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how registered customers
              progress into complete profiles
              and paid members.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <FunnelRow
            label="Registered Users"
            value={
              dashboard.totalUsers
            }
            percent={100}
          />

          <FunnelRow
            label="Completed Profiles"
            value={
              dashboard.completedProfiles
            }
            percent={
              dashboard
                .registrationToProfileRate
            }
          />

          <FunnelRow
            label="Active Paid Members"
            value={
              dashboard
                .activePaidMemberships
            }
            percent={
              dashboard
                .registrationToPaidRate
            }
          />
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <ConversionCard
            label="Registration → Profile"
            value={
              dashboard
                .registrationToProfileRate
            }
          />

          <ConversionCard
            label="Registration → Paid"
            value={
              dashboard
                .registrationToPaidRate
            }
          />
        </div>
      </section>
    </main>
  );
}

function DashboardSection({
  title,
  description,
  icon: Icon,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0B2D5C]">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {href && hrefLabel && (
          <Link
            href={href}
            className="shrink-0 text-sm font-bold text-blue-700 transition hover:text-blue-900"
          >
            {hrefLabel} →
          </Link>
        )}
      </div>

      <div className="mt-6">
        {children}
      </div>
    </article>
  );
}

function MetricGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  positive = false,
  warning = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  warning?: boolean;
}) {
  const valueClass =
    positive
      ? "text-emerald-700"
      : warning
        ? "text-amber-700"
        : "text-slate-900";

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressMetric({
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
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-600">
          {label}
        </span>

        <span className="font-black text-[#0B2D5C]">
          {safeValue.toFixed(1)}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusMetric({
  label,
  value,
  icon: Icon,
  type,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  type:
    | "success"
    | "warning"
    | "danger";
}) {
  const styles = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning:
      "border-amber-200 bg-amber-50 text-amber-700",
    danger:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${styles[type]}`}
    >
      <Icon size={21} />

      <p className="mt-4 text-2xl font-black">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {label}
      </p>
    </div>
  );
}

function ActivityMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <Icon
        size={22}
        className="text-blue-700"
      />

      <p className="mt-4 text-3xl font-black text-[#0B2D5C]">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  percent,
}: {
  label: string;
  value: number;
  percent: number;
}) {
  const safePercent =
    Math.min(
      100,
      Math.max(
        0,
        Number(percent ?? 0)
      )
    );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-semibold text-slate-700">
          {label}
        </span>

        <div className="text-right">
          <span className="font-black text-slate-900">
            {formatNumber(value)}
          </span>

          <span className="ml-2 text-sm font-semibold text-slate-500">
            {safePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] to-indigo-600"
          style={{
            width: `${safePercent}%`,
          }}
        />
      </div>
    </div>
  );
}

function ConversionCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
      <p className="text-sm font-semibold text-indigo-700">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-indigo-900">
        {formatPercent(value)}
      </p>
    </div>
  );
}
