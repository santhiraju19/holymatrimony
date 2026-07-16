import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  helperText?: string;
  error?: string;
}

export default function FormField({
  label,
  children,
  required = false,
  helperText,
  error,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}

      {helperText && !error && (
        <p className="text-xs text-slate-500">
          {helperText}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}