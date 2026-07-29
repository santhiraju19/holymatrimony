"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  GraduationCap,
  MapPin,
  UserRound,
} from "lucide-react";

import type { BrowseProfile } from "../types";
import { resolveBrowsePhotoUrl } from "../utils/photoUrl";

interface BrowseProfileCardProps {
  profile: BrowseProfile;
}

export default function BrowseProfileCard({
  profile,
}: BrowseProfileCardProps) {
  const photoUrl = resolveBrowsePhotoUrl(
    profile.primaryPhotoUrl
  );

  const displayName =
    profile.fullName?.trim() ||
    "Holy Matrimony Member";

  const location = buildLocation(profile);

  const churchDetails = buildChurchDetails(profile);

  const completionPercentage = Math.min(
    Math.max(
      profile.completionPercentage ?? 0,
      0
    ),
    100
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/browse/${profile.id}`}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${displayName} profile photo`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <UserRound
                size={72}
                strokeWidth={1.4}
                className="text-blue-300"
              />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-16">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-white">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm font-medium text-white/90">
                  {buildBasicDetails(profile)}
                </p>
              </div>

              {profile.profileCompleted && (
                <span
                  title="Completed profile"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow"
                >
                  <CheckCircle2 size={20} />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-3">
            <ProfileDetail
              icon={
                <BriefcaseBusiness size={17} />
              }
              value={
                profile.profession?.trim() ||
                "Profession not specified"
              }
            />

            <ProfileDetail
              icon={<GraduationCap size={17} />}
              value={
                profile.highestEducation?.trim() ||
                "Education not specified"
              }
            />

            <ProfileDetail
              icon={<Church size={17} />}
              value={
                churchDetails ||
                "Church information not specified"
              }
            />

            <ProfileDetail
              icon={<MapPin size={17} />}
              value={
                location ||
                "Location not specified"
              }
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Profile completion
              </span>

              <span className="text-sm font-bold text-blue-700">
                {completionPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-blue-700">
              View profile
            </span>

            <span className="text-lg text-blue-700 transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

interface ProfileDetailProps {
  icon: React.ReactNode;
  value: string;
}

function ProfileDetail({
  icon,
  value,
}: ProfileDetailProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm text-slate-600">
      <span className="shrink-0 text-blue-600">
        {icon}
      </span>

      <span className="truncate">{value}</span>
    </div>
  );
}

function buildBasicDetails(
  profile: BrowseProfile
): string {
  const details: string[] = [];

  if (profile.age !== null) {
    details.push(`${profile.age} years`);
  }

  if (profile.gender?.trim()) {
    details.push(profile.gender.trim());
  }

  if (profile.maritalStatus?.trim()) {
    details.push(profile.maritalStatus.trim());
  }

  return details.length > 0
    ? details.join(" • ")
    : "Profile details unavailable";
}

function buildLocation(
  profile: BrowseProfile
): string {
  return [
    profile.city?.trim(),
    profile.state?.trim(),
    profile.country?.trim(),
  ]
    .filter(
      (value): value is string =>
        Boolean(value)
    )
    .join(", ");
}

function buildChurchDetails(
  profile: BrowseProfile
): string {
  return [
    profile.churchName?.trim(),
    profile.denomination?.trim(),
  ]
    .filter(
      (value): value is string =>
        Boolean(value)
    )
    .join(" • ");
}