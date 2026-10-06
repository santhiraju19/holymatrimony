"use client";

import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type AdminButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success";

type AdminButtonSize =
  | "sm"
  | "md";

interface AdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

const variants: Record<
  AdminButtonVariant,
  string
> = {
  primary:
    "border-[#0B2D5C] bg-[#0B2D5C] text-white hover:border-[#123E78] hover:bg-[#123E78]",
  secondary:
    "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-[#0B2D5C]",
  danger:
    "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
};

const sizes: Record<
  AdminButtonSize,
  string
> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export default function AdminButton({
  variant = "secondary",
  size = "md",
  icon,
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={
        disabled ||
        loading
      }
      className={[
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
    >
      {icon}

      <span>
        {children}
      </span>
    </button>
  );
}
