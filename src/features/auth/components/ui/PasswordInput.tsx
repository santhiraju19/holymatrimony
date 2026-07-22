"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

const PasswordInput = forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
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
    const [showPassword, setShowPassword] = useState(false);

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
            flex items-center rounded-2xl border bg-white shadow-sm
            transition-all duration-300
            ${
              error
                ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
                : "border-slate-300 focus-within:border-[#D4AF37] focus-within:ring-[#D4AF37]/20"
            }
            focus-within:ring-4
          `}
        >
          <Lock
            size={18}
            className="ml-4 text-slate-400"
          />

          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            {...props}
            className={`w-full bg-transparent px-4 py-4 outline-none ${className}`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mr-4 text-slate-500 hover:text-[#0B2D5C]"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
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

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;