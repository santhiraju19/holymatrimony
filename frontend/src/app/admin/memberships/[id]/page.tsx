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
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  Loader2,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import MembershipStatusBadge from "@/features/admin/memberships/components/MembershipStatusBadge";

import {
  getAdminMembership,
} from "@/features/admin/memberships/services/adminMembershipService";

import type {
  AdminMembership,
  MembershipPlan,
} from "@/features/admin/memberships/types/adminMembership";

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

function planClasses(
  plan: MembershipPlan
): string {
  switch (plan) {
    case "SILVER":
      return "bg-slate-100 text-slate-700";

    case "GOLD":
      return "bg-amber-100 text-amber-800";

    case "PLATINUM":
      return "bg-violet-100 text-violet-800";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | boolean
    | null
    | undefined;
}) {
  let display = "—";

  if (
    value !== null &&
    value !== undefined &&
    String(value).trim()
  ) {
    if (
      typeof value ===
      "boolean"
    ) {
      display =
        value
          ? "Yes"
          : "No";
    } else {
      display =
        String(value);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {display}
      </p>
    </div>
  );
}

export default function AdminMembershipDetailPage() {
  const params =
    useParams();

  const rawId =
    params?.id;

  const membershipId =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId;

  const [
    membership,
    setMembership,
  ] =
    useState<AdminMembership | null>(
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
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const loadMembership =
    useCallback(
      async (
        showFullLoader =
          true
      ) => {
        if (
          !membershipId ||
          typeof membershipId !==
            "string"
        ) {
          setError(
            "Invalid membership ID."
          );

          setLoading(false);

          return;
        }

        if (
          showFullLoader
        ) {
          setLoading(true);
        } else {
          setRefreshing(
            true
          );
        }

        setError(null);

        try {
          const result =
            await getAdminMembership(
              membershipId
            );

          setMembership(
            result
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load membership."
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false
          );
        }
      },
      [membershipId]
    );

  useEffect(() => {
    void loadMembership();
  }, [loadMembership]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#0B2D5C]"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading membership...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !membership
  ) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/memberships"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C]"
        >
          <ArrowLeft
            size={17}
          />

          Back to
          Memberships
        </Link>

        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="mt-0.5 text-red-600"
            />

            <div>
              <h2 className="font-black text-red-900">
                Membership could
                not be loaded
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error ||
                  "Unable to load this membership."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/memberships"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C] transition hover:underline"
        >
          <ArrowLeft
            size={17}
          />

          Back to
          Memberships
        </Link>

        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() =>
            void loadMembership(
              false
            )
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Header */}

      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <UserRound
                size={30}
              />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                {
                  membership.fullName
                }
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                {
                  membership.email
                }
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={[
                    "inline-flex rounded-full px-3 py-1 text-xs font-black",
                    planClasses(
                      membership.plan
                    ),
                  ].join(
                    " "
                  )}
                >
                  {
                    membership.plan
                  }
                </span>

                <MembershipStatusBadge
                  status={
                    membership.status
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200">
              Remaining
            </p>

            <p className="mt-1 text-3xl font-black">
              {membership.status ===
              "ACTIVE"
                ? `${membership.daysRemaining} days`
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Member */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <UserRound
            size={20}
            className="text-[#0B2D5C]"
          />

          <h2 className="text-lg font-black text-[#0B2D5C]">
            Member
            Information
          </h2>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <DetailItem
            label="Full Name"
            value={
              membership.fullName
            }
          />

          <DetailItem
            label="Email"
            value={
              membership.email
            }
          />

          <DetailItem
            label="Mobile"
            value={
              membership.mobile
            }
          />

          <DetailItem
            label="User ID"
            value={
              membership.userId
            }
          />
        </div>
      </section>

      {/* Membership */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <Crown
            size={20}
            className="text-[#B38B19]"
          />

          <h2 className="text-lg font-black text-[#0B2D5C]">
            Membership
            Details
          </h2>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Plan"
            value={
              membership.plan
            }
          />

          <DetailItem
            label="Billing Cycle"
            value={formatCycle(
              membership.billingCycle
            )}
          />

          <DetailItem
            label="Status"
            value={
              membership.status
            }
          />

          <DetailItem
            label="Start Date"
            value={formatDateTime(
              membership.startDate
            )}
          />

          <DetailItem
            label="Expiry Date"
            value={formatDateTime(
              membership.expiryDate
            )}
          />

          <DetailItem
            label="Days Remaining"
            value={
              membership.status ===
              "ACTIVE"
                ? membership.daysRemaining
                : 0
            }
          />

          <DetailItem
            label="Auto Renew"
            value={
              membership.autoRenew
            }
          />

          <DetailItem
            label="Membership ID"
            value={
              membership.membershipId
            }
          />
        </div>
      </section>

      {/* Payment */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <CreditCard
            size={20}
            className="text-[#0B2D5C]"
          />

          <h2 className="text-lg font-black text-[#0B2D5C]">
            Payment
            Information
          </h2>
        </div>

        <div className="p-5">
          {membership.paymentId ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="font-bold text-emerald-900">
                  Payment linked
                </p>

                <p className="mt-1 break-all text-sm text-emerald-700">
                  {
                    membership.paymentId
                  }
                </p>

                <p className="mt-2 text-xs text-emerald-700">
                  We can link this
                  directly to the
                  admin Payments
                  page in the next
                  module.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
              <p className="font-bold text-blue-900">
                No payment linked
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                This membership
                may have been
                activated through
                a waiver, coupon,
                promotional or
                manual flow.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Audit */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <Clock3
            size={20}
            className="text-[#0B2D5C]"
          />

          <h2 className="text-lg font-black text-[#0B2D5C]">
            Audit
            Information
          </h2>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <DetailItem
            label="Created"
            value={formatDateTime(
              membership.createdAt
            )}
          />

          <DetailItem
            label="Last Updated"
            value={formatDateTime(
              membership.updatedAt
            )}
          />
        </div>
      </section>

      {membership.status ===
        "ACTIVE" &&
        membership.daysRemaining <=
          7 && (
          <section className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <CalendarDays
              size={22}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <h3 className="font-black text-amber-900">
                Membership
                expiring soon
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                This membership
                has{" "}
                {
                  membership.daysRemaining
                }{" "}
                day(s) remaining.
              </p>
            </div>
          </section>
        )}
    </div>
  );
}