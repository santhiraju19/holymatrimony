"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  options: Option[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      options,
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
            relative rounded-2xl border bg-white shadow-sm
            transition-all duration-300
            ${
              error
                ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
                : "border-slate-300 focus-within:border-[#D4AF37] focus-within:ring-[#D4AF37]/20"
            }
            focus-within:ring-4
          `}
        >
          <select
            ref={ref}
            {...props}
            className={`w-full appearance-none rounded-2xl bg-transparent px-4 py-4 pr-12 outline-none ${className}`}
          >
            <option value="">
              Select an option
            </option>

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
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

Select.displayName = "Select";

export default Select;