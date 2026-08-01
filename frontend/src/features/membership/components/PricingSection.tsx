"use client";

import { useState } from "react";

import PricingCard from "./PricingCard";
import PricingToggle from "./PricingToggle";

import { membershipPlans } from "../data/plans";
import { BillingCycle } from "../types/membership";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("monthly");

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Membership Plans
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Choose Your Membership
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Find the perfect membership that matches your journey towards a
            blessed Christian marriage. Upgrade anytime to unlock more
            connections and premium features.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="mt-12">
          <PricingToggle
            value={billingCycle}
            onChange={setBillingCycle}
          />
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:mt-16 xl:grid-cols-4">
          {membershipPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
            />
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="text-sm text-gray-500">
            ✓ Secure Payments &nbsp; • &nbsp;
            ✓ Upgrade Anytime &nbsp; • &nbsp;
            ✓ No Hidden Charges &nbsp; • &nbsp;
            ✓ Trusted Christian Community
          </p>
        </div>
      </div>
    </section>
  );
}