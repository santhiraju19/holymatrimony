import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}