import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={twMerge(
        "rounded-3xl border border-slate-200 bg-white p-8 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}