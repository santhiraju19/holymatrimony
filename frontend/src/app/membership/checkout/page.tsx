"use client";

import { useState } from "react";

import BillingDetails from "@/features/membership/checkout/BillingDetails";
import OrderSummary from "@/features/membership/checkout/OrderSummary";
import { CheckoutData } from "@/features/membership/checkout/types";

export default function CheckoutPage() {
  const [checkout, setCheckout] = useState<CheckoutData>({
    plan: "gold",
    billing: "yearly",

    fullName: "",
    email: "",
    phone: "",
    coupon: "",
    gstNumber: "",
  });

  return (
    <main className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">

        <div className="mb-12 text-center">

          <h1 className="text-4xl font-bold">
            Secure Checkout
          </h1>

          <p className="mt-4 text-gray-600">
            Complete your membership purchase securely.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <BillingDetails
              data={checkout}
              setData={setCheckout}
            />

          </div>

          <OrderSummary
            data={checkout}
          />

        </div>

      </div>
    </main>
  );
}