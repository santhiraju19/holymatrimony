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
  type CreateOrderResponse,
} from "@/features/membership/services/payment.service";


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

function getRazorpayConstructor():
  RazorpayConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window as unknown as {
      Razorpay?: RazorpayConstructor;
    }
  ).Razorpay;
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
        getRazorpayConstructor()
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
    gst,
    total,
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

  /*
   * Server-authoritative checkout pricing.
   *
   * This remains null until createOrder() validates the
   * coupon and calculates the final payable amount.
   */
  const [
    checkoutResult,
    setCheckoutResult,
  ] =
    useState<CreateOrderResponse | null>(null);

  if (!plan) {
    return null;
  }

  const selectedPlanName =
    plan.name;

  const isEligiblePlan =
    checkoutData.plan === "silver" ||
    checkoutData.plan === "gold" ||
    checkoutData.plan === "platinum";


  /*
   * ============================================================
   * Billing Validation
   * ============================================================
   */
  function validateBillingDetails(): boolean {
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
   * Razorpay Paid Checkout
   * ============================================================
   */

  async function handlePayment():
    Promise<void> {
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    setCheckoutResult(null);

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

    try {
      setLoading(
        true
      );

      /*
       * Backend determines:
       *
       * - whether the coupon is valid
       * - the authoritative discount
       * - the final payable amount
       * - whether Razorpay is required
       *
       * We intentionally create the backend checkout BEFORE
       * loading Razorpay because HM100 completes entirely on
       * the backend and must never open Razorpay.
       */
      const order =
        await paymentService
          .createOrder(
            checkoutData.plan,
            billingCycle,
            checkoutData.fullName,
            checkoutData.email,
            checkoutData.phone,
            checkoutData.coupon
          );

      /*
       * From this point onward the backend response is the
       * authoritative price snapshot for this checkout.
       */
      setCheckoutResult(order);

      /*
       * Fully discounted coupon checkout.
       *
       * HM100 is finalized by the backend:
       *
       * - payment amount = 0
       * - payment source = COUPON
       * - membership activated
       * - coupon redemption recorded
       *
       * Razorpay must NOT be loaded or opened.
       */
      if (
        order.checkoutType === "COUPON" &&
        order.completed
      ) {
        if (
          order.amount !== 0 ||
          !order.paymentId
        ) {
          throw new Error(
            "The coupon checkout returned an invalid completion response."
          );
        }

        setSuccessMessage(
          order.couponCode
            ? `${order.couponCode} was applied successfully. Your membership has been activated.`
            : "Your membership has been activated successfully."
        );

        setSuccess(true);
        setError("");
        setLoading(false);

        window.setTimeout(
          () => {
            resetCheckout();

            router.push(
              "/dashboard/membership?payment=success"
            );
          },
          2500
        );

        return;
      }

      /*
       * Anything that is not a completed coupon checkout must
       * be a normal Razorpay checkout.
       */
      if (
        order.checkoutType !== "RAZORPAY"
      ) {
        throw new Error(
          "The checkout type returned by the server is not supported."
        );
      }

      /*
       * A paid Razorpay checkout requires all Razorpay fields.
       *
       * amount <= 0 is invalid here because zero-value
       * checkouts must use the COUPON path above.
       */
      if (
        !order.orderId ||
        !order.key ||
        order.amount <= 0 ||
        !order.currency
      ) {
        throw new Error(
          "The payment order could not be created."
        );
      }

      /*
       * Only now load Razorpay.
       *
       * HM100 has already returned above, so a 100% coupon
       * never downloads or opens Razorpay Checkout.
       */
      const scriptLoaded =
        await loadRazorpayScript();

      const Razorpay =
        getRazorpayConstructor();

      if (
        !scriptLoaded ||
        !Razorpay
      ) {
        throw new Error(
          "Unable to load the secure payment window. Please check your internet connection and try again."
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
        new Razorpay(
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

  const verifiedCoupon =
    checkoutResult?.couponCode ?? null;

  const verifiedDiscountPercent =
    checkoutResult?.discountPercent ?? null;

  const verifiedOriginalAmount =
    checkoutResult?.originalAmount ?? null;

  const verifiedDiscountAmount =
    checkoutResult?.discountAmount ?? null;

  /*
   * Backend amounts are paise.
   * Local MembershipContext values are rupees.
   */
  const verifiedFinalAmount =
    checkoutResult
      ? checkoutResult.amount / 100
      : null;

  const verifiedOriginalAmountRupees =
    verifiedOriginalAmount !== null
      ? verifiedOriginalAmount / 100
      : null;

  const verifiedDiscountAmountRupees =
    verifiedDiscountAmount !== null
      ? verifiedDiscountAmount / 100
      : null;

  const displayTotal =
    verifiedFinalAmount ?? total;

  const hasVerifiedCoupon =
    Boolean(
      verifiedCoupon &&
      verifiedDiscountPercent !== null &&
      verifiedOriginalAmountRupees !== null &&
      verifiedDiscountAmountRupees !== null
    );

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


          <SummaryRow
            label="GST (18%)"
            value={`₹${gst.toLocaleString(
              "en-IN"
            )}`}
          />

          {hasVerifiedCoupon && (
            <>
              <SummaryRow
                label={`Coupon (${verifiedCoupon})`}
                value={`${verifiedDiscountPercent}% OFF`}
                tone="green"
              />

              <SummaryRow
                label="Original Total"
                value={`₹${verifiedOriginalAmountRupees!.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }
                )}`}
              />

              <SummaryRow
                label="Coupon Discount"
                value={`-₹${verifiedDiscountAmountRupees!.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }
                )}`}
                tone="green"
              />
            </>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-gradient-to-r from-blue-50/70 to-amber-50/50 px-3.5 py-3">
            <span className="text-xs font-black text-[#0B2D5C]">
              Total Payable
            </span>

            <span className="text-lg font-black text-[#0B2D5C]">
              ₹
              {displayTotal.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
          </div>
        </div>

        {/* =====================================================
            Main Action
            ===================================================== */}
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
                {displayTotal.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            )}
          </Button>


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
