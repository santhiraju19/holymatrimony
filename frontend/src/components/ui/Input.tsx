"use client";

import {
  forwardRef,
  InputHTMLAttributes,
} from "react";

import { cn } from "@/utils/cn";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      label,
      error,
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

        <input
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
            "min-h-12 w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition-all duration-200",
            "placeholder:text-slate-400",
            "hover:border-slate-400",
            "focus:-translate-y-px focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            hasError
              ? "border-red-500 bg-red-50/70 text-red-950 ring-4 ring-red-100 focus:border-red-600 focus:ring-red-100"
              : "border-slate-300",
            className
          )}
          {...props}
        />

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

Input.displayName = "Input";

export default Input;