"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { useMembership } from "@/features/membership/context/MembershipContext";
import { paymentService } from "@/features/membership/services/payment.service";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OrderSummary() {
  const {
    plan,
    billingCycle,
    subtotal,
    discount,
    gst,
    total,
    couponCode,
    checkoutData,
  } = useMembership();

  const [loading, setLoading] = useState(false);

  if (!plan) {
    return null;
  }

  async function handlePayment() {
    try {
      setLoading(true);

      if (
        !checkoutData.fullName ||
        !checkoutData.email ||
        !checkoutData.phone
      ) {
        alert("Please complete your billing details.");
        return;
      }

      const order = await paymentService.createOrder(
        checkoutData.plan.toUpperCase(),
        checkoutData.billingCycle.toUpperCase(),
        checkoutData.fullName,
        checkoutData.email,
        checkoutData.phone
      );

      const razorpay = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,

        name: "Holy Matrimony",
        description: `${checkoutData.plan.toUpperCase()} Membership`,

        prefill: {
          name: checkoutData.fullName,
          email: checkoutData.email,
          contact: checkoutData.phone,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentService.verifyPayment(response);

            alert("Payment Successful!");
          } catch (err) {
            console.error(err);
            alert("Payment verification failed.");
          }
        },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Unable to initiate payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-24 rounded-3xl border bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        Order Summary
      </h2>

      <div className="mt-8 space-y-5">
        <div className="flex justify-between">
          <span>Plan</span>
          <strong>{plan.name}</strong>
        </div>

        <div className="flex justify-between">
          <span>Billing Cycle</span>
          <strong className="capitalize">
            {billingCycle}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>Membership Fee</span>
          <strong>₹{subtotal.toLocaleString()}</strong>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>
              Discount{" "}
              {couponCode && (
                <span className="text-xs">
                  ({couponCode})
                </span>
              )}
            </span>

            <strong>-₹{discount.toLocaleString()}</strong>
          </div>
        )}

        <div className="flex justify-between">
          <span>GST (18%)</span>
          <strong>₹{gst.toLocaleString()}</strong>
        </div>

        <hr />

        <div className="flex justify-between text-xl font-bold">
          <span>Total Payable</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>

      <Button
        className="mt-8 w-full"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Securely"}
      </Button>

      <p className="mt-5 text-center text-sm text-gray-500">
        🔒 Secure payment powered by Razorpay
      </p>
    </div>
  );
}