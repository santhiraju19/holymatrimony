"use client";

import Link from "next/link";

import InterestButton from "@/features/interests/components/InterestButton";
import ShortlistButton from "@/features/shortlist/components/ShortlistButton";

import type { BrowseProfile } from "../../types";
import { resolveBrowsePhotoUrl } from "../../utils/photoUrl";

interface ProfileDetailsHeaderProps {
  profile: BrowseProfile;
}

function getInitials(
  fullName: string
): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function buildSummary(
  profile: BrowseProfile
): string {
  return [
    profile.age
      ? `${profile.age} years`
      : null,
    profile.gender,
    profile.maritalStatus,
  ]
    .filter(Boolean)
    .join(" • ");
}

function buildLocation(
  profile: BrowseProfile
): string {
  return [
    profile.city,
    profile.state,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function ProfileDetailsHeader({
  profile,
}: ProfileDetailsHeaderProps) {
  const photoUrl =
    resolveBrowsePhotoUrl(
      profile.primaryPhotoUrl
    );

  const displayName =
    profile.fullName?.trim() ||
    "Holy Matrimony Member";

  const summary =
    buildSummary(profile);

  const location =
    buildLocation(profile);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[380px_1fr]">
        <div className="relative min-h-[460px] overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${displayName} profile photo`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[460px] items-center justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-4xl font-bold text-blue-700 shadow-lg">
                {getInitials(displayName)}
              </div>
            </div>
          )}

          {profile.profileCompleted && (
            <span className="absolute left-5 top-5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              Verified Profile
            </span>
          )}
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
            >
              <span aria-hidden="true">
                ←
              </span>

              Back to profiles
            </Link>

            <div className="mt-7">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {displayName}
                </h1>

                {profile.completionPercentage !=
                  null && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {
                      profile.completionPercentage
                    }
                    % complete
                  </span>
                )}
              </div>

              {summary && (
                <p className="mt-3 text-lg text-slate-600">
                  {summary}
                </p>
              )}

              {location && (
                <p className="mt-2 text-base font-medium text-slate-700">
                  📍 {location}
                </p>
              )}
            </div>

            {profile.aboutMe && (
              <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-900">
                  About
                </h2>

                <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                  {profile.aboutMe}
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <InterestButton
              receiverProfileId={
                profile.id
              }
              memberName={
                displayName
              }
              message={`Hello ${displayName}, I am interested in connecting with you through Holy Matrimony.`}
            />

            <ShortlistButton
              profileId={profile.id}
              memberName={displayName}
            />
          </div>
        </div>
      </div>
    </section>
  );
}