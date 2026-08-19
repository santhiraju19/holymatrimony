"use client";

import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import PricingCard from "./PricingCard";
import PricingToggle from "./PricingToggle";

import {
  membershipPlans,
} from "../data/plans";

import type {
  BillingCycle,
} from "../types/membership";

export default function PricingSection() {
  const [
    billingCycle,
    setBillingCycle,
  ] =
    useState<BillingCycle>(
      "monthly"
    );

  return (
    <section
      id="plans"
      className="scroll-mt-24 bg-gradient-to-b from-slate-50 via-white to-slate-50/60 py-14 sm:py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
            <Sparkles
              size={10}
            />

            Membership Plans
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.025em] text-[#0B2D5C] sm:text-3xl">
            Choose what fits your journey
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-xs leading-6 text-slate-500 sm:text-sm">
            Start free or unlock more communication, visibility and matchmaking benefits with Silver, Gold or Platinum.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-6">
          <PricingToggle
            value={
              billingCycle
            }
            onChange={
              setBillingCycle
            }
          />
        </div>

        {/* Plans */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {membershipPlans.map(
            (plan) => (
              <PricingCard
                key={
                  plan.id
                }
                plan={
                  plan
                }
                billingCycle={
                  billingCycle
                }
              />
            )
          )}
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-8 grid max-w-4xl gap-2.5 sm:grid-cols-3">
          <TrustItem
            icon={
              <ShieldCheck
                size={14}
              />
            }
            text="Secure membership checkout"
          />

          <TrustItem
            icon={
              <CheckCircle2
                size={14}
              />
            }
            text="No hidden membership charges"
          />

          <TrustItem
            icon={
              <Sparkles
                size={14}
              />
            }
            text="Upgrade when your needs change"
          />
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-500 shadow-sm">
      <span className="text-emerald-600">
        {icon}
      </span>

      {text}
    </div>
  );
}
