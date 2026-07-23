"use client";

import { Dispatch, SetStateAction } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { CheckoutData } from "./types";

interface BillingDetailsProps {
  data: CheckoutData;
  setData: Dispatch<SetStateAction<CheckoutData>>;
}

export default function BillingDetails({
  data,
  setData,
}: BillingDetailsProps) {
  const updateField = (
    field: keyof CheckoutData,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">
        Billing Details
      </h2>

      <p className="mt-2 text-gray-500">
        Please enter your billing information.
      </p>

      <div className="mt-8 grid gap-6">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={data.fullName}
          onChange={(e) =>
            updateField("fullName", e.target.value)
          }
        />

        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={data.email}
          onChange={(e) =>
            updateField("email", e.target.value)
          }
        />

        <Input
          type="tel"
          label="Mobile Number"
          placeholder="Enter your mobile number"
          value={data.phone}
          onChange={(e) =>
            updateField("phone", e.target.value)
          }
        />

        <Input
          label="GST Number (Optional)"
          placeholder="Enter GST number"
          value={data.gstNumber}
          onChange={(e) =>
            updateField("gstNumber", e.target.value)
          }
        />

        <Input
          label="Coupon Code (Optional)"
          placeholder="Enter coupon code"
          value={data.coupon}
          onChange={(e) =>
            updateField("coupon", e.target.value)
          }
        />

        <div className="pt-4">
          <Button className="w-full">
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}