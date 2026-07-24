"use client";

import { useState } from "react";

import BillingDetails from "../BillingDetails";
import OrderSummary from "./OrderSummary";
import { CheckoutData } from "./types";

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    plan: "silver",
    billing: "yearly",
    fullName: "",
    email: "",
    phone: "",
    coupon: "",
    gstNumber: "",
  });

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold">
          Membership Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BillingDetails
              checkoutData={checkoutData}
              setCheckoutData={setCheckoutData}
            />
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              data={checkoutData}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
