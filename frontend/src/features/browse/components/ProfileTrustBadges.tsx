"use client";

import {
  BadgeCheck,
  Church,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

import type { BrowseProfile } from "../types";

interface ProfileTrustBadgesProps {
  profile: BrowseProfile;
  compact?: boolean;
  overlay?: boolean;
}

export default function ProfileTrustBadges({
  profile,
  compact = false,
  overlay = false,
}: ProfileTrustBadgesProps) {
  const badges = [];

  /*
   * Aadhaar is intentionally separate from generic ID
   * verification so members know exactly what was verified.
   */
  if (profile.aadhaarVerified) {
    badges.push({
      key: "aadhaar",
      label: "Aadhaar Verified",
      shortLabel: "Aadhaar",
      icon: ShieldCheck,
      style: overlay
        ? "border-amber-300/40 bg-gradient-to-r from-amber-400/95 via-yellow-400/95 to-amber-500/95 text-slate-950 shadow-[0_6px_22px_rgba(245,158,11,0.30)]"
        : "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 shadow-sm",
    });
  }

  /*
   * Non-Aadhaar government identity:
   * Passport / Driving Licence / Voter ID.
   */
  if (profile.idVerified) {
    badges.push({
      key: "identity",
      label: "ID Verified",
      shortLabel: "ID",
      icon: Fingerprint,
      style: overlay
        ? "border-sky-300/40 bg-slate-950/75 text-white shadow-[0_6px_22px_rgba(15,23,42,0.30)] backdrop-blur-xl"
        : "border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 text-blue-800 shadow-sm",
    });
  }

  if (profile.churchVerified) {
    badges.push({
      key: "church",
      label: "Church Verified",
      shortLabel: "Church",
      icon: Church,
      style: overlay
        ? "border-white/25 bg-white/90 text-[#0B2D5C] shadow-[0_6px_22px_rgba(15,23,42,0.22)] backdrop-blur-xl"
        : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 text-[#0B2D5C] shadow-sm",
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {badges.map((badge) => {
        const Icon = badge.icon;

        return (
          <span
            key={badge.key}
            title={badge.label}
            className={[
              "inline-flex items-center whitespace-nowrap rounded-full border font-extrabold tracking-tight",
              "transition duration-200",
              badge.style,
              compact
                ? "gap-1 px-2 py-1 text-[10px] sm:text-[11px]"
                : "gap-1.5 px-3 py-1.5 text-xs",
            ].join(" ")}
          >
            <span
              className={[
                "flex shrink-0 items-center justify-center rounded-full",
                overlay
                  ? "bg-current/10"
                  : "",
              ].join(" ")}
            >
              <Icon
                size={compact ? 12 : 14}
                strokeWidth={2.5}
              />
            </span>

            {compact
              ? badge.shortLabel
              : badge.label}

            {!compact && (
              <BadgeCheck
                size={13}
                strokeWidth={2.5}
                className="opacity-80"
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
