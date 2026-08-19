"use client";

import {
  forwardRef,
  TextareaHTMLAttributes,
} from "react";

import {
  AlertCircle,
} from "lucide-react";

import { cn } from "@/utils/cn";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(
  (
    {
      label,
      error,
      hint,
      className,
      id,
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
            htmlFor={id}
            className="ml-0.5 block text-sm font-bold tracking-[-0.01em] text-slate-700"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          aria-invalid={
            hasError
              ? "true"
              : undefined
          }
          className={cn(
            "min-h-32 w-full resize-y rounded-2xl border",
            "bg-white/95 px-4 py-3.5",
            "text-[15px] font-medium leading-6 text-slate-900",
            "shadow-[0_3px_12px_rgba(15,23,42,0.04)]",
            "outline-none",
            "transition-all duration-250 ease-out",

            "placeholder:font-normal placeholder:text-slate-400",

            "hover:border-slate-400/80",
            "hover:shadow-[0_5px_16px_rgba(15,23,42,0.06)]",

            "focus:border-blue-500",
            "focus:bg-white",
            "focus:ring-4",
            "focus:ring-blue-500/10",
            "focus:shadow-[0_7px_22px_rgba(37,99,235,0.09)]",

            "disabled:cursor-not-allowed",
            "disabled:border-slate-200",
            "disabled:bg-slate-100/80",
            "disabled:text-slate-500",
            "disabled:shadow-none",

            hasError
              ? "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10"
              : "border-slate-200",

            className
          )}
          {...props}
        />

        {hint && !error && (
          <p className="ml-0.5 text-xs leading-5 text-slate-500">
            {hint}
          </p>
        )}

        {error && (
          <p
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

Textarea.displayName =
  "Textarea";

export default Textarea;