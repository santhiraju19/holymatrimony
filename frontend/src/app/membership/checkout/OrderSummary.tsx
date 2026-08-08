"use client";

import { useState } from "react";

import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Tag,
} from "lucide-react";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";

import { useMembership } from "@/features/membership/context/MembershipContext";

import {
  membershipActivationService,
  type WaiverPlan,
} from "@/features/membership/services/membershipActivation.service";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      "Membership activation failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Membership activation failed.";
}

export default function OrderSummary() {
  const router = useRouter();

  const {
    plan,
    billingCycle,
    subtotal,
    discount,
    gst,
    total,
    couponCode,
    checkoutData,
    resetCheckout,
  } = useMembership();

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!plan) {
    return null;
  }

  const normalizedCoupon =
    couponCode.trim().toUpperCase();

  const isEligiblePlan =
    checkoutData.plan === "silver" ||
    checkoutData.plan === "gold" ||
    checkoutData.plan === "platinum";

  const isHoly100Eligible =
    normalizedCoupon === "HOLY100" &&
    billingCycle === "monthly" &&
    isEligiblePlan &&
    total === 0;

  async function activateWaivedPlan(): Promise<void> {
    setError("");

    if (
      !checkoutData.fullName ||
      !checkoutData.email ||
      !checkoutData.phone
    ) {
      setError(
        "Please complete your billing details."
      );
      return;
    }

    if (normalizedCoupon !== "HOLY100") {
      setError(
        "Enter coupon code HOLY100 to activate this monthly plan free."
      );
      return;
    }

    if (billingCycle !== "monthly") {
      setError(
        "HOLY100 is valid only for monthly memberships."
      );
      return;
    }

    if (!isEligiblePlan) {
      setError(
        "HOLY100 is valid only for Silver, Gold, and Platinum plans."
      );
      return;
    }

    if (total !== 0) {
      setError(
        "The coupon must reduce the total payable amount to ₹0."
      );
      return;
    }

    try {
      setLoading(true);

      await membershipActivationService.activateHoly100({
        plan:
          checkoutData.plan.toUpperCase() as WaiverPlan,
        billingCycle: "MONTHLY",
        couponCode: "HOLY100",
      });

      setSuccess(true);

      window.setTimeout(() => {
        resetCheckout();

        router.push(
          "/dashboard/membership?activated=true"
        );
      }, 1500);
    } catch (activationError) {
      console.error(
        "Membership activation failed:",
        activationError
      );

      setError(
        getErrorMessage(activationError)
      );
    } finally {
      setLoading(false);
    }
  }

  function handleUnavailablePayment(): void {
    setError(
      "Quarterly and yearly online payments will be available in the next update. HOLY100 applies only to monthly plans."
    );
  }

  return (
    <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        Order Summary
      </h2>

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 text-emerald-600"
              size={20}
            />

            <div>
              <p className="font-bold text-emerald-800">
                Membership Activated
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Your monthly membership is now active.
                Redirecting to your membership centre...
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-8 space-y-5">
        <div className="flex justify-between gap-4">
          <span className="text-slate-600">
            Plan
          </span>

          <strong className="text-right text-slate-900">
            {plan.name}
          </strong>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-600">
            Billing Cycle
          </span>

          <strong className="capitalize text-slate-900">
            {billingCycle}
          </strong>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-600">
            Membership Fee
          </span>

          <strong className="text-slate-900">
            ₹{subtotal.toLocaleString()}
          </strong>
        </div>

        {discount > 0 && (
          <div className="flex justify-between gap-4 text-emerald-600">
            <span>
              Discount{" "}
              {couponCode && (
                <span className="text-xs font-bold">
                  ({normalizedCoupon})
                </span>
              )}
            </span>

            <strong>
              -₹{discount.toLocaleString()}
            </strong>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <span className="text-slate-600">
            GST (18%)
          </span>

          <strong className="text-slate-900">
            ₹{gst.toLocaleString()}
          </strong>
        </div>

        <hr className="border-slate-200" />

        <div className="flex justify-between gap-4 text-xl font-bold">
          <span className="text-slate-900">
            Total Payable
          </span>

          <span className="text-[#0B2D5C]">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {isHoly100Eligible ? (
        <Button
          className="mt-8 w-full"
          onClick={() => {
            void activateWaivedPlan();
          }}
          disabled={loading || success}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Activating...
            </span>
          ) : success ? (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={18} />
              Activated
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={18} />
              Activate Membership
            </span>
          )}
        </Button>
      ) : (
        <Button
          className="mt-8 w-full"
          onClick={handleUnavailablePayment}
          disabled={loading}
        >
          Payment Required
        </Button>
      )}

      {billingCycle === "monthly" ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <Tag
              size={19}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <p className="text-sm leading-6 text-amber-800">
              Use coupon <strong>HOLY100</strong> for
              a 100% waiver on Silver, Gold, or Platinum
              monthly plans.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-center text-sm leading-6 text-slate-500">
          HOLY100 is not valid for quarterly or yearly
          memberships. Online payment will be enabled
          in the next update.
        </p>
      )}
    </div>
  );
}