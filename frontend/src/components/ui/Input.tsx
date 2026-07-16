"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
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

        <div
          className={`
            flex items-center rounded-2xl border bg-white
            transition-all duration-300
            ${
              error
                ? "border-red-400 focus-within:border-red-500"
                : "border-slate-300 focus-within:border-[#D4AF37]"
            }
            focus-within:ring-4
            ${
              error
                ? "focus-within:ring-red-100"
                : "focus-within:ring-[#D4AF37]/20"
            }
            shadow-sm
          `}
        >

          {leftIcon && (
            <div className="pl-4 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={`w-full rounded-2xl bg-transparent px-4 py-4 outline-none ${className}`}
          />

          {rightIcon && (
            <div className="pr-4">
              {rightIcon}
            </div>
          )}

        </div>

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

Input.displayName = "Input";

export default Input;