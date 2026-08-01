"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock3,
  Crown,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  getMembership,
} from "@/services/membership/membershipService";

import type {
  MembershipResponse,
} from "@/services/membership/types";

export default function CurrentMembershipCard() {
  const [membership, setMembership] =
    useState<MembershipResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMembership() {
      try {
        setLoading(true);
        setError(null);

        const data = await getMembership();

        if (active) {
          setMembership(data);
        }
      } catch (loadError) {
        console.error(
          "Failed to load membership:",
          loadError
        );

        if (active) {
          setMembership(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load membership details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMembership();

    return () => {
      active = false;
    };
  }, []);

  const formattedExpiryDate =
    useMemo(() => {
      if (!membership?.expiryDate) {
        return null;
      }

      const expiryDate = new Date(
        membership.expiryDate
      );

      if (
        Number.isNaN(expiryDate.getTime())
      ) {
        return null;
      }

      return expiryDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    }, [membership?.expiryDate]);

  const formattedStartDate =
    useMemo(() => {
      if (!membership?.startDate) {
        return null;
      }

      const startDate = new Date(
        membership.startDate
      );

      if (
        Number.isNaN(startDate.getTime())
      ) {
        return null;
      }

      return startDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    }, [membership?.startDate]);

  if (loading) {
    return (
      <section>
        <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-200" />

            <div className="space-y-2">
              <div className="h-7 w-56 rounded bg-slate-200" />
              <div className="h-4 w-44 rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-slate-100"
              />
            ))}
          </div>

          <div className="mt-6 h-20 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!membership) {
    return (
      <section>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-red-700">
            Membership unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error ??
              "We could not load your membership details. Please refresh the page and try again."}
          </p>

          <Link
            href="/membership"
            className="mt-5 inline-flex rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            View membership plans
          </Link>
        </div>
      </section>
    );
  }

  const planLabel =
    membership.plan
      ? membership.plan.replaceAll(
          "_",
          " "
        )
      : "FREE";

  const billingCycleLabel =
    membership.billingCycle
      ? membership.billingCycle.replaceAll(
          "_",
          " "
        )
      : "Not applicable";

  const statusLabel =
    membership.status
      ? membership.status.replaceAll(
          "_",
          " "
        )
      : "UNKNOWN";

  const isActive =
    membership.status === "ACTIVE";

  const isExpired =
    membership.status === "EXPIRED";

  const statusClass = isActive
    ? "text-emerald-600"
    : isExpired
      ? "text-red-600"
      : "text-amber-600";

  const statusBackground = isActive
    ? "bg-emerald-50"
    : isExpired
      ? "bg-red-50"
      : "bg-amber-50";

  const expiryLabel =
    formattedExpiryDate ??
    (membership.plan === "FREE"
      ? "No expiry"
      : "Expiry date unavailable");

  const daysRemaining =
    typeof membership.daysRemaining ===
    "number"
      ? Math.max(
          membership.daysRemaining,
          0
        )
      : 0;

  const daysRemainingLabel =
    membership.plan === "FREE"
      ? "Unlimited free membership"
      : daysRemaining === 1
        ? "1 day remaining"
        : `${daysRemaining} days remaining`;

  return (
    <section>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
              <Crown
                className="text-[#D4AF37]"
                size={30}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0B2D5C]">
                Current Membership
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your active subscription
                details
              </p>
            </div>
          </div>

          <Link
            href="/membership"
            className="inline-flex w-fit rounded-xl bg-[#0B2D5C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123C73]"
          >
            View plans
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              Plan
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#0B2D5C]">
              {planLabel}
            </h3>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              Billing Cycle
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#0B2D5C]">
              {billingCycleLabel}
            </h3>
          </div>

          <div
            className={`rounded-2xl p-5 ${statusBackground}`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={19}
                className={statusClass}
              />

              <p className="text-sm font-medium text-slate-500">
                Status
              </p>
            </div>

            <h3
              className={`mt-2 text-xl font-bold ${statusClass}`}
            >
              {statusLabel}
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-5">
            <Calendar
              className="shrink-0 text-[#0B2D5C]"
              size={22}
            />

            <div>
              <p className="text-sm text-slate-500">
                Validity
              </p>

              <p className="mt-1 font-bold text-[#0B2D5C]">
                {membership.expiryDate
                  ? `Expires on ${expiryLabel}`
                  : expiryLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-5">
            <Clock3
              className="shrink-0 text-[#D4AF37]"
              size={22}
            />

            <div>
              <p className="text-sm text-slate-500">
                Remaining validity
              </p>

              <p className="mt-1 font-bold text-[#0B2D5C]">
                {daysRemainingLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Membership started
            </p>

            <p className="mt-1 font-bold text-[#0B2D5C]">
              {formattedStartDate ??
                "Start date unavailable"}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5">
            <RefreshCw
              size={20}
              className={
                membership.autoRenew
                  ? "text-emerald-600"
                  : "text-slate-400"
              }
            />

            <div>
              <p className="text-sm text-slate-500">
                Auto renewal
              </p>

              <p className="mt-1 font-bold text-[#0B2D5C]">
                {membership.autoRenew
                  ? "Enabled"
                  : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}