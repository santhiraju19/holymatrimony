"use client";

import BillingDetails from "../BillingDetails";
import OrderSummary from "./OrderSummary";

import { MembershipProvider } from "@/features/membership/context/MembershipContext";

export default function CheckoutPage() {
  return (
    <MembershipProvider>
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-8 text-3xl font-bold">
            Membership Checkout
          </h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BillingDetails />
            </div>

            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        </div>
      </main>
    </MembershipProvider>
  );
}