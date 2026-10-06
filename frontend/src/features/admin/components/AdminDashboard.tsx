"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowRight,
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
  type LucideIcon,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";

import { adminService } from "../api/admin.service";
import type { AdminDashboardData } from "../types";

import AdminStatCard from "./AdminStatCard";
import AdminButton from "./ui/AdminButton";
import AdminPageHeader from "./ui/AdminPageHeader";
import AdminSectionCard from "./ui/AdminSectionCard";

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

type DashboardIcon = LucideIcon;

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
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-[#0B2D5C]"
          />

          <p className="mt-4 font-semibold text-slate-700">
            Loading business dashboard...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Preparing the latest platform metrics.
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
      <AdminSectionCard
        className="border-red-200"
        contentClassName="py-12"
      >
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={24} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ??
              "The dashboard data is unavailable."}
          </p>

          <div className="mt-5 flex justify-center">
            <AdminButton
              variant="danger"
              icon={
                <RefreshCw size={16} />
              }
              onClick={() =>
                void loadDashboard()
              }
            >
              Try Again
            </AdminButton>
          </div>
        </div>
      </AdminSectionCard>
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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Overview"
        title="Business Dashboard"
        description="Monitor registrations, profile completion, memberships, payments, revenue and customer conversion from one operational view."
        actions={
          <AdminButton
            variant="primary"
            icon={
              <RefreshCw size={16} />
            }
            onClick={() =>
              void loadDashboard()
            }
          >
            Refresh
          </AdminButton>
        }
      >
        <div className="flex flex-wrap gap-2">
          <DashboardPill
            label="Users"
            value={formatNumber(
              dashboard.totalUsers
            )}
          />

          <DashboardPill
            label="Paid Members"
            value={formatNumber(
              dashboard.activePaidMemberships
            )}
          />

          <DashboardPill
            label="Profile Completion"
            value={formatPercent(
              dashboard.profileCompletionRate
            )}
          />
        </div>
      </AdminPageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm">
                <CalendarClock
                  size={19}
                />
              </div>

              <div>
                <p className="font-semibold text-amber-900">
                  Expiring in 7 days
                </p>

                <p className="mt-0.5 text-sm text-amber-700">
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

      <AdminSectionCard
        title="Customer Conversion Funnel"
        description="See how registered customers progress into complete profiles and paid members."
        icon={TrendingUp}
      >
        <div className="space-y-5">
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
      </AdminSectionCard>
    </div>
  );
}

function DashboardPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="text-xs font-bold text-[#0B2D5C]">
        {value}
      </span>
    </div>
  );
}

function DashboardSection({
  title,
  description,
  icon,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  description: string;
  icon: DashboardIcon;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <AdminSectionCard
      title={title}
      description={description}
      icon={icon}
      actions={
        href && hrefLabel ? (
          <Link
            href={href}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-[#0B2D5C]/30 hover:bg-slate-50 hover:text-[#0B2D5C]"
          >
            {hrefLabel}
            <ArrowRight size={14} />
          </Link>
        ) : undefined
      }
    >
      {children}
    </AdminSectionCard>
  );
}

function MetricGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
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
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-2xl font-black tracking-tight",
          valueClass,
        ].join(" ")}
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
    <div className="mt-5 rounded-xl border border-slate-200/80 p-4">
      <div className="mb-2.5 flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-slate-600">
          {label}
        </span>

        <span className="font-black text-[#0B2D5C]">
          {safeValue.toFixed(1)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0B2D5C] transition-all"
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
  icon: DashboardIcon;
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
      className={[
        "rounded-xl border p-4",
        styles[type],
      ].join(" ")}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
        <Icon size={19} />
      </div>

      <p className="mt-4 text-2xl font-black tracking-tight">
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
  icon: DashboardIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B2D5C] shadow-sm">
        <Icon size={20} />
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight text-[#0B2D5C]">
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
    <div className="rounded-xl border border-slate-200/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
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

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0B2D5C]"
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
    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
      <p className="text-sm font-semibold text-[#0B2D5C]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black tracking-tight text-[#0B2D5C]">
        {formatPercent(value)}
      </p>
    </div>
  );
}
