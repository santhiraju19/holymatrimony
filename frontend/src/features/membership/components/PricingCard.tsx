"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import Button from "@/components/ui/button";
import { cn } from "@/utils/cn";

import type {
  BillingCycle,
  MembershipPlan,
} from "../types/membership";

interface PricingCardProps {
  plan: MembershipPlan;
  billingCycle: BillingCycle;
}

export default function PricingCard({
  plan,
  billingCycle,
}: PricingCardProps) {
  const router = useRouter();

  const price = plan.price[billingCycle];

  const billingLabel: Record<
    BillingCycle,
    string
  > = {
    monthly: "/month",
    quarterly: "/3 months",
    yearly: "/year",
  };

  const yearlySavings: Record<
    MembershipPlan["id"],
    string
  > = {
    free: "",
    silver: "Save 25%",
    gold: "Save 22%",
    platinum: "Save 24%",
  };

  function handlePlanSelection() {
    if (plan.id === "free") {
      router.push("/register");
      return;
    }

    const params =
      new URLSearchParams({
        plan: plan.id,
        billingCycle,
      });

    router.push(
      `/membership/checkout?${params.toString()}`
    );
  }

  return (
    <div className="relative pt-5">
      {plan.badge && (
        <div
          className={cn(
            "absolute left-1/2 top-0 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold shadow-lg",
            plan.id === "free" &&
              "bg-emerald-600 text-white",

            plan.id === "silver" &&
              "bg-blue-600 text-white",

            plan.id === "gold" &&
              "bg-amber-500 text-slate-950",

            plan.id === "platinum" &&
              "bg-violet-700 text-white"
          )}
        >
          {plan.badge}
        </div>
      )}

      <div
        className={cn(
          "relative flex h-full flex-col rounded-3xl border bg-white px-6 pb-8 pt-14 shadow-sm transition-all duration-300 md:px-8",
          "hover:-translate-y-2 hover:shadow-2xl",
          plan.popular
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-200"
        )}
      >
        <h3 className="text-2xl font-bold text-slate-900">
          {plan.name}
        </h3>

        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
          {plan.description}
        </p>

        <div className="mt-7">
          {price === 0 ? (
            <>
              <div className="text-5xl font-extrabold text-[#0B2D5C]">
                Free
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Start your journey today
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-950 xl:text-5xl">
                  ₹
                  {price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="pb-1 text-sm text-slate-500">
                  {
                    billingLabel[
                      billingCycle
                    ]
                  }
                </span>
              </div>

              {billingCycle ===
                "yearly" &&
                yearlySavings[
                  plan.id
                ] && (
                  <div className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {
                      yearlySavings[
                        plan.id
                      ]
                    }
                  </div>
                )}
            </>
          )}
        </div>

        <div className="mt-8">
          <Button
            type="button"
            className={cn(
              "w-full",
              plan.popular &&
                "shadow-lg"
            )}
            onClick={
              handlePlanSelection
            }
          >
            {plan.buttonText}
          </Button>
        </div>

        <div className="mt-10 flex-1 space-y-4">
          {plan.features.map(
            (feature) => (
              <div
                key={feature}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check
                    size={14}
                    className="text-emerald-600"
                  />
                </div>

                <span className="text-sm leading-6 text-slate-700">
                  {feature}
                </span>
              </div>
            )
          )}

          {plan.limitations?.map(
            (feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 opacity-65"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <X
                    size={14}
                    className="text-red-500"
                  />
                </div>

                <span className="text-sm leading-6 text-slate-500 line-through">
                  {feature}
                </span>
              </div>
            )
          )}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-400">
            Upgrade or downgrade your
            membership anytime.
          </p>
        </div>
      </div>
    </div>
  );
}