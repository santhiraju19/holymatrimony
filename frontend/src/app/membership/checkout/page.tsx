"use client";

import {
  Suspense,
  useEffect,
} from "react";

import { useSearchParams } from "next/navigation";

import BillingDetails from "../BillingDetails";
import OrderSummary from "./OrderSummary";

import {
  MembershipProvider,
  useMembership,
} from "@/features/membership/context/MembershipContext";

import type {
  BillingCycle,
  MembershipTier,
} from "@/features/membership/types/membership";

const paidPlans: MembershipTier[] = [
  "silver",
  "gold",
  "platinum",
];

const billingCycles: BillingCycle[] = [
  "monthly",
  "quarterly",
  "yearly",
];

function isPaidPlan(
  value: string | null
): value is MembershipTier {
  return (
    value !== null &&
    paidPlans.includes(value as MembershipTier)
  );
}

function isBillingCycle(
  value: string | null
): value is BillingCycle {
  return (
    value !== null &&
    billingCycles.includes(value as BillingCycle)
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();

  const {
    selectedPlan,
    billingCycle,
    setSelectedPlan,
    setBillingCycle,
  } = useMembership();

  const planParam = searchParams.get("plan");
  const cycleParam =
    searchParams.get("billingCycle");

  useEffect(() => {
    if (
      isPaidPlan(planParam) &&
      planParam !== selectedPlan
    ) {
      setSelectedPlan(planParam);
    }

    if (
      isBillingCycle(cycleParam) &&
      cycleParam !== billingCycle
    ) {
      setBillingCycle(cycleParam);
    }
  }, [
    planParam,
    cycleParam,
    selectedPlan,
    billingCycle,
    setSelectedPlan,
    setBillingCycle,
  ]);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Secure checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Membership Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Review your membership and complete your
            billing details.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BillingDetails />
          </div>

          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="animate-pulse">
          <div className="h-8 w-72 rounded bg-gray-200" />

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="h-96 rounded-3xl bg-gray-200 lg:col-span-2" />

            <div className="h-96 rounded-3xl bg-gray-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <MembershipProvider>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    </MembershipProvider>
  );
}