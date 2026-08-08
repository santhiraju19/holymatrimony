"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CreditCard,
  HeartHandshake,
  Loader2,
  MessageCircle,
  RefreshCw,
  UserRoundCheck,
  Users,
  WalletCards,
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
  ).format(value);
}

export default function AdminDashboard() {
  const [
    dashboard,
    setDashboard,
  ] = useState<AdminDashboardData | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await adminService
            .getDashboard();

        setDashboard(result);
      } catch (caughtError: unknown) {
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
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-blue-700"
          />

          <p className="mt-4 font-semibold text-slate-600">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-700">
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
          className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
        >
          Try Again
        </button>
      </section>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: dashboard.totalUsers,
      description:
        "Registered Holy Matrimony accounts.",
      icon: Users,
    },
    {
      title: "Profiles",
      value: dashboard.totalProfiles,
      description:
        "Member profiles currently stored.",
      icon: UserRoundCheck,
    },
    {
      title: "Interests",
      value: dashboard.totalInterests,
      description:
        "All matchmaking interests sent.",
      icon: HeartHandshake,
    },
    {
      title: "Messages",
      value: dashboard.totalMessages,
      description:
        "Chat messages across conversations.",
      icon: MessageCircle,
    },
    {
      title: "Memberships",
      value:
        dashboard.totalMemberships,
      description:
        "Membership records in the platform.",
      icon: WalletCards,
    },
    {
      title: "Payments",
      value: dashboard.totalPayments,
      description:
        "Payment transactions recorded.",
      icon: CreditCard,
    },
    {
      title: "Revenue",
      value: formatCurrency(
        dashboard.totalRevenue
      ),
      description:
        "Successful membership revenue.",
      icon: WalletCards,
    },
  ];

  return (
    <main className="space-y-7">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-indigo-700 p-7 text-white shadow-xl sm:p-9">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E8CB6A]">
              Holy Matrimony Administration
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-blue-100">
              Monitor users, profiles,
              matchmaking activity,
              memberships and payments.
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

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AdminStatCard
            key={card.title}
            {...card}
          />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#0B2D5C]">
            Platform Overview
          </h2>

          <div className="mt-5 space-y-4">
            <OverviewRow
              label="Profiles per user"
              value={
                dashboard.totalUsers > 0
                  ? (
                      dashboard.totalProfiles /
                      dashboard.totalUsers
                    ).toFixed(2)
                  : "0"
              }
            />

            <OverviewRow
              label="Interests sent"
              value={
                dashboard.totalInterests
              }
            />

            <OverviewRow
              label="Messages exchanged"
              value={
                dashboard.totalMessages
              }
            />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#0B2D5C]">
            Commerce
          </h2>

          <div className="mt-5 space-y-4">
            <OverviewRow
              label="Membership records"
              value={
                dashboard.totalMemberships
              }
            />

            <OverviewRow
              label="Payment records"
              value={
                dashboard.totalPayments
              }
            />

            <OverviewRow
              label="Revenue"
              value={formatCurrency(
                dashboard.totalRevenue
              )}
            />
          </div>
        </article>
      </section>
    </main>
  );
}

function OverviewRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-none last:pb-0">
      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}
