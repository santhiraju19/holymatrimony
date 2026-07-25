"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { useMembership } from "@/features/membership/hooks/useMembership";

export default function BillingDetails() {
  const {
    checkoutData,
    updateCheckout,
  } = useMembership();

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
          onChange={(e) =>
            updateCheckout({
              fullName: e.target.value,
            })
          }
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={checkoutData.email}
          onChange={(e) =>
            updateCheckout({
              email: e.target.value,
            })
          }
        />

        <Input
          label="Phone Number"
          placeholder="+91 9876543210"
          value={checkoutData.phone}
          onChange={(e) =>
            updateCheckout({
              phone: e.target.value,
            })
          }
        />

        <Input
          label="GST Number (Optional)"
          placeholder="29ABCDE1234F1Z5"
          value={checkoutData.gstNumber ?? ""}
          onChange={(e) =>
            updateCheckout({
              gstNumber: e.target.value,
            })
          }
        />

        <Input
          label="Coupon Code (Optional)"
          placeholder="HOLY10"
          value={checkoutData.coupon ?? ""}
          onChange={(e) =>
            updateCheckout({
              coupon: e.target.value,
            })
          }
        />

        <Button type="button" fullWidth>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}