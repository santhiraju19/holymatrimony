import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-white/20
        bg-white/70
        backdrop-blur-xl
        shadow-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}