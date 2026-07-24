"use client";

import { BillingCycle } from "@/features/membership/types/membership";
import { cn } from "@/utils/cn";

interface PricingToggleProps {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
}

const options: {
  label: string;
  value: BillingCycle;
}[] = [
  {
    label: "Monthly",
    value: "monthly",
  },
  {
    label: "Quarterly",
    value: "quarterly",
  },
  {
    label: "Yearly",
    value: "yearly",
  },
];

export default function PricingToggle({
  value,
  onChange,
}: PricingToggleProps) {
  return (
    <div className="flex justify-center mb-12">
      <div className="inline-flex rounded-full bg-gray-100 p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200",
              value === option.value
                ? "bg-primary text-white shadow"
                : "text-gray-600 hover:text-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}