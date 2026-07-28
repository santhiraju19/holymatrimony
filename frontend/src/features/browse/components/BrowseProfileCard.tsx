"use client";

import Link from "next/link";

import type { BrowseProfile } from "../types";
import { resolveBrowsePhotoUrl } from "../utils/photoUrl";

interface BrowseProfileCardProps {
  profile: BrowseProfile;
}

function buildLocation(profile: BrowseProfile): string {
  return [profile.city, profile.state, profile.country]
    .filter(Boolean)
    .join(", ");
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function BrowseProfileCard({
  profile,
}: BrowseProfileCardProps) {
  const location = buildLocation(profile);

  const photoUrl = resolveBrowsePhotoUrl(
    profile.primaryPhotoUrl
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={profile.fullName || "Matrimony profile"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-700 shadow-md">
              {getInitials(profile.fullName || "Profile")}
            </div>
          </div>
        )}

        {profile.profileCompleted && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Verified profile
          </span>
        )}

        {profile.completionPercentage !== null &&
          profile.completionPercentage !== undefined && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {profile.completionPercentage}% complete
            </span>
          )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h2 className="truncate text-xl font-bold text-slate-900">
            {profile.fullName || "Unnamed profile"}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {[
              profile.age ? `${profile.age} years` : null,
              profile.gender,
            ]
              .filter(Boolean)
              .join(" • ") || "Basic details unavailable"}
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <ProfileDetail
            label="Profession"
            value={profile.profession}
          />

          <ProfileDetail
            label="Education"
            value={profile.highestEducation}
          />

          <ProfileDetail
            label="Church"
            value={profile.churchName}
          />

          <ProfileDetail
            label="Denomination"
            value={profile.denomination}
          />

          <ProfileDetail
            label="Location"
            value={location}
          />
        </div>

        <Link
          href={`/browse/${profile.id}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}

interface ProfileDetailProps {
  label: string;
  value: string | null | undefined;
}

function ProfileDetail({
  label,
  value,
}: ProfileDetailProps) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <span className="min-w-24 font-medium text-slate-800">
        {label}:
      </span>

      <span className="line-clamp-1">{value}</span>
    </div>
  );
}