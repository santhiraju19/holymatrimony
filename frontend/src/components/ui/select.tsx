"use client";

import {
  forwardRef,
  SelectHTMLAttributes,
} from "react";

import { cn } from "@/utils/cn";

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(
  (
    {
      label,
      error,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const hasError =
      Boolean(error);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-semibold text-slate-700"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          aria-invalid={
            hasError
              ? "true"
              : undefined
          }
          aria-describedby={
            hasError &&
            props.id
              ? `${props.id}-error`
              : undefined
          }
          className={cn(
            "min-h-12 w-full cursor-pointer appearance-none rounded-2xl border bg-white px-4 py-3 pr-11 text-base text-slate-900 shadow-sm outline-none transition-all duration-200",
            "hover:border-slate-400",
            "focus:-translate-y-px focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            hasError
              ? "border-red-500 bg-red-50/70 text-red-950 ring-4 ring-red-100 focus:border-red-600 focus:ring-red-100"
              : "border-slate-300",
            className
          )}
          {...props}
        >
          {children}
        </select>

        {error && (
          <p
            id={
              props.id
                ? `${props.id}-error`
                : undefined
            }
            role="alert"
            className="text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;