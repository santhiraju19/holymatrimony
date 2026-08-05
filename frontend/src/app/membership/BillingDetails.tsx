"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Tag,
  XCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  useMembership,
} from "@/features/membership/hooks/useMembership";

const HOLY100 = "HOLY100";

export default function BillingDetails() {
  const {
    checkoutData,
    billingCycle,
    subtotal,
    couponCode,
    applyCoupon,
    updateCheckout,
  } = useMembership();

  const [
    couponMessage,
    setCouponMessage,
  ] = useState("");

  const [
    couponError,
    setCouponError,
  ] = useState("");

  const normalizedCoupon =
    (checkoutData.coupon ?? "")
      .trim()
      .toUpperCase();

  const isEligiblePlan =
    checkoutData.plan === "silver" ||
    checkoutData.plan === "gold" ||
    checkoutData.plan === "platinum";

  const isMonthly =
    billingCycle === "monthly";

  const isCouponApplied =
    couponCode === HOLY100 &&
    isEligiblePlan &&
    isMonthly;

  /*
   * Automatically remove HOLY100 when the user
   * changes from monthly to quarterly/yearly,
   * or changes to an ineligible plan.
   */
  useEffect(() => {
    if (
      couponCode === HOLY100 &&
      (!isEligiblePlan || !isMonthly)
    ) {
      applyCoupon("", 0);

      setCouponMessage("");

      setCouponError(
        "HOLY100 was removed because it is valid only for Silver, Gold, and Platinum monthly plans."
      );
    }
  }, [
    couponCode,
    isEligiblePlan,
    isMonthly,
    applyCoupon,
  ]);

  function clearCouponFeedback(): void {
    setCouponMessage("");
    setCouponError("");
  }

  function handleCouponChange(
    value: string
  ): void {
    updateCheckout({
      coupon: value.toUpperCase(),
    });

    /*
     * Remove an already applied discount when the
     * customer edits the coupon code.
     */
    if (
      couponCode &&
      value.trim().toUpperCase() !==
        couponCode
    ) {
      applyCoupon("", 0);
    }

    clearCouponFeedback();
  }

  function handleApplyCoupon(): void {
    clearCouponFeedback();

    if (!normalizedCoupon) {
      applyCoupon("", 0);

      setCouponError(
        "Please enter a coupon code."
      );

      return;
    }

    if (normalizedCoupon !== HOLY100) {
      applyCoupon("", 0);

      setCouponError(
        "The coupon code you entered is invalid."
      );

      return;
    }

    if (!isEligiblePlan) {
      applyCoupon("", 0);

      setCouponError(
        "HOLY100 is valid only for Silver, Gold, and Platinum plans."
      );

      return;
    }

    if (!isMonthly) {
      applyCoupon("", 0);

      setCouponError(
        "HOLY100 is valid only for monthly memberships. Quarterly and yearly plans require payment."
      );

      return;
    }

    if (subtotal <= 0) {
      applyCoupon("", 0);

      setCouponError(
        "Unable to calculate the membership discount."
      );

      return;
    }

    /*
     * Discount the complete membership subtotal.
     * MembershipContext will calculate:
     *
     * GST = (subtotal - discount) × 18%
     * Total = subtotal - discount + GST
     *
     * Therefore:
     * discount = subtotal
     * GST = ₹0
     * Total = ₹0
     */
    applyCoupon(
      HOLY100,
      subtotal
    );

    updateCheckout({
      coupon: HOLY100,
    });

    setCouponMessage(
      "HOLY100 applied successfully. Your monthly membership fee is fully waived."
    );
  }

  function handleRemoveCoupon(): void {
    applyCoupon("", 0);

    updateCheckout({
      coupon: "",
    });

    setCouponMessage("");
    setCouponError("");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">
        Billing Details
      </h2>

      <p className="mt-2 text-slate-500">
        Enter your contact information and apply
        an eligible membership coupon.
      </p>

      <div className="mt-8 space-y-6">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={checkoutData.fullName}
          onChange={(event) =>
            updateCheckout({
              fullName:
                event.target.value,
            })
          }
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={checkoutData.email}
          onChange={(event) =>
            updateCheckout({
              email:
                event.target.value,
            })
          }
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 9876543210"
          value={checkoutData.phone}
          onChange={(event) =>
            updateCheckout({
              phone:
                event.target.value,
            })
          }
        />

        <Input
          label="GST Number (Optional)"
          placeholder="29ABCDE1234F1Z5"
          value={
            checkoutData.gstNumber ?? ""
          }
          onChange={(event) =>
            updateCheckout({
              gstNumber:
                event.target.value
                  .toUpperCase(),
            })
          }
        />

        <div>
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <Input
                label="Coupon Code (Optional)"
                placeholder="HOLY100"
                value={
                  checkoutData.coupon ?? ""
                }
                disabled={isCouponApplied}
                onChange={(event) =>
                  handleCouponChange(
                    event.target.value
                  )
                }
              />
            </div>

            {isCouponApplied ? (
              <Button
                type="button"
                variant="outline"
                onClick={
                  handleRemoveCoupon
                }
                className="mb-0 min-h-12 shrink-0"
              >
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                onClick={
                  handleApplyCoupon
                }
                className="mb-0 min-h-12 shrink-0"
              >
                Apply
              </Button>
            )}
          </div>

          {couponMessage && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {couponMessage}
              </span>
            </div>
          )}

          {couponError && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <XCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {couponError}
              </span>
            </div>
          )}

          {!couponMessage &&
            !couponError && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                <Tag
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  Use{" "}
                  <strong>
                    HOLY100
                  </strong>{" "}
                  for a 100% waiver on
                  Silver, Gold, or Platinum
                  monthly plans.
                </span>
              </div>
            )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-600">
            {isCouponApplied
              ? "Your membership fee is fully waived. Review the order summary and activate your membership."
              : isMonthly
                ? "Apply HOLY100 to an eligible monthly plan, then continue from the order summary."
                : "Quarterly and yearly plans are not eligible for HOLY100 and require payment."}
          </p>
        </div>
      </div>
    </div>
  );
}