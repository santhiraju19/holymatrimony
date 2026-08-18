"use client";

import {
  BadgeCheck,
  Church,
  Fingerprint,
  Smartphone,
} from "lucide-react";

import type {
  BrowseProfile,
} from "../types";

interface ProfileTrustBadgesProps {
  profile: BrowseProfile;
  compact?: boolean;
}

export default function ProfileTrustBadges({
  profile,
  compact = false,
}: ProfileTrustBadgesProps) {

  const badges = [
    {
      key: "mobile",
      label: "Mobile Verified",
      shortLabel: "Mobile",
      verified:
        profile.mobileVerified,
      icon:
        <Smartphone
          size={compact ? 13 : 15}
        />,
    },
    {
      key: "church",
      label: "Church Verified",
      shortLabel: "Church",
      verified:
        profile.churchVerified,
      icon:
        <Church
          size={compact ? 13 : 15}
        />,
    },
    {
      key: "identity",
      label: "Identity Verified",
      shortLabel: "Identity",
      verified:
        profile.identityVerified,
      icon:
        <Fingerprint
          size={compact ? 13 : 15}
        />,
    },
  ].filter(
    (badge) =>
      badge.verified
  );

  if (
    badges.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">

      {profile.verifiedProfile && (

        <span
          title="Mobile, Church and Identity verified"
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-600 font-bold text-white shadow-sm ${
            compact
              ? "px-2 py-1 text-[10px]"
              : "px-3 py-1.5 text-xs"
          }`}
        >

          <BadgeCheck
            size={
              compact
                ? 13
                : 15
            }
          />

          Verified Profile

        </span>
      )}

      {badges.map(
        (badge) => (

          <span
            key={
              badge.key
            }
            title={
              badge.label
            }
            className={`inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 font-semibold text-blue-700 ${
              compact
                ? "px-2 py-1 text-[10px]"
                : "px-3 py-1.5 text-xs"
            }`}
          >

            {badge.icon}

            {compact
              ? badge.shortLabel
              : badge.label}

          </span>
        )
      )}

    </div>
  );
}