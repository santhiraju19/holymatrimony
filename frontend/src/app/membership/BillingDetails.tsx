"use client";

import { Dispatch, SetStateAction } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { CheckoutData } from "./checkout/types";

interface BillingDetailsProps {
  checkoutData: CheckoutData;
  setCheckoutData: Dispatch<SetStateAction<CheckoutData>>;
}

export default function BillingDetails({
  checkoutData,
  setCheckoutData,
}: BillingDetailsProps) {
  const updateField = (
    field: keyof CheckoutData,
    value: string
  ) => {
    setCheckoutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        Billing Details
      </h2>

      <p className="mt-2 text-slate-500">
        Please enter your billing information.
      </p>

      <div className="mt-8 space-y-6">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={checkoutData.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={checkoutData.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <Input
          label="Phone Number"
          placeholder="+91 9876543210"
          value={checkoutData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <Input
          label="GST Number (Optional)"
          placeholder="29ABCDE1234F1Z5"
          value={checkoutData.gstNumber ?? ""}
          onChange={(e) =>
            updateField("gstNumber", e.target.value)
          }
        />

        <Input
          label="Coupon Code (Optional)"
          placeholder="HOLY10"
          value={checkoutData.coupon ?? ""}
          onChange={(e) =>
            updateField("coupon", e.target.value)
          }
        />

        <Button type="button" fullWidth>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
