"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
} from "react";

import {
  AlertCircle,
} from "lucide-react";

import { cn } from "@/utils/cn";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const hasError =
      Boolean(error);

    const describedBy = [
      error && id
        ? `${id}-error`
        : null,

      hint && id
        ? `${id}-hint`
        : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="ml-0.5 block text-sm font-bold tracking-[-0.01em] text-slate-700"
          >
            {label}
          </label>
        )}

        <div className="group relative">
          {leftIcon && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-4 top-1/2 z-10",
                "-translate-y-1/2",
                "flex items-center justify-center",
                "text-slate-400",
                "transition-colors duration-200",
                "group-focus-within:text-blue-600"
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={
              hasError
                ? "true"
                : undefined
            }
            aria-describedby={
              describedBy
            }
            className={cn(
              "h-12 w-full rounded-2xl border bg-white/95",
              "px-4 text-[15px] font-medium text-slate-900",
              "shadow-[0_3px_12px_rgba(15,23,42,0.04)]",
              "outline-none",
              "transition-all duration-250 ease-out",

              "placeholder:font-normal placeholder:text-slate-400",

              "hover:border-slate-400/80",
              "hover:shadow-[0_5px_16px_rgba(15,23,42,0.06)]",

              "focus:border-blue-500",
              "focus:bg-white",
              "focus:shadow-[0_7px_22px_rgba(37,99,235,0.09)]",
              "focus:ring-4",
              "focus:ring-blue-500/10",

              "disabled:cursor-not-allowed",
              "disabled:border-slate-200",
              "disabled:bg-slate-100/80",
              "disabled:text-slate-500",
              "disabled:shadow-none",

              leftIcon &&
                "pl-11",

              rightIcon &&
                "pr-11",

              hasError
                ? cn(
                    "border-red-300",
                    "bg-red-50/40",
                    "focus:border-red-500",
                    "focus:ring-red-500/10"
                  )
                : "border-slate-200",

              className
            )}
            {...props}
          />

          {rightIcon && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute right-4 top-1/2",
                "-translate-y-1/2",
                "flex items-center justify-center",
                "text-slate-400",
                "transition-colors duration-200",
                "group-focus-within:text-blue-600"
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {hint && !error && (
          <p
            id={
              id
                ? `${id}-hint`
                : undefined
            }
            className="ml-0.5 text-xs leading-5 text-slate-500"
          >
            {hint}
          </p>
        )}

        {error && (
          <p
            id={
              id
                ? `${id}-error`
                : undefined
            }
            role="alert"
            className="ml-0.5 flex items-start gap-1.5 text-xs font-semibold leading-5 text-red-600"
          >
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0"
            />

            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName =
  "Input";

export default Input;