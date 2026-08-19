import {
  HTMLAttributes,
} from "react";

import { cn } from "@/utils/cn";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {}

export default function Card({
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-[24px] border border-slate-200/80",
        "bg-white/95",
        "shadow-[0_8px_28px_rgba(15,23,42,0.06)]",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        "hover:border-blue-200/80",
        "hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]",
        className
      )}
    >
      {children}
    </div>
  );
}