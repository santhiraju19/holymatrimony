"use client";

import Link from "next/link";

import {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize =
  | "sm"
  | "md"
  | "lg";

interface BaseProps {
  children: ReactNode;

  variant?: ButtonVariant;
  size?: ButtonSize;

  fullWidth?: boolean;
  loading?: boolean;

  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  className?: string;
}

type ButtonProps =
  | (
      BaseProps &
      ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: never;
      }
    )
  | (
      BaseProps & {
        href: string;
      }
    );

/*
 * ============================================================
 * Premium Holy Matrimony Button System
 * ============================================================
 */

const base = cn(
  "group relative inline-flex shrink-0 items-center justify-center",
  "overflow-hidden whitespace-nowrap rounded-2xl",
  "font-bold tracking-[-0.01em]",
  "transition-all duration-300 ease-out",
  "focus-visible:outline-none",
  "focus-visible:ring-4",
  "focus-visible:ring-blue-500/15",
  "focus-visible:ring-offset-2",
  "active:translate-y-0",
  "disabled:pointer-events-none",
  "disabled:opacity-50"
);

const variants: Record<
  ButtonVariant,
  string
> = {
  /*
   * Primary action:
   * premium Holy Matrimony navy → royal blue.
   */
  primary: cn(
    "border border-blue-700/20",
    "bg-gradient-to-r",
    "from-[#0B2D5C]",
    "via-[#123F7A]",
    "to-[#1D4ED8]",
    "text-white",
    "shadow-[0_8px_24px_rgba(11,45,92,0.18)]",
    "hover:-translate-y-0.5",
    "hover:shadow-[0_14px_32px_rgba(11,45,92,0.26)]",
    "hover:saturate-[1.08]",
    "active:shadow-[0_5px_14px_rgba(11,45,92,0.18)]"
  ),

  /*
   * Secondary action:
   * sophisticated dark navy.
   */
  secondary: cn(
    "border border-slate-800/10",
    "bg-gradient-to-b",
    "from-slate-800",
    "to-slate-950",
    "text-white",
    "shadow-[0_7px_20px_rgba(15,23,42,0.15)]",
    "hover:-translate-y-0.5",
    "hover:from-[#123F7A]",
    "hover:to-[#0B2D5C]",
    "hover:shadow-[0_12px_28px_rgba(15,23,42,0.22)]"
  ),

  /*
   * Elegant bordered action.
   */
  outline: cn(
    "border border-slate-200",
    "bg-white/90",
    "text-[#0B2D5C]",
    "shadow-[0_3px_12px_rgba(15,23,42,0.05)]",
    "backdrop-blur-sm",
    "hover:-translate-y-0.5",
    "hover:border-blue-300",
    "hover:bg-blue-50/70",
    "hover:text-blue-700",
    "hover:shadow-[0_8px_22px_rgba(37,99,235,0.10)]"
  ),

  /*
   * Quiet action for toolbars.
   */
  ghost: cn(
    "border border-transparent",
    "bg-transparent",
    "text-slate-600",
    "hover:bg-slate-100/90",
    "hover:text-[#0B2D5C]"
  ),

  /*
   * Destructive action.
   */
  danger: cn(
    "border border-red-600/10",
    "bg-gradient-to-r",
    "from-red-600",
    "to-rose-600",
    "text-white",
    "shadow-[0_7px_20px_rgba(220,38,38,0.16)]",
    "hover:-translate-y-0.5",
    "hover:shadow-[0_12px_28px_rgba(220,38,38,0.24)]"
  ),
};

const sizes: Record<
  ButtonSize,
  string
> = {
  sm: "h-10 gap-1.5 px-4 text-sm",

  md: "h-12 gap-2 px-6 text-sm sm:text-[15px]",

  lg: "h-14 gap-2.5 px-8 text-base",
};

/*
 * Small light reflection used on premium filled buttons.
 */
function ButtonShine({
  variant,
}: {
  variant: ButtonVariant;
}) {
  if (
    variant === "outline" ||
    variant === "ghost"
  ) {
    return null;
  }

  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-b",
          "from-white/15",
          "via-transparent",
          "to-transparent",
          "opacity-70"
        )}
      />

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute",
          "-left-12 top-0",
          "h-full w-10",
          "-skew-x-12",
          "bg-white/20",
          "blur-sm",
          "transition-transform",
          "duration-700",
          "group-hover:translate-x-[320px]"
        )}
      />
    </>
  );
}

function ButtonContent({
  children,
  loading,
  leftIcon,
  rightIcon,
}: {
  children: ReactNode;
  loading: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}) {
  return (
    <span className="relative z-10 inline-flex items-center justify-center gap-inherit">
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leftIcon && (
          <span className="flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
            {leftIcon}
          </span>
        )
      )}

      <span>
        {children}
      </span>

      {!loading &&
        rightIcon && (
          <span className="flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
    </span>
  );
}

export default function Button(
  props: ButtonProps
) {
  /*
   * ============================================================
   * Link Button
   * ============================================================
   */

  if (
    props.href !==
    undefined
  ) {
    const {
      href,
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
    } = props;

    const classes =
      cn(
        base,
        variants[
          variant
        ],
        sizes[size],
        fullWidth &&
          "w-full",
        className
      );

    return (
      <Link
        href={href}
        className={
          classes
        }
      >
        <ButtonShine
          variant={
            variant
          }
        />

        <ButtonContent
          loading={
            false
          }
          leftIcon={
            leftIcon
          }
          rightIcon={
            rightIcon
          }
        >
          {children}
        </ButtonContent>
      </Link>
    );
  }

  /*
   * ============================================================
   * Standard Button
   * ============================================================
   */

  const {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    type = "button",
    ...buttonProps
  } = props;

  const classes =
    cn(
      base,
      variants[
        variant
      ],
      sizes[size],
      fullWidth &&
        "w-full",
      className
    );

  return (
    <button
      {...buttonProps}
      type={type}
      className={
        classes
      }
      aria-busy={
        loading ||
        undefined
      }
      disabled={
        loading ||
        buttonProps.disabled
      }
    >
      <ButtonShine
        variant={
          variant
        }
      />

      <ButtonContent
        loading={
          loading
        }
        leftIcon={
          leftIcon
        }
        rightIcon={
          rightIcon
        }
      >
        {children}
      </ButtonContent>
    </button>
  );
}