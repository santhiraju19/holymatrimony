import {
  ReactNode,
} from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  helperText?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
}

export default function FormField({
  label,
  children,
  required = false,
  helperText,
  error,
  htmlFor,
  className = "",
}: FormFieldProps) {
  return (
    <div
      className={[
        "group space-y-2",
        className,
      ].join(" ")}
      data-field-error={
        error ? "true" : undefined
      }
    >
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-semibold text-slate-700"
      >
        <span>{label}</span>

        {required && (
          <>
            <span
              aria-hidden="true"
              className="text-red-500"
            >
              *
            </span>

            <span className="sr-only">
              Required
            </span>
          </>
        )}
      </label>

      {children}

      {helperText && !error && (
        <p className="text-xs leading-5 text-slate-500">
          {helperText}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-sm font-medium text-red-600"
        >
          <span
            aria-hidden="true"
            className="mt-0.5"
          >
            ●
          </span>

          <span>{error}</span>
        </div>
      )}
    </div>
  );
}