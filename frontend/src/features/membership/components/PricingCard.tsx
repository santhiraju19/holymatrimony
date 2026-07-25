"use client";

import { Check, X } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

import {
  MembershipPlan,
  BillingCycle,
} from "../types/membership";

interface PricingCardProps {
  plan: MembershipPlan;
  billingCycle: BillingCycle;
}

export default function PricingCard({
  plan,
  billingCycle,
}: PricingCardProps) {
  const price = plan.price[billingCycle];

  const billingLabel = {
    monthly: "/month",
    quarterly: "/3 months",
    yearly: "/year",
  }[billingCycle];

  const savings = {
    free: "",
    silver: "Save 25%",
    gold: "Save 22%",
    platinum: "Save 24%",
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-8 shadow-sm transition-all duration-300",
        "hover:-translate-y-2 hover:shadow-2xl",
        plan.popular
          ? "border-primary ring-2 ring-primary/20"
          : "border-gray-200"
      )}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <div
          className={cn(
            "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1 text-xs font-bold shadow-md",
            plan.popular
              ? "bg-primary text-white"
              : "bg-slate-900 text-white"
          )}
        >
          {plan.badge}
        </div>
      )}

      {/* Plan Name */}
      <h3 className="mt-4 text-2xl font-bold text-gray-900">
        {plan.name}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {plan.description}
      </p>

      {/* Price */}
      <div className="mt-8">
        {price === 0 ? (
          <>
            <div className="text-5xl font-extrabold text-primary">
              Free
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Start your journey today
            </p>
          </>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold tracking-tight">
                ₹{price.toLocaleString()}
              </span>

              <span className="pb-2 text-gray-500">
                {billingLabel}
              </span>
            </div>

            {billingCycle === "yearly" &&
              savings[plan.id as keyof typeof savings] && (
                <div className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {savings[plan.id as keyof typeof savings]}
                </div>
              )}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="mt-8">
        <Button
          className={cn(
            "w-full",
            plan.popular && "shadow-lg"
          )}
        >
          {plan.buttonText}
        </Button>
      </div>

      {/* Features */}
      <div className="mt-10 flex-1 space-y-4">
        {plan.features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check
                size={14}
                className="text-green-600"
              />
            </div>

            <span className="text-sm text-gray-700">
              {feature}
            </span>
          </div>
        ))}

        {plan.limitations?.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 opacity-60"
          >
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
              <X
                size={14}
                className="text-red-500"
              />
            </div>

            <span className="text-sm text-gray-500 line-through">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 border-t pt-6">
        <p className="text-center text-xs text-gray-400">
          Upgrade or downgrade your membership anytime.
        </p>
      </div>
    </div>
  );
}