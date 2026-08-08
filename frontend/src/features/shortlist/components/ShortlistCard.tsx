"use client";

import Link from "next/link";

import {
  BookmarkMinus,
  Church,
  GraduationCap,
  Loader2,
  MapPin,
  UserRound,
} from "lucide-react";

import { resolveBrowsePhotoUrl } from "@/features/browse/utils/photoUrl";

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
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${displayName} profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UserRound
              size={74}
              strokeWidth={1.3}
              className="text-blue-300"
            />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-20">
          <h2 className="truncate text-xl font-bold text-white">
            {displayName}
          </h2>

          <p className="mt-1 text-sm font-medium text-white/90">
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

      <div className="space-y-4 p-5">
        <div className="space-y-3 text-sm text-slate-600">
          <Detail
            icon={<UserRound size={17} />}
            value={
              shortlist.profession ||
              "Profession not specified"
            }
          />

          <Detail
            icon={
              <GraduationCap size={17} />
            }
            value={
              shortlist.highestEducation ||
              "Education not specified"
            }
          />

          <Detail
            icon={<Church size={17} />}
            value={
              shortlist.denomination ||
              shortlist.churchName ||
              "Church information not specified"
            }
          />

          <Detail
            icon={<MapPin size={17} />}
            value={
              location ||
              "Location not specified"
            }
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500">
            Shortlisted on{" "}
            {formatDate(
              shortlist.createdAt
            )}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/browse/${shortlist.profileId}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123C73]"
          >
            View Profile
          </Link>

          <button
            type="button"
            disabled={removing}
            onClick={() =>
              onRemove(
                shortlist.profileId
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {removing ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <BookmarkMinus size={17} />
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
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 text-blue-600">
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}