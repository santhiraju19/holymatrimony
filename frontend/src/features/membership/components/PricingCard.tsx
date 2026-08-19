"use client";

import {
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import type {
  BillingCycle,
  MembershipPlan,
} from "../types/membership";

interface PricingCardProps {
  plan: MembershipPlan;
  billingCycle: BillingCycle;
}

const billingLabel: Record<
  BillingCycle,
  string
> = {
  monthly:
    "/ month",
  quarterly:
    "/ 3 months",
  yearly:
    "/ year",
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

function getPlanStyles(
  planId: MembershipPlan["id"]
) {
  switch (planId) {
    case "silver":
      return {
        icon:
          "bg-slate-100 text-slate-600",
        accent:
          "from-slate-500 to-slate-600",
        badge:
          "border-slate-200 bg-slate-100 text-slate-700",
      };

    case "gold":
      return {
        icon:
          "bg-amber-100 text-amber-700",
        accent:
          "from-[#D4AF37] to-amber-500",
        badge:
          "border-amber-200 bg-amber-50 text-amber-800",
      };

    case "platinum":
      return {
        icon:
          "bg-violet-100 text-violet-700",
        accent:
          "from-violet-600 to-indigo-700",
        badge:
          "border-violet-200 bg-violet-50 text-violet-700",
      };

    default:
      return {
        icon:
          "bg-emerald-100 text-emerald-700",
        accent:
          "from-emerald-500 to-emerald-600",
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
  }
}

export default function PricingCard({
  plan,
  billingCycle,
}: PricingCardProps) {
  const router =
    useRouter();

  const price =
    plan.price[
      billingCycle
    ];

  const styles =
    getPlanStyles(
      plan.id
    );

  function handlePlanSelection() {
    if (
      plan.id === "free"
    ) {
      router.push(
        "/register"
      );

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

  const yearlySaving =
    billingCycle ===
      "yearly"
      ? yearlySavings[
          plan.id
        ]
      : "";

  return (
    <div
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-[22px] border bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)]",

        plan.popular
          ? "border-[#D4AF37]/70 ring-2 ring-[#D4AF37]/10"
          : "border-slate-200",
      ].join(" ")}
    >
      <div
        className={[
          "h-1.5 w-full bg-gradient-to-r",
          styles.accent,
        ].join(" ")}
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                styles.icon,
              ].join(" ")}
            >
              {plan.id ===
              "gold" ? (
                <Crown
                  size={17}
                />
              ) : plan.id ===
                "platinum" ? (
                <Sparkles
                  size={17}
                />
              ) : (
                <ShieldCheck
                  size={17}
                />
              )}
            </div>

            <div>
              <h3 className="text-base font-black text-[#0B2D5C]">
                {plan.name}
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {plan.description}
              </p>
            </div>
          </div>

          {plan.badge && (
            <span
              className={[
                "shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.07em]",
                styles.badge,
              ].join(" ")}
            >
              {
                plan.badge
              }
            </span>
          )}
        </div>

        <div className="mt-5">
          {price === 0 ? (
            <>
              <div className="text-3xl font-black tracking-tight text-[#0B2D5C]">
                Free
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                No payment required
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-1.5">
                <span className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  ₹
                  {price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="pb-1 text-[10px] font-semibold text-slate-400">
                  {
                    billingLabel[
                      billingCycle
                    ]
                  }
                </span>
              </div>

              {yearlySaving && (
                <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
                  {yearlySaving}
                </span>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={
            handlePlanSelection
          }
          className={[
            "mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl px-4 text-xs font-black transition duration-200",

            plan.popular
              ? "bg-gradient-to-r from-[#0B2D5C] to-blue-700 text-white shadow-[0_7px_20px_rgba(11,45,92,0.20)] hover:-translate-y-0.5 hover:shadow-lg"
              : "border border-slate-200 bg-white text-[#0B2D5C] shadow-sm hover:border-blue-200 hover:bg-blue-50",
          ].join(" ")}
        >
          {plan.buttonText}
        </button>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
            Included
          </p>

          <div className="mt-3 space-y-2.5">
            {plan.features.map(
              (feature) => (
                <div
                  key={
                    feature
                  }
                  className="flex items-start gap-2"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check
                      size={11}
                      strokeWidth={3}
                    />
                  </span>

                  <span className="text-[10px] leading-5 text-slate-600 sm:text-[11px]">
                    {feature}
                  </span>
                </div>
              )
            )}

            {plan.limitations?.map(
              (feature) => (
                <div
                  key={
                    feature
                  }
                  className="flex items-start gap-2 opacity-60"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <X
                      size={11}
                    />
                  </span>

                  <span className="text-[10px] leading-5 text-slate-400 line-through sm:text-[11px]">
                    {feature}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center">
        <p className="text-[9px] font-semibold text-slate-400">
          Upgrade or change membership anytime
        </p>
      </div>
    </div>
  );
}
