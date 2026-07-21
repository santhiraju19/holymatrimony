"use client";

import {
  forwardRef,
  SelectHTMLAttributes,
} from "react";

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ label, error, children, className = "", ...props }, ref) => {
  return (
    <div className="space-y-2">

      {label && (
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}

      <select
        ref={ref}
        className={`
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-4
          py-3
          outline-none
          transition
          focus:border-blue-600
          focus:ring-4
          focus:ring-blue-100
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

    </div>
  );
});

Select.displayName = "Select";

export default Select;