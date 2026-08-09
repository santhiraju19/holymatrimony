"use client";

import { useState } from "react";

import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Tag,
} from "lucide-react";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";

import { useMembership } from "@/features/membership/context/MembershipContext";

import { paymentService } from "@/features/membership/services/payment.service";

import {
  membershipActivationService,
  type WaiverPlan,
} from "@/features/membership/services/membershipActivation.service";

/*
 * ============================================================
 * Razorpay Types
 * ============================================================
 */

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  notes?: {
    plan?: string;
    billingCycle?: string;
  };

  theme?: {
    color?: string;
  };

  modal?: {
    confirm_close?: boolean;
    ondismiss?: () => void;
  };

  retry?: {
    enabled?: boolean;
  };
}

interface RazorpayInstance {
  open(): void;

  on(
    event: "payment.failed",
    callback: (
      response: RazorpayFailureResponse
    ) => void
  ): void;
}

interface RazorpayConstructor {
  new (
    options: RazorpayOptions
  ): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

/*
 * ============================================================
 * Error Helper
 * ============================================================
 */

function getErrorMessage(
  error: unknown
): string {

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
      "The request could not be completed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The request could not be completed.";
}

/*
 * ============================================================
 * Razorpay Checkout Script
 * ============================================================
 */

function loadRazorpayScript(): Promise<boolean> {

  return new Promise((resolve) => {

    if (
      typeof window === "undefined"
    ) {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      ) as HTMLScriptElement | null;

    if (existingScript) {

      existingScript.addEventListener(
        "load",
        () => resolve(true),
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        {
          once: true,
        }
      );

      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(
      script
    );
  });
}

/*
 * ============================================================
 * Component
 * ============================================================
 */

export default function OrderSummary() {

  const router =
    useRouter();

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

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  if (!plan) {
    return null;
  }

  const selectedPlanName =
    plan.name;

  /*
   * ============================================================
   * Coupon Eligibility
   * ============================================================
   */

  const normalizedCoupon =
    couponCode
      .trim()
      .toUpperCase();

  const isEligiblePlan =
    checkoutData.plan === "silver" ||
    checkoutData.plan === "gold" ||
    checkoutData.plan === "platinum";

  const isHoly100Eligible =
    normalizedCoupon === "HOLY100" &&
    billingCycle === "monthly" &&
    isEligiblePlan &&
    total === 0;

  /*
   * ============================================================
   * Billing Validation
   * ============================================================
   */

  function validateBillingDetails():
    boolean {

    if (
      !checkoutData.fullName ||
      !checkoutData.email ||
      !checkoutData.phone
    ) {
      setError(
        "Please complete your billing details."
      );

      return false;
    }

    return true;
  }

  /*
   * ============================================================
   * HOLY100 Waiver Activation
   * ============================================================
   */

  async function activateWaivedPlan():
    Promise<void> {

    setError("");

    if (
      !validateBillingDetails()
    ) {
      return;
    }

    if (
      normalizedCoupon !== "HOLY100"
    ) {
      setError(
        "Enter coupon code HOLY100 to activate this monthly plan free."
      );

      return;
    }

    if (
      billingCycle !== "monthly"
    ) {
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

      await membershipActivationService
        .activateHoly100({
          plan:
            checkoutData.plan
              .toUpperCase() as WaiverPlan,

          billingCycle:
            "MONTHLY",

          couponCode:
            "HOLY100",
        });

      setSuccessMessage(
        "Your membership is now active."
      );

      setSuccess(true);

      window.setTimeout(
        () => {

          resetCheckout();

          router.push(
            "/dashboard/membership?activated=true"
          );

        },
        1500
      );

    } catch (
      activationError
    ) {

      console.error(
        "Membership activation failed:",
        activationError
      );

      setError(
        getErrorMessage(
          activationError
        )
      );

    } finally {

      setLoading(false);
    }
  }

  /*
   * ============================================================
   * Razorpay Paid Checkout
   * ============================================================
   */

  async function handlePayment():
    Promise<void> {

    setError("");
    setSuccess(false);
    setSuccessMessage("");

    if (
      !validateBillingDetails()
    ) {
      return;
    }

    if (!isEligiblePlan) {
      setError(
        "Please select a valid paid membership plan."
      );

      return;
    }

    /*
     * HOLY100 is a free monthly waiver.
     *
     * If it has legitimately reduced the
     * payable amount to zero, use the waiver
     * activation flow rather than Razorpay.
     */
    if (isHoly100Eligible) {

      await activateWaivedPlan();

      return;
    }

    /*
     * Prevent an invalid/non-zero HOLY100
     * attempt from being silently converted
     * into a paid transaction.
     */
    if (
      normalizedCoupon === "HOLY100"
    ) {

      if (
        billingCycle !== "monthly"
      ) {
        setError(
          "HOLY100 is valid only for monthly memberships. Remove the coupon to continue with online payment."
        );

        return;
      }

      if (total !== 0) {
        setError(
          "HOLY100 must reduce the monthly membership total to ₹0. Please review the coupon before continuing."
        );

        return;
      }
    }

    try {

      setLoading(true);

      /*
       * --------------------------------------------------------
       * Load Razorpay Checkout
       * --------------------------------------------------------
       */

      const scriptLoaded =
        await loadRazorpayScript();

      if (
        !scriptLoaded ||
        !window.Razorpay
      ) {
        throw new Error(
          "Unable to load the secure payment window. Please check your internet connection and try again."
        );
      }

      /*
       * --------------------------------------------------------
       * Create Razorpay Order on Backend
       * --------------------------------------------------------
       *
       * The backend decides the real amount.
       * We intentionally do NOT send the frontend
       * calculated total to Razorpay.
       */

      const order =
        await paymentService
          .createOrder(
            checkoutData.plan,
            billingCycle,
            checkoutData.fullName,
            checkoutData.email,
            checkoutData.phone
          );

      if (
        !order.orderId ||
        !order.key ||
        !order.amount ||
        !order.currency
      ) {
        throw new Error(
          "The payment order could not be created."
        );
      }

      /*
       * --------------------------------------------------------
       * Razorpay Checkout Options
       * --------------------------------------------------------
       */

      const options:
        RazorpayOptions = {

        key:
          order.key,

        amount:
          order.amount,

        currency:
          order.currency,

        name:
          "Holy Matrimony",

        description:
          `${selectedPlanName} - ${billingCycle} membership`,

        order_id:
          order.orderId,

        prefill: {

          name:
            checkoutData.fullName,

          email:
            checkoutData.email,

          contact:
            checkoutData.phone,
        },

        notes: {

          plan:
            checkoutData.plan,

          billingCycle:
            billingCycle,
        },

        theme: {
          color:
            "#0B2D5C",
        },

        retry: {
          enabled:
            true,
        },

        modal: {

          confirm_close:
            true,

          ondismiss: () => {

            setLoading(false);

            setError(
              "Payment was cancelled. No membership changes were made."
            );
          },
        },

        /*
         * ------------------------------------------------------
         * Successful Checkout
         * ------------------------------------------------------
         */

        handler:
          async (
            response:
              RazorpaySuccessResponse
          ) => {

            try {

              /*
               * Always verify the Razorpay
               * signature on the backend.
               */
              await paymentService
                .verifyPayment({

                  razorpay_order_id:
                    response
                      .razorpay_order_id,

                  razorpay_payment_id:
                    response
                      .razorpay_payment_id,

                  razorpay_signature:
                    response
                      .razorpay_signature,
                });

              /*
               * The webhook performs final
               * captured-payment fulfilment.
               */
              setSuccessMessage(
                "Payment completed successfully. Your membership is being activated."
              );

              setSuccess(true);
              setError("");

              window.setTimeout(
                () => {

                  resetCheckout();

                  router.push(
                    "/dashboard/membership?payment=success"
                  );

                },
                2500
              );

            } catch (
              verificationError
            ) {

              console.error(
                "Payment verification failed:",
                verificationError
              );

              setError(
                getErrorMessage(
                  verificationError
                )
              );

            } finally {

              setLoading(false);
            }
          },
      };

      /*
       * --------------------------------------------------------
       * Open Razorpay Checkout
       * --------------------------------------------------------
       */

      const razorpay =
        new window.Razorpay(
          options
        );

      /*
       * --------------------------------------------------------
       * Razorpay Payment Failure
       * --------------------------------------------------------
       */

      razorpay.on(
        "payment.failed",
        (
          response:
            RazorpayFailureResponse
        ) => {

          console.error(
            "Razorpay payment failed:",
            response
          );

          const description =
            response.error
              ?.description;

          setError(
            description ??
              "Payment failed. Please try again."
          );

          setLoading(false);
        }
      );

      razorpay.open();

    } catch (
      paymentError
    ) {

      console.error(
        "Payment could not be started:",
        paymentError
      );

      setError(
        getErrorMessage(
          paymentError
        )
      );

      setLoading(false);
    }
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      <h2 className="text-xl font-black text-[#0B2D5C]">
        Order Summary
      </h2>

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

          <div className="flex items-start gap-3">

            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-600"
              size={20}
            />

            <div>

              <p className="font-bold text-emerald-800">
                Payment Successful
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                {successMessage}
                {" "}
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
          disabled={
            loading ||
            success
          }
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

              <CheckCircle2
                size={18}
              />

              Activated

            </span>

          ) : (

            <span className="inline-flex items-center gap-2">

              <ShieldCheck
                size={18}
              />

              Activate Membership

            </span>
          )}

        </Button>

      ) : (

        <Button
          className="mt-8 w-full"
          onClick={() => {
            void handlePayment();
          }}
          disabled={
            loading ||
            success
          }
        >

          {loading ? (

            <span className="inline-flex items-center gap-2">

              <Loader2
                size={18}
                className="animate-spin"
              />

              Preparing Secure Payment...

            </span>

          ) : success ? (

            <span className="inline-flex items-center gap-2">

              <CheckCircle2
                size={18}
              />

              Payment Completed

            </span>

          ) : (

            <span className="inline-flex items-center gap-2">

              <CreditCard
                size={18}
              />

              Pay ₹{total.toLocaleString()}

            </span>
          )}

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

              Use coupon{" "}
              <strong>
                HOLY100
              </strong>{" "}
              for a 100% waiver on Silver,
              Gold, or Platinum monthly plans.

            </p>

          </div>
        </div>

      ) : (

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex gap-3">

            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#0B2D5C]"
            />

            <p className="text-sm leading-6 text-slate-700">

              Secure online payment is available
              for{" "}

              <strong className="capitalize">
                {billingCycle}
              </strong>{" "}

              memberships. HOLY100 applies only
              to monthly memberships.

            </p>

          </div>
        </div>
      )}

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">

        Payments are processed securely through
        Razorpay. Your membership is activated
        after successful payment confirmation.

      </p>

    </div>
  );
}