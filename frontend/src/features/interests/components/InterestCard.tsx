"use client";

import Link from "next/link";
import InterestTrustBadges from "./InterestTrustBadges";

import {
  ArrowUpRight,
  Check,
  Church,
  Clock3,
  MapPin,
  UserRound,
  X,
} from "lucide-react";

import type {
  Interest,
  InterestStatus,
} from "../types";

import {
  resolveBrowsePhotoUrl,
} from "@/features/browse/utils/photoUrl";

interface InterestCardProps {
  interest: Interest;
  updating: boolean;
  onAccept: (
    interestId: string
  ) => void;
  onDecline: (
    interestId: string
  ) => void;
}

function formatStatus(
  status: InterestStatus
): string {
  if (status === "ACCEPTED") {
    return "Accepted";
  }

  if (status === "DECLINED") {
    return "Declined";
  }

  return "Pending";
}

function formatDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function InterestCard({
  interest,
  updating,
  onAccept,
  onDecline,
}: InterestCardProps) {
  const sender =
    interest.sender;

  const displayName =
    sender?.fullName?.trim() ||
    "Holy Matrimony Member";

  const photoUrl =
    resolveBrowsePhotoUrl(
      sender?.primaryPhotoUrl
    );

  const location = [
    sender?.city,
    sender?.state,
    sender?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const profileHref =
    sender?.profileId
      ? `/browse/${sender.profileId}`
      : null;

  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.055)] transition-all duration-300 hover:border-blue-200 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)]">
      <div className="grid sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[165px_minmax(0,1fr)]">

        {/* =====================================================
            Photo
            ===================================================== */}

        <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 sm:aspect-auto sm:min-h-[185px]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${displayName} profile`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full min-h-[175px] items-center justify-center sm:min-h-[185px]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-blue-300 shadow-lg">
                <UserRound
                  size={40}
                  strokeWidth={1.35}
                />
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/75 via-transparent to-transparent" />

          <div className="absolute left-3 top-3">
            <StatusBadge
              status={
                interest.status
              }
              overlay
            />
          </div>
        </div>

        {/* =====================================================
            Content
            ===================================================== */}

        <div className="flex min-w-0 flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-[-0.02em] text-[#0B2D5C]">
                  {displayName}
                </h2>

  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
  {[
    sender?.age
      ? `${sender.age} years`
      : null,
    sender?.gender,
  ]
    .filter(Boolean)
    .join(" • ") ||
    "Profile details unavailable"}
</p>

<InterestTrustBadges
  mobileVerified={sender?.mobileVerified}
  identityVerified={sender?.identityVerified}
  churchVerified={sender?.churchVerified}
/>


              </div>

              {profileHref && (
                <Link
                  href={profileHref}
                  aria-label={`View ${displayName} profile`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ArrowUpRight
                    size={16}
                  />
                </Link>
              )}
            </div>

            {/* =================================================
                Details
                ================================================= */}

            <div className="mt-4 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
              <Detail
                icon={
                  <Church
                    size={15}
                  />
                }
                value={
                  sender?.denomination ||
                  "Denomination not specified"
                }
              />

              <Detail
                icon={
                  <MapPin
                    size={15}
                  />
                }
                value={
                  location ||
                  "Location not specified"
                }
              />

              <Detail
                icon={
                  <UserRound
                    size={15}
                  />
                }
                value={
                  sender?.profession ||
                  "Profession not specified"
                }
              />

              <Detail
                icon={
                  <Clock3
                    size={15}
                  />
                }
                value={
                  formatDate(
                    interest.createdAt
                  )
                }
              />
            </div>

            {/* =================================================
                Message
                ================================================= */}

            {interest.message && (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Message
                </p>

                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-700">
                  {
                    interest.message
                  }
                </p>
              </div>
            )}
          </div>

          {/* ===================================================
              Actions
              =================================================== */}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {profileHref && (
              <Link
                href={profileHref}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0B2D5C] transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                View Profile

                <ArrowUpRight
                  size={15}
                />
              </Link>
            )}

            {interest.status ===
              "PENDING" && (
              <>
                <button
                  type="button"
                  disabled={
                    updating
                  }
                  onClick={() =>
                    onDecline(
                      interest.id
                    )
                  }
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X
                    size={16}
                  />

                  Decline
                </button>

                <button
                  type="button"
                  disabled={
                    updating
                  }
                  onClick={() =>
                    onAccept(
                      interest.id
                    )
                  }
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check
                    size={16}
                  />

                  {updating
                    ? "Updating..."
                    : "Accept"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Detail({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </span>

      <span
        title={value}
        className="truncate text-xs font-semibold text-slate-600 sm:text-sm"
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
  overlay = false,
}: {
  status: InterestStatus;
  overlay?: boolean;
}) {
  const styles =
    status === "ACCEPTED"
      ? overlay
        ? "border-emerald-300/30 bg-emerald-500/90 text-white"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "DECLINED"
        ? overlay
          ? "border-red-300/30 bg-red-500/90 text-white"
          : "border-red-200 bg-red-50 text-red-700"
        : overlay
          ? "border-amber-300/30 bg-amber-400/95 text-slate-950"
          : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.09em] shadow-sm",
        overlay &&
          "backdrop-blur-md",
        styles,
      ].join(" ")}
    >
      {formatStatus(status)}
    </span>
  );
}
