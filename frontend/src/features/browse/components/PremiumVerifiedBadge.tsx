"use client";

import {
  Crown,
  BadgeCheck,
} from "lucide-react";

interface PremiumVerifiedBadgeProps {
  compact?: boolean;
  overlay?: boolean;
}

export default function PremiumVerifiedBadge({
  compact = false,
  overlay = false,
}: PremiumVerifiedBadgeProps) {
  return (
    <span
      title="Platinum Verified Member"
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border font-black tracking-tight",
        "transition duration-200",
        overlay
          ? "border-amber-300/50 bg-gradient-to-r from-[#071A36]/95 via-[#0B2D5C]/95 to-[#123F7A]/95 text-amber-200 shadow-[0_8px_24px_rgba(2,8,23,0.35)] backdrop-blur-xl"
          : "border-amber-300 bg-gradient-to-r from-[#071A36] via-[#0B2D5C] to-[#123F7A] text-amber-200 shadow-md",
        compact
          ? "gap-1.5 px-2.5 py-1 text-[10px] sm:text-[11px]"
          : "gap-2 px-3 py-1.5 text-xs",
      ].join(" ")}
    >
      <Crown
        size={compact ? 12 : 14}
        strokeWidth={2.5}
      />

      {compact
        ? "Platinum"
        : "Platinum Verified"}

      {!compact && (
        <BadgeCheck
          size={13}
          strokeWidth={2.5}
        />
      )}
    </span>
  );
}
