"use client";

import {
  Church,
  Fingerprint,
  Smartphone,
} from "lucide-react";

interface InterestTrustBadgesProps {
  mobileVerified?: boolean;
  churchVerified?: boolean;
  identityVerified?: boolean;
}

export default function InterestTrustBadges({
  mobileVerified = false,
  churchVerified = false,
  identityVerified = false,
}: InterestTrustBadgesProps) {
  const hasAny =
    mobileVerified ||
    churchVerified ||
    identityVerified;

  if (!hasAny) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {mobileVerified && (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
          <Smartphone size={11} />
          Mobile
        </span>
      )}

      {identityVerified && (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-extrabold text-sky-700">
          <Fingerprint size={11} />
          ID Verified
        </span>
      )}

      {churchVerified && (
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-extrabold text-indigo-700">
          <Church size={11} />
          Church Verified
        </span>
      )}
    </div>
  );
}
