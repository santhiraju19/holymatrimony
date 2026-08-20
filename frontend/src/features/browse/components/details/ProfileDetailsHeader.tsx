"use client";

import Link from "next/link";

import {
  ArrowLeft,
  HeartHandshake,
  MapPin,
  Sparkles,
} from "lucide-react";

import InterestButton from "@/features/interests/components/InterestButton";
import ShortlistButton from "@/features/shortlist/components/ShortlistButton";

import PremiumVerifiedBadge from "../PremiumVerifiedBadge";
import ProfileTrustBadges from "../ProfileTrustBadges";

import ProfileContactButton from "./ProfileContactButton";

import type {
  BrowseProfile,
} from "../../types";

import {
  resolveBrowsePhotoUrl,
} from "../../utils/photoUrl";

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
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase()
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

  const hasTrustBadge =
    Boolean(
      profile.aadhaarVerified ||
        profile.idVerified ||
        profile.churchVerified
    );

  const completion =
    Math.min(
      Math.max(
        profile.completionPercentage ??
          0,
        0
      ),
      100
    );

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="grid lg:grid-cols-[310px_minmax(0,1fr)]">

        {/* =====================================================
            Compact Profile Photo
            ===================================================== */}

        <div className="relative min-h-[310px] overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100 sm:min-h-[340px] lg:min-h-[360px]">

          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${displayName} profile photo`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[310px] items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white bg-white/90 text-2xl font-black text-blue-700 shadow-xl backdrop-blur">
                {getInitials(
                  displayName
                )}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-black/25" />

          {/* Platinum Premium Badge */}

          {profile.verifiedPremiumBadge && (
            <div className="absolute bottom-4 left-4 z-20 lg:bottom-auto lg:left-auto lg:right-4 lg:top-4">
              <PremiumVerifiedBadge
                compact
                overlay
              />
            </div>
          )}

          {/* Trust badges on photo */}

          {hasTrustBadge && (
            <div className="absolute left-3 right-3 top-3 z-10">
              <ProfileTrustBadges
                profile={profile}
                compact
                overlay
              />
            </div>
          )}

          {/* Identity on photo for mobile */}

          <div className="absolute inset-x-0 bottom-0 p-4 lg:hidden">
            <h1 className="truncate text-2xl font-black tracking-[-0.03em] text-white">
              {displayName}
            </h1>

            {summary && (
              <p className="mt-1 text-sm font-semibold text-white/85">
                {summary}
              </p>
            )}
          </div>
        </div>

        {/* =====================================================
            Profile Information
            ===================================================== */}

        <div className="relative flex min-w-0 flex-col justify-between p-5 sm:p-6 lg:p-7">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-100/50 blur-3xl"
          />

          <div className="relative z-10">

            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <ArrowLeft
                size={14}
              />

              Back to profiles
            </Link>

            {/* Desktop identity */}

            <div className="mt-4 hidden lg:block">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl font-black tracking-[-0.04em] text-[#0B2D5C]">
                  {displayName}
                </h1>

                {profile.verifiedPremiumBadge && (
                  <PremiumVerifiedBadge />
                )}

                {completion > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                    <Sparkles
                      size={12}
                    />

                    {completion}% Complete
                  </span>
                )}

              </div>

              {summary && (
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {summary}
                </p>
              )}

            </div>

            {/* Location */}

            {location && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">

                <MapPin
                  size={15}
                  className="shrink-0 text-blue-600"
                />

                {location}

              </div>
            )}

            {/* Desktop trust badges */}

            {hasTrustBadge && (
              <div className="mt-4 hidden lg:block">
                <ProfileTrustBadges
                  profile={profile}
                />
              </div>
            )}

            {/* About */}

            {profile.aboutMe && (
              <div className="mt-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">

                <div className="flex items-center gap-2">

                  <HeartHandshake
                    size={16}
                    className="text-[#0B2D5C]"
                  />

                  <h2 className="text-sm font-black text-[#0B2D5C]">
                    About
                  </h2>

                </div>

                <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {
                    profile.aboutMe
                  }
                </p>

              </div>
            )}

          </div>

          {/* ===================================================
              Actions
              =================================================== */}

          <div className="relative z-10 mt-5">

            <div className="grid gap-2.5 sm:grid-cols-2">

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
                profileId={
                  profile.id
                }
                memberName={
                  displayName
                }
              />

            </div>

            {/* =================================================
                Protected Contact Details
                ================================================= */}

            <div className="mt-3">

              <ProfileContactButton
                profileId={
                  profile.id
                }
              />

            </div>

          </div>

        </div>
      </div>

      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/65 to-transparent" />
    </section>
  );
}
