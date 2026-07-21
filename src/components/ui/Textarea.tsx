"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface Props
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      label,
      helperText,
      error,
      required,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">

        {label && (
          <label className="block text-sm font-semibold text-slate-700">
            {label}

            {required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          {...props}
          className={`
            w-full rounded-2xl border bg-white px-4 py-4 shadow-sm
            outline-none transition-all duration-300
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
            }
            focus:ring-4
            ${className}
          `}
        />

        {error ? (
          <p className="text-sm text-red-500">
            {error}
          </p>
        ) : (
          helperText && (
            <p className="text-sm text-slate-500">
              {helperText}
            </p>
          )
        )}

      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;