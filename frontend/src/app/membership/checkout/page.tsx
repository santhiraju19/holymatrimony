"use client";

import {
  Suspense,
  useEffect,
} from "react";

import {
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useSearchParams,
} from "next/navigation";

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

const paidPlans:
  MembershipTier[] = [
    "silver",
    "gold",
    "platinum",
  ];

const billingCycles:
  BillingCycle[] = [
    "monthly",
    "quarterly",
    "yearly",
  ];

function isPaidPlan(
  value: string | null
): value is MembershipTier {
  return (
    value !== null &&
    paidPlans.includes(
      value as MembershipTier
    )
  );
}

function isBillingCycle(
  value: string | null
): value is BillingCycle {
  return (
    value !== null &&
    billingCycles.includes(
      value as BillingCycle
    )
  );
}

function CheckoutContent() {
  const searchParams =
    useSearchParams();

  const {
    selectedPlan,
    billingCycle,
    setSelectedPlan,
    setBillingCycle,
  } = useMembership();

  const planParam =
    searchParams.get(
      "plan"
    );

  const cycleParam =
    searchParams.get(
      "billingCycle"
    );

  useEffect(() => {
    if (
      isPaidPlan(
        planParam
      ) &&
      planParam !==
        selectedPlan
    ) {
      setSelectedPlan(
        planParam
      );
    }

    if (
      isBillingCycle(
        cycleParam
      ) &&
      cycleParam !==
        billingCycle
    ) {
      setBillingCycle(
        cycleParam
      );
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            Compact Checkout Header
            ===================================================== */}

        <section className="relative overflow-hidden rounded-[20px] border border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-4 py-4 text-white shadow-[0_14px_38px_rgba(11,45,92,0.16)] sm:px-5">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#D4AF37]/12 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#F2D675]">
                <CreditCard
                  size={18}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles
                    size={10}
                    className="text-[#F2D675]"
                  />

                  <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675]">
                    Secure Checkout
                  </p>
                </div>

                <h1 className="mt-0.5 text-xl font-black tracking-[-0.025em] sm:text-2xl">
                  Membership Checkout
                </h1>

                <p className="mt-1 max-w-xl text-[11px] leading-5 text-blue-100 sm:text-xs">
                  Review your selected membership and complete your billing details securely.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[410px]">
              <CheckoutTrustItem
                icon={
                  <ShieldCheck
                    size={13}
                  />
                }
                label="Secure payment"
              />

              <CheckoutTrustItem
                icon={
                  <LockKeyhole
                    size={13}
                  />
                }
                label="Protected details"
              />

              <CheckoutTrustItem
                icon={
                  <CheckCircle2
                    size={13}
                  />
                }
                label="Verified checkout"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            Checkout Workspace
            ===================================================== */}

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0">
            <BillingDetails />
          </section>

          <aside className="min-w-0 lg:sticky lg:top-6">
            <OrderSummary />
          </aside>
        </div>
      </div>
    </main>
  );
}

function CheckoutTrustItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-[9px] font-bold text-blue-100 backdrop-blur">
      <span className="text-emerald-300">
        {icon}
      </span>

      {label}
    </div>
  );
}

function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 py-5 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-28 rounded-[20px] bg-slate-200" />

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[520px] rounded-[18px] bg-slate-200" />

            <div className="h-[430px] rounded-[18px] bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <MembershipProvider>
      <Suspense
        fallback={
          <CheckoutLoading />
        }
      >
        <CheckoutContent />
      </Suspense>
    </MembershipProvider>
  );
}
