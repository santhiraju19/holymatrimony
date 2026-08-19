"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BadgeCheck,
  CheckCircle2,
  Mail,
  Phone,
  ReceiptText,
  Sparkles,
  Tag,
  UserRound,
  XCircle,
} from "lucide-react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";

import {
  useMembership,
} from "@/features/membership/hooks/useMembership";

const HOLY100 =
  "HOLY100";

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
    (
      checkoutData.coupon ??
      ""
    )
      .trim()
      .toUpperCase();

  const isEligiblePlan =
    checkoutData.plan ===
      "silver" ||
    checkoutData.plan ===
      "gold" ||
    checkoutData.plan ===
      "platinum";

  const isMonthly =
    billingCycle ===
    "monthly";

  const isCouponApplied =
    couponCode ===
      HOLY100 &&
    isEligiblePlan &&
    isMonthly;

  /*
   * Automatically remove HOLY100
   * when the user changes to an
   * ineligible cycle or plan.
   */
  useEffect(() => {
    if (
      couponCode ===
        HOLY100 &&
      (
        !isEligiblePlan ||
        !isMonthly
      )
    ) {
      applyCoupon(
        "",
        0
      );

      setCouponMessage(
        ""
      );

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
    setCouponMessage(
      ""
    );

    setCouponError(
      ""
    );
  }

  function handleCouponChange(
    value: string
  ): void {
    updateCheckout({
      coupon:
        value.toUpperCase(),
    });

    if (
      couponCode &&
      value
        .trim()
        .toUpperCase() !==
        couponCode
    ) {
      applyCoupon(
        "",
        0
      );
    }

    clearCouponFeedback();
  }

  function handleApplyCoupon(): void {
    clearCouponFeedback();

    if (
      !normalizedCoupon
    ) {
      applyCoupon(
        "",
        0
      );

      setCouponError(
        "Please enter a coupon code."
      );

      return;
    }

    if (
      normalizedCoupon !==
      HOLY100
    ) {
      applyCoupon(
        "",
        0
      );

      setCouponError(
        "The coupon code you entered is invalid."
      );

      return;
    }

    if (
      !isEligiblePlan
    ) {
      applyCoupon(
        "",
        0
      );

      setCouponError(
        "HOLY100 is valid only for Silver, Gold, and Platinum plans."
      );

      return;
    }

    if (!isMonthly) {
      applyCoupon(
        "",
        0
      );

      setCouponError(
        "HOLY100 is valid only for monthly memberships. Quarterly and yearly plans require payment."
      );

      return;
    }

    if (
      subtotal <= 0
    ) {
      applyCoupon(
        "",
        0
      );

      setCouponError(
        "Unable to calculate the membership discount."
      );

      return;
    }

    /*
     * Discount complete subtotal.
     *
     * GST becomes ₹0 and
     * total becomes ₹0.
     */
    applyCoupon(
      HOLY100,
      subtotal
    );

    updateCheckout({
      coupon:
        HOLY100,
    });

    setCouponMessage(
      "HOLY100 applied successfully. Your monthly membership fee is fully waived."
    );
  }

  function handleRemoveCoupon(): void {
    applyCoupon(
      "",
      0
    );

    updateCheckout({
      coupon: "",
    });

    setCouponMessage(
      ""
    );

    setCouponError(
      ""
    );
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/65 via-white to-amber-50/45 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-sm">
            <ReceiptText
              size={17}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={9}
                className="text-[#B38B19]"
              />

              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
                Billing Information
              </p>
            </div>

            <h2 className="mt-0.5 text-base font-black text-[#0B2D5C] sm:text-lg">
              Billing Details
            </h2>

            <p className="mt-0.5 text-[10px] leading-5 text-slate-500 sm:text-[11px]">
              Enter your contact information and apply an eligible membership coupon.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">

        {/* =====================================================
            Contact Details
            ===================================================== */}

        <SectionHeading
          icon={
            <UserRound
              size={14}
            />
          }
          title="Contact Information"
          description="Used for your membership order and payment confirmation."
        />

        <div className="mt-3 grid gap-3.5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={
                checkoutData.fullName
              }
              onChange={(
                event
              ) =>
                updateCheckout({
                  fullName:
                    event.target.value,
                })
              }
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={
              checkoutData.email
            }
            onChange={(
              event
            ) =>
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
            value={
              checkoutData.phone
            }
            onChange={(
              event
            ) =>
              updateCheckout({
                phone:
                  event.target.value,
              })
            }
          />

          <div className="md:col-span-2">
            <Input
              label="GST Number (Optional)"
              placeholder="29ABCDE1234F1Z5"
              value={
                checkoutData.gstNumber ??
                ""
              }
              onChange={(
                event
              ) =>
                updateCheckout({
                  gstNumber:
                    event.target.value
                      .toUpperCase(),
                })
              }
            />
          </div>
        </div>

        {/* =====================================================
            Coupon
            ===================================================== */}

        <div className="my-5 border-t border-slate-100" />

        <SectionHeading
          icon={
            <Tag
              size={14}
            />
          }
          title="Membership Coupon"
          description="Apply an eligible promotional code before continuing."
          variant="gold"
        />

        <div className="mt-3 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/70 via-white to-blue-50/40 p-3.5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="Coupon Code (Optional)"
                placeholder="HOLY100"
                value={
                  checkoutData.coupon ??
                  ""
                }
                disabled={
                  isCouponApplied
                }
                onChange={(
                  event
                ) =>
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
                size="sm"
                onClick={
                  handleRemoveCoupon
                }
                className="h-10 shrink-0 sm:min-w-[95px]"
              >
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={
                  handleApplyCoupon
                }
                className="h-10 shrink-0 sm:min-w-[95px]"
              >
                Apply
              </Button>
            )}
          </div>

          {couponMessage && (
            <StatusMessage
              tone="green"
              icon={
                <CheckCircle2
                  size={14}
                />
              }
            >
              {
                couponMessage
              }
            </StatusMessage>
          )}

          {couponError && (
            <StatusMessage
              tone="red"
              icon={
                <XCircle
                  size={14}
                />
              }
            >
              {
                couponError
              }
            </StatusMessage>
          )}

          {!couponMessage &&
            !couponError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
                <Tag
                  size={13}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <p className="text-[10px] leading-5 text-amber-800">
                  Use{" "}
                  <strong>
                    HOLY100
                  </strong>{" "}
                  for a 100% waiver on Silver, Gold or Platinum monthly plans.
                </p>
              </div>
            )}
        </div>

        {/* =====================================================
            Checkout State
            ===================================================== */}

        <div
          className={[
            "mt-4 flex items-start gap-2.5 rounded-xl border px-3 py-2.5",

            isCouponApplied
              ? "border-emerald-200 bg-emerald-50/70"
              : isMonthly
                ? "border-blue-100 bg-blue-50/60"
                : "border-slate-200 bg-slate-50/80",
          ].join(" ")}
        >
          {isCouponApplied ? (
            <BadgeCheck
              size={15}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
          ) : isMonthly ? (
            <Mail
              size={15}
              className="mt-0.5 shrink-0 text-blue-600"
            />
          ) : (
            <Phone
              size={15}
              className="mt-0.5 shrink-0 text-slate-400"
            />
          )}

          <p
            className={[
              "text-[10px] leading-5",

              isCouponApplied
                ? "text-emerald-700"
                : "text-slate-600",
            ].join(" ")}
          >
            {isCouponApplied
              ? "Your membership fee is fully waived. Review the order summary and activate your membership."
              : isMonthly
                ? "Apply HOLY100 to an eligible monthly plan, then continue from the order summary."
                : "Quarterly and yearly plans are not eligible for HOLY100 and require payment."}
          </p>
        </div>
      </div>
    </section>
  );
}

type SectionVariant =
  | "blue"
  | "gold";

function SectionHeading({
  icon,
  title,
  description,
  variant = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: SectionVariant;
}) {
  const styles: Record<
    SectionVariant,
    string
  > = {
    blue:
      "bg-blue-50 text-[#0B2D5C]",

    gold:
      "bg-amber-50 text-[#B38B19]",
  };

  return (
    <div className="flex items-start gap-2.5">
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          styles[variant],
        ].join(" ")}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#0B2D5C]">
          {title}
        </h3>

        <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

type StatusTone =
  | "green"
  | "red";

function StatusMessage({
  tone,
  icon,
  children,
}: {
  tone: StatusTone;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const styles: Record<
    StatusTone,
    string
  > = {
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    red:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div
      className={[
        "mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-semibold leading-5",
        styles[tone],
      ].join(" ")}
    >
      <span className="mt-0.5 shrink-0">
        {icon}
      </span>

      {children}
    </div>
  );
}
