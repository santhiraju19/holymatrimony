"use client";

import {
  useState,
} from "react";

import {
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import Button from "@/components/ui/button";

import {
  useMembership,
} from "@/features/membership/context/MembershipContext";

import {
  paymentService,
} from "@/features/membership/services/payment.service";

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
    const axiosError =
      error as {
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

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "The request could not be completed.";
}

/*
 * ============================================================
 * Razorpay Checkout Script
 * ============================================================
 */

function loadRazorpayScript():
  Promise<boolean> {
  return new Promise(
    (resolve) => {
      if (
        typeof window ===
        "undefined"
      ) {
        resolve(false);
        return;
      }

      if (
        window.Razorpay
      ) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        ) as
          | HTMLScriptElement
          | null;

      if (
        existingScript
      ) {
        existingScript.addEventListener(
          "load",
          () =>
            resolve(
              true
            ),
          {
            once: true,
          }
        );

        existingScript.addEventListener(
          "error",
          () =>
            resolve(
              false
            ),
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

      script.async =
        true;

      script.onload =
        () => {
          resolve(
            true
          );
        };

      script.onerror =
        () => {
          resolve(
            false
          );
        };

      document.body.appendChild(
        script
      );
    }
  );
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
  ] =
    useState(false);

  const [
    success,
    setSuccess,
  ] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

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
    checkoutData.plan ===
      "silver" ||
    checkoutData.plan ===
      "gold" ||
    checkoutData.plan ===
      "platinum";

  const isHoly100Eligible =
    normalizedCoupon ===
      "HOLY100" &&
    billingCycle ===
      "monthly" &&
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
      normalizedCoupon !==
      "HOLY100"
    ) {
      setError(
        "Enter coupon code HOLY100 to activate this monthly plan free."
      );

      return;
    }

    if (
      billingCycle !==
      "monthly"
    ) {
      setError(
        "HOLY100 is valid only for monthly memberships."
      );

      return;
    }

    if (
      !isEligiblePlan
    ) {
      setError(
        "HOLY100 is valid only for Silver, Gold, and Platinum plans."
      );

      return;
    }

    if (
      total !== 0
    ) {
      setError(
        "The coupon must reduce the total payable amount to ₹0."
      );

      return;
    }

    try {
      setLoading(
        true
      );

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

      setSuccess(
        true
      );

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
      setLoading(
        false
      );
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

    if (
      !isEligiblePlan
    ) {
      setError(
        "Please select a valid paid membership plan."
      );

      return;
    }

    /*
     * HOLY100 is a free monthly waiver.
     */
    if (
      isHoly100Eligible
    ) {
      await activateWaivedPlan();
      return;
    }

    /*
     * Prevent invalid HOLY100
     * attempts from silently
     * becoming paid transactions.
     */
    if (
      normalizedCoupon ===
      "HOLY100"
    ) {
      if (
        billingCycle !==
        "monthly"
      ) {
        setError(
          "HOLY100 is valid only for monthly memberships. Remove the coupon to continue with online payment."
        );

        return;
      }

      if (
        total !== 0
      ) {
        setError(
          "HOLY100 must reduce the monthly membership total to ₹0. Please review the coupon before continuing."
        );

        return;
      }
    }

    try {
      setLoading(
        true
      );

      /*
       * Load Razorpay Checkout.
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
       * Backend determines
       * authoritative order amount.
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

            ondismiss:
              () => {
                setLoading(
                  false
                );

                setError(
                  "Payment was cancelled. No membership changes were made."
                );
              },
          },

          handler:
            async (
              response:
                RazorpaySuccessResponse
            ) => {
              try {
                /*
                 * Verify Razorpay
                 * signature on backend.
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

                setSuccessMessage(
                  "Payment completed successfully. Your membership is being activated."
                );

                setSuccess(
                  true
                );

                setError(
                  ""
                );

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
                setLoading(
                  false
                );
              }
            },
        };

      const razorpay =
        new window.Razorpay(
          options
        );

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

          setLoading(
            false
          );
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

      setLoading(
        false
      );
    }
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50/70 via-white to-blue-50/50 px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-[#071B36] shadow-sm">
            <ReceiptText
              size={17}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Sparkles
                size={9}
                className="text-[#B38B19]"
              />

              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
                Review Membership
              </p>
            </div>

            <h2 className="mt-0.5 text-base font-black text-[#0B2D5C]">
              Order Summary
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Confirm your plan before activation or payment.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">

        {/* =====================================================
            Plan Highlight
            ===================================================== */}

        <div className="rounded-[15px] bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] p-3.5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#F2D675]">
                <Crown
                  size={15}
                />
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-200">
                  Selected plan
                </p>

                <p className="mt-0.5 text-sm font-black">
                  {
                    plan.name
                  }
                </p>
              </div>
            </div>

            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[8px] font-black capitalize text-blue-100">
              {
                billingCycle
              }
            </span>
          </div>
        </div>

        {/* =====================================================
            Success / Error
            ===================================================== */}

        {success && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="text-[10px] font-black text-emerald-800">
                Membership Successful
              </p>

              <p className="mt-0.5 text-[10px] leading-5 text-emerald-700">
                {
                  successMessage
                }{" "}
                Redirecting to your membership centre...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-semibold leading-5 text-red-700"
          >
            {error}
          </div>
        )}

        {/* =====================================================
            Pricing Breakdown
            ===================================================== */}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <SummaryRow
            label="Plan"
            value={
              plan.name
            }
          />

          <SummaryRow
            label="Billing Cycle"
            value={
              billingCycle
            }
            capitalize
          />

          <SummaryRow
            label="Membership Fee"
            value={`₹${subtotal.toLocaleString(
              "en-IN"
            )}`}
          />

          {discount > 0 && (
            <SummaryRow
              label={
                couponCode
                  ? `Discount (${normalizedCoupon})`
                  : "Discount"
              }
              value={`-₹${discount.toLocaleString(
                "en-IN"
              )}`}
              tone="green"
            />
          )}

          <SummaryRow
            label="GST (18%)"
            value={`₹${gst.toLocaleString(
              "en-IN"
            )}`}
          />

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-gradient-to-r from-blue-50/70 to-amber-50/50 px-3.5 py-3">
            <span className="text-xs font-black text-[#0B2D5C]">
              Total Payable
            </span>

            <span className="text-lg font-black text-[#0B2D5C]">
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>
        </div>

        {/* =====================================================
            Main Action
            ===================================================== */}

        {isHoly100Eligible ? (
          <Button
            type="button"
            fullWidth
            className="mt-4 h-10"
            disabled={
              loading ||
              success
            }
            onClick={() => {
              void activateWaivedPlan();
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2
                  size={14}
                  className="animate-spin"
                />

                Activating...
              </span>
            ) : success ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                />

                Activated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck
                  size={14}
                />

                Activate Membership
              </span>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            fullWidth
            className="mt-4 h-10"
            disabled={
              loading ||
              success
            }
            onClick={() => {
              void handlePayment();
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2
                  size={14}
                  className="animate-spin"
                />

                Preparing Payment...
              </span>
            ) : success ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                />

                Payment Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <CreditCard
                  size={14}
                />

                Pay ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </span>
            )}
          </Button>
        )}

        {/* =====================================================
            Coupon / Payment Guidance
            ===================================================== */}

        {billingCycle ===
        "monthly" ? (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
            <Tag
              size={13}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <p className="text-[10px] leading-5 text-amber-800">
              Use coupon{" "}
              <strong>
                HOLY100
              </strong>{" "}
              for a 100% waiver on Silver, Gold or Platinum monthly plans.
            </p>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5">
            <ShieldCheck
              size={13}
              className="mt-0.5 shrink-0 text-[#0B2D5C]"
            />

            <p className="text-[10px] leading-5 text-slate-600">
              Secure online payment is available for{" "}
              <strong className="capitalize">
                {
                  billingCycle
                }
              </strong>{" "}
              memberships. HOLY100 applies only to monthly memberships.
            </p>
          </div>
        )}

        {/* =====================================================
            Security
            ===================================================== */}

        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2">
          <LockKeyhole
            size={11}
            className="text-emerald-600"
          />

          <p className="text-center text-[9px] font-semibold leading-4 text-slate-400">
            Payments are processed securely through Razorpay. Membership activation follows successful payment confirmation.
          </p>
        </div>
      </div>
    </section>
  );
}

type SummaryTone =
  | "default"
  | "green";

function SummaryRow({
  label,
  value,
  capitalize = false,
  tone = "default",
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  tone?: SummaryTone;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-3.5 py-2.5 last:border-b-0">
      <span
        className={[
          "text-[10px] font-semibold",

          tone ===
          "green"
            ? "text-emerald-600"
            : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </span>

      <strong
        className={[
          "text-right text-[11px]",

          capitalize
            ? "capitalize"
            : "",

          tone ===
          "green"
            ? "text-emerald-600"
            : "text-slate-800",
        ].join(" ")}
      >
        {value}
      </strong>
    </div>
  );
}
