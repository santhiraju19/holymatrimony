"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  BookmarkCheck,
  BookmarkMinus,
  Church,
  GraduationCap,
  Loader2,
  MapPin,
  UserRound,
} from "lucide-react";

import {
  resolveBrowsePhotoUrl,
} from "@/features/browse/utils/photoUrl";

import type {
  ShortlistProfile,
} from "../services/shortlist.service";

interface ShortlistCardProps {
  shortlist: ShortlistProfile;
  removing: boolean;
  onRemove: (
    profileId: string
  ) => void;
}

function buildLocation(
  shortlist: ShortlistProfile
): string {
  return [
    shortlist.city,
    shortlist.state,
    shortlist.country,
  ]
    .filter(Boolean)
    .join(", ");
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
    }
  ).format(date);
}

export default function ShortlistCard({
  shortlist,
  removing,
  onRemove,
}: ShortlistCardProps) {
  const displayName =
    shortlist.fullName?.trim() ||
    "Holy Matrimony Member";

  const photoUrl =
    resolveBrowsePhotoUrl(
      shortlist.primaryPhotoUrl
    );

  const location =
    buildLocation(shortlist);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]">

      {/* Photo */}
      <Link
        href={`/browse/${shortlist.profileId}`}
        className="block"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${displayName} profile`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-blue-300 shadow-lg">
                <UserRound
                  size={46}
                  strokeWidth={1.35}
                />
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/85 via-[#020817]/10 to-transparent" />

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#0B2D5C] shadow-sm">
            <BookmarkCheck
              size={12}
            />

            Shortlisted
          </span>

          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/25 text-white backdrop-blur transition group-hover:bg-white group-hover:text-[#0B2D5C]">
            <ArrowUpRight
              size={16}
            />
          </span>

          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-16">
            <h2 className="truncate text-xl font-black tracking-[-0.02em] text-white">
              {displayName}
            </h2>

            <p className="mt-1 truncate text-xs font-semibold text-white/85 sm:text-sm">
              {[
                shortlist.age
                  ? `${shortlist.age} years`
                  : null,
                shortlist.gender,
                shortlist.maritalStatus,
              ]
                .filter(Boolean)
                .join(" • ") ||
                "Profile details unavailable"}
            </p>
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/browse/${shortlist.profileId}`}
          className="block flex-1"
        >
          <div className="space-y-3.5 p-4">
            <Detail
              icon={
                <UserRound
                  size={15}
                />
              }
              value={
                shortlist.profession ||
                "Profession not specified"
              }
            />

            <Detail
              icon={
                <GraduationCap
                  size={15}
                />
              }
              value={
                shortlist.highestEducation ||
                "Education not specified"
              }
            />

            <Detail
              icon={
                <Church
                  size={15}
                />
              }
              value={
                shortlist.denomination ||
                shortlist.churchName ||
                "Church information not specified"
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

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-400">
                Shortlisted on{" "}
                <span className="text-slate-600">
                  {formatDate(
                    shortlist.createdAt
                  )}
                </span>
              </p>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="mt-auto grid gap-2 border-t border-slate-100 bg-gradient-to-r from-white to-blue-50/30 p-3.5 sm:grid-cols-2">
          <Link
            href={`/browse/${shortlist.profileId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            View Profile

            <ArrowUpRight
              size={15}
            />
          </Link>

          <button
            type="button"
            disabled={removing}
            onClick={() =>
              onRemove(
                shortlist.profileId
              )
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <BookmarkMinus
                size={15}
              />
            )}

            {removing
              ? "Removing..."
              : "Remove"}
          </button>
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
