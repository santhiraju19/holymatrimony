"use client";

import Button from "@/components/ui/Button";

import { CheckoutData } from "./types";

interface OrderSummaryProps {
  data: CheckoutData;
}

const prices = {
  silver: {
    monthly: 499,
    quarterly: 1299,
    yearly: 4499,
  },
  gold: {
    monthly: 799,
    quarterly: 2199,
    yearly: 7499,
  },
  platinum: {
    monthly: 1199,
    quarterly: 3299,
    yearly: 10999,
  },
};

export default function OrderSummary({
  data,
}: OrderSummaryProps) {
  const amount =
    prices[data.plan][data.billing];

  return (
    <div className="sticky top-24 rounded-3xl border bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        Order Summary
      </h2>

      <div className="mt-8 space-y-5">
        <div className="flex justify-between">
          <span>Plan</span>
          <strong className="capitalize">
            {data.plan}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>Billing</span>
          <strong className="capitalize">
            {data.billing}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>Membership Fee</span>
          <strong>
            ₹{amount.toLocaleString()}
          </strong>
        </div>

        <div className="flex justify-between">
          <span>GST</span>
          <strong>Included</strong>
        </div>

        <hr />

        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>
            ₹{amount.toLocaleString()}
          </span>
        </div>
      </div>

      <Button className="mt-8 w-full">
        Pay Securely
      </Button>

      <p className="mt-5 text-center text-sm text-gray-500">
        🔒 Secure payment powered by Razorpay
      </p>
    </div>
  );
}