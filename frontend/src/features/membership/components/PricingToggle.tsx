"use client";

import {
  CalendarDays,
  CalendarRange,
  Sparkles,
} from "lucide-react";

import type {
  BillingCycle,
} from "@/features/membership/types/membership";

interface PricingToggleProps {
  value: BillingCycle;
  onChange: (
    value: BillingCycle
  ) => void;
}

const options: {
  label: string;
  value: BillingCycle;
  helper: string;
  icon: typeof CalendarDays;
}[] = [
  {
    label: "Monthly",
    value: "monthly",
    helper: "Flexible",
    icon: CalendarDays,
  },
  {
    label: "Quarterly",
    value: "quarterly",
    helper: "3 months",
    icon: CalendarRange,
  },
  {
    label: "Yearly",
    value: "yearly",
    helper: "Best savings",
    icon: Sparkles,
  },
];

export default function PricingToggle({
  value,
  onChange,
}: PricingToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-grid w-full max-w-xl grid-cols-3 gap-1 rounded-[16px] border border-slate-200 bg-white p-1.5 shadow-sm">
        {options.map(
          ({
            label,
            value: optionValue,
            helper,
            icon: Icon,
          }) => {
            const active =
              value ===
              optionValue;

            return (
              <button
                key={
                  optionValue
                }
                type="button"
                aria-pressed={
                  active
                }
                onClick={() =>
                  onChange(
                    optionValue
                  )
                }
                className={[
                  "relative flex min-h-[54px] flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition duration-200",

                  active
                    ? "bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#0B2D5C]",
                ].join(" ")}
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    size={13}
                  />

                  <span className="text-[11px] font-black sm:text-xs">
                    {label}
                  </span>
                </div>

                <span
                  className={[
                    "mt-0.5 text-[8px] font-bold sm:text-[9px]",

                    active
                      ? "text-blue-100"
                      : "text-slate-400",
                  ].join(" ")}
                >
                  {helper}
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
