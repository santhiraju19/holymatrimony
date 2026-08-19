"use client";

import {
  forwardRef,
  InputHTMLAttributes,
} from "react";

import {
  Check,
} from "lucide-react";

import { cn } from "@/utils/cn";

interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(
  (
    {
      label,
      description,
      className,
      id,
      checked,
      defaultChecked,
      ...props
    },
    ref
  ) => {
    const isChecked =
      checked ??
      defaultChecked ??
      false;

    return (
      <label
        htmlFor={id}
        className={cn(
          "group flex cursor-pointer items-start gap-3 rounded-2xl",
          "border border-transparent p-2",
          "transition-all duration-200",
          "hover:bg-blue-50/50",
          props.disabled &&
            "cursor-not-allowed opacity-60",
          className
        )}
      >
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            className="peer sr-only"
            {...props}
          />

          <span
            className={cn(
              "absolute inset-0 rounded-md border",
              "border-slate-300 bg-white",
              "shadow-sm",
              "transition-all duration-200",
              "peer-checked:border-blue-600",
              "peer-checked:bg-gradient-to-br",
              "peer-checked:from-[#0B2D5C]",
              "peer-checked:to-blue-600",
              "peer-focus-visible:ring-4",
              "peer-focus-visible:ring-blue-500/15",
              "peer-disabled:bg-slate-100"
            )}
          />

          {isChecked && (
            <Check
              size={14}
              strokeWidth={3}
              className="relative z-10 text-white"
            />
          )}
        </span>

        {(label ||
          description) && (
          <span className="min-w-0">
            {label && (
              <span className="block text-sm font-bold text-slate-700">
                {label}
              </span>
            )}

            {description && (
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName =
  "Checkbox";

export default Checkbox;