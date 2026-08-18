
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BriefcaseBusiness,
  Church,
  GraduationCap,
  MapPin,
  UserRound,
} from "lucide-react";

import InterestButton from "@/features/interests/components/InterestButton";
import ProfileTrustBadges from "@/features/browse/components/ProfileTrustBadges";

import type { BrowseProfile } from "../types";
import { resolveBrowsePhotoUrl } from "../utils/photoUrl";

interface BrowseProfileCardProps {
  profile: BrowseProfile;
}

export default function BrowseProfileCard({
  profile,
}: BrowseProfileCardProps) {
  const photoUrl =
    resolveBrowsePhotoUrl(
      profile.primaryPhotoUrl
    );

  const displayName =
    profile.fullName?.trim() ||
    "Holy Matrimony Member";

  const location =
    buildLocation(profile);

  const churchDetails =
    buildChurchDetails(profile);

  const completionPercentage =
    Math.min(
      Math.max(
        profile.completionPercentage ??
          0,
        0
      ),
      100
    );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <Link
        href={`/browse/${profile.id}`}
        className="block"
      >
        {/* Compact portrait */}
        <div className="relative aspect-[5/4] overflow-hidden bg-slate-100 sm:aspect-[4/3] xl:aspect-[5/4]">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${displayName} profile photo`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <UserRound
                size={52}
                strokeWidth={1.4}
                className="text-blue-300"
              />
            </div>
          )}

          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-4.5rem)]">
  <ProfileTrustBadges
    profile={profile}
    compact
    overlay
  />
</div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3.5 pt-12">
            <div>
  <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-white">
                  {displayName}
                </h2>

                <p className="mt-0.5 truncate text-xs font-medium text-white/90 sm:text-sm">
                  {buildBasicDetails(
                    profile
                  )}
                </p>
              </div>

              
            </div>
          </div>
        </div>
      </Link>

      {/* Profile information */}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/browse/${profile.id}`}
          className="block flex-1"
        >
          <div className="space-y-3 p-4">
  
            <div className="space-y-2.5">
              <ProfileDetail
                icon={
                  <BriefcaseBusiness
                    size={15}
                  />
                }
                value={
                  profile.profession?.trim() ||
                  "Profession not specified"
                }
              />

              <ProfileDetail
                icon={
                  <GraduationCap
                    size={15}
                  />
                }
                value={
                  profile.highestEducation?.trim() ||
                  "Education not specified"
                }
              />

              <ProfileDetail
                icon={
                  <Church
                    size={15}
                  />
                }
                value={
                  churchDetails ||
                  "Church information not specified"
                }
              />

              <ProfileDetail
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
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
                  Profile completion
                </span>

                <span className="text-xs font-black text-blue-700">
                  {completionPercentage}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 sm:text-sm">
                View profile
              </span>

              <span className="text-base text-blue-700 transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </Link>

        <div className="border-t border-slate-100 p-3.5 sm:p-4">
          <InterestButton
            receiverProfileId={
              profile.id
            }
            memberName={
              displayName
            }
            message={`Hello ${displayName}, I am interested in connecting with you through Holy Matrimony.`}
          />
        </div>
      </div>
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
    <div className="flex min-w-0 items-center gap-2.5 text-xs text-slate-600 sm:text-sm">
      <span className="shrink-0 text-blue-600">
        {icon}
      </span>

      <span
        title={value}
        className="truncate"
      >
        {value}
      </span>
    </div>
  );
}

function buildBasicDetails(
  profile: BrowseProfile
): string {
  const details: string[] = [];

  if (
    profile.age !== null &&
    profile.age !== undefined &&
    profile.age > 0
  ) {
    details.push(
      `${profile.age} years`
    );
  }

  if (profile.gender?.trim()) {
    details.push(
      profile.gender.trim()
    );
  }

  if (
    profile.maritalStatus?.trim()
  ) {
    details.push(
      profile.maritalStatus.trim()
    );
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