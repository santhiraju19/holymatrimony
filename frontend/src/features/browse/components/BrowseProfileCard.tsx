"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  GraduationCap,
  MapPin,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import InterestButton from "@/features/interests/components/InterestButton";

import ProfileTrustBadges from "@/features/browse/components/ProfileTrustBadges";

import type {
  BrowseProfile,
} from "../types";

import {
  resolveBrowsePhotoUrl,
} from "../utils/photoUrl";

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
    buildLocation(
      profile
    );

  const churchDetails =
    buildChurchDetails(
      profile
    );

  const basicDetails =
    buildBasicDetails(
      profile
    );

  const completionPercentage =
    Math.min(
      Math.max(
        profile.completionPercentage ??
          0,
        0
      ),
      100
    );

  const highlightedProfile =
    Boolean(
      profile.highlightedProfile
    );

  const hasTrustCredentials =
    Boolean(
      profile.aadhaarVerified ||
        profile.idVerified ||
        profile.churchVerified
    );

  const hasCompatibility =
    profile.compatibilityScore !==
      null &&
    profile.compatibilityScore !==
      undefined;

  const compatibilityScore =
    hasCompatibility
      ? Math.min(
          Math.max(
            profile.compatibilityScore ??
              0,
            0
          ),
          100
        )
      : null;

  const cardClassName = [
    "group relative flex h-full flex-col overflow-hidden rounded-[24px] border bg-white transition-all duration-300 ease-out hover:-translate-y-1",

    highlightedProfile
      ? "border-amber-300/90 shadow-[0_14px_38px_rgba(212,175,55,0.18)] hover:border-amber-400 hover:shadow-[0_24px_58px_rgba(212,175,55,0.28)]"
      : "border-slate-200/80 shadow-[0_8px_28px_rgba(15,23,42,0.055)] hover:border-blue-200/80 hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)]",
  ].join(" ");

  return (
    <article
      className={
        cardClassName
      }
    >
      {/* =====================================================
          Premium Highlight Frame
          ===================================================== */}

      {highlightedProfile && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[24px] ring-1 ring-inset ring-amber-300/50"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 z-0 h-40 w-40 rounded-full bg-amber-200/25 blur-3xl"
          />
        </>
      )}

      {/* =====================================================
          Top Accent
          ===================================================== */}

      <div
        aria-hidden="true"
        className={[
          "absolute inset-x-10 top-0 z-40 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-opacity duration-300",

          highlightedProfile
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      />

      {/* =====================================================
          Profile Photo
          ===================================================== */}

      <Link
        href={`/browse/${profile.id}`}
        className="block"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-50 sm:aspect-[4/3] xl:aspect-[5/4]">

          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${displayName} profile photo`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white bg-white/80 text-blue-300 shadow-[0_14px_40px_rgba(37,99,235,0.12)] backdrop-blur-sm">
                <UserRound
                  size={48}
                  strokeWidth={1.35}
                />
              </div>
            </div>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/90 via-[#020817]/15 to-transparent"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent"
          />

          {/* =================================================
              Highlighted Badge
              ================================================= */}

          {highlightedProfile && (
            <div className="absolute left-3 top-3 z-30">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-[#0B2D5C]/95 to-blue-800/95 px-3 py-1.5 text-white shadow-lg backdrop-blur-xl">
                <Star
                  size={12}
                  className="fill-[#F7D66D] text-[#F7D66D]"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.08em]">
                  Highlighted
                </span>
              </div>
            </div>
          )}

          {/* =================================================
              Trust Badges
              ================================================= */}

          {hasTrustCredentials && (
            <div
              className={[
                "absolute left-3 z-20 max-w-[calc(100%-3.5rem)]",

                highlightedProfile
                  ? "top-12"
                  : "top-3",
              ].join(" ")}
            >
              <ProfileTrustBadges
                profile={profile}
                compact
                overlay
              />
            </div>
          )}

          {/* =================================================
              Open Profile
              ================================================= */}

          <span className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/25 text-white shadow-sm backdrop-blur-xl transition-all duration-300 group-hover:bg-white group-hover:text-[#0B2D5C]">
            <ArrowUpRight
              size={17}
              strokeWidth={2.3}
            />
          </span>

          {/* =================================================
              Compatibility Badge
              ================================================= */}

          {compatibilityScore !== null && (
            <div className="absolute right-3 top-14 z-20">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/40 bg-[#0B2D5C]/90 px-3 py-1.5 text-white shadow-lg backdrop-blur-xl">
                <Sparkles
                  size={13}
                  className="text-[#F7D66D]"
                />

                <span className="text-xs font-black">
                  {compatibilityScore}%
                  Match
                </span>
              </div>
            </div>
          )}

          {/* =================================================
              Profile Identity
              ================================================= */}

          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-16">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black tracking-[-0.025em] text-white drop-shadow-sm">
                  {displayName}
                </h2>

                {basicDetails && (
                  <p className="mt-1 truncate text-xs font-semibold text-white/85 sm:text-sm">
                    {basicDetails}
                  </p>
                )}
              </div>

              {completionPercentage ===
                100 && (
                <span
                  title="Profile complete"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200/30 bg-amber-300/15 text-amber-200 backdrop-blur-md"
                >
                  <Sparkles
                    size={15}
                    strokeWidth={2.3}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* =====================================================
          Profile Information
          ===================================================== */}

      <div
        className={[
          "relative flex flex-1 flex-col",

          highlightedProfile
            ? "bg-gradient-to-b from-amber-50/30 via-white to-white"
            : "",
        ].join(" ")}
      >
        <Link
          href={`/browse/${profile.id}`}
          className="block flex-1"
        >
          <div className="space-y-4 px-4 pb-4 pt-4">

            {/* =================================================
                Highlight Summary
                ================================================= */}

            {highlightedProfile && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/90 via-white to-yellow-50/70 px-3 py-2.5">
                <Sparkles
                  size={14}
                  className="shrink-0 text-amber-600"
                />

                <p className="text-[11px] font-extrabold text-[#0B2D5C]">
                  Premium highlighted profile
                </p>
              </div>
            )}

            {/* =================================================
                Core Details
                ================================================= */}

            <div className="space-y-2.5">
              <ProfileDetail
                icon={
                  <BriefcaseBusiness
                    size={16}
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
                    size={16}
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
                    size={16}
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
                    size={16}
                  />
                }
                value={
                  location ||
                  "Location not specified"
                }
              />
            </div>

            {/* =================================================
                Compatibility
                ================================================= */}

            {compatibilityScore !== null && (
              <CompatibilitySummary
                score={
                  compatibilityScore
                }
                ageScore={
                  profile.compatibilityAgeScore
                }
                denominationScore={
                  profile.compatibilityDenominationScore
                }
                educationScore={
                  profile.compatibilityEducationScore
                }
              />
            )}

            {/* =================================================
                Profile Completion
                ================================================= */}

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-3.5 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                    Profile completion
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[11px] font-black",

                    completionPercentage >=
                    90
                      ? "bg-emerald-50 text-emerald-700"
                      : completionPercentage >=
                          60
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700",
                  ].join(" ")}
                >
                  {
                    completionPercentage
                  }
                  %
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] via-blue-600 to-indigo-500 transition-all duration-500"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Link>

        {/* =====================================================
            Actions
            ===================================================== */}

        <div
          className={[
            "mt-auto border-t p-3.5",

            highlightedProfile
              ? "border-amber-100 bg-gradient-to-r from-amber-50/50 via-white to-blue-50/35"
              : "border-slate-100 bg-gradient-to-r from-white via-white to-blue-50/35",
          ].join(" ")}
        >
          <div className="grid gap-2.5">
            <InterestButton
              receiverProfileId={
                profile.id
              }
              memberName={
                displayName
              }
              message={`Hello ${displayName}, I am interested in connecting with you through Holy Matrimony.`}
            />

            <Link
              href={`/browse/${profile.id}`}
              className="group/view inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-[#0B2D5C] transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              View full profile

              <ArrowUpRight
                size={15}
                strokeWidth={2.4}
                className="transition-transform duration-200 group-hover/view:translate-x-0.5 group-hover/view:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/*
 * ============================================================
 * Compatibility Summary
 * ============================================================
 */

interface CompatibilitySummaryProps {
  score: number;
  ageScore: number | null;
  denominationScore: number | null;
  educationScore: number | null;
}

function CompatibilitySummary({
  score,
  ageScore,
  denominationScore,
  educationScore,
}: CompatibilitySummaryProps) {
  const label =
    score >= 85
      ? "Excellent Match"
      : score >= 65
        ? "Strong Match"
        : score >= 40
          ? "Good Potential"
          : "Explore Match";

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-blue-50/50">
      <div className="flex items-center justify-between gap-3 px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-[#F7D66D] shadow-sm">
            <Sparkles
              size={15}
            />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
              Compatibility
            </p>

            <p className="truncate text-xs font-black text-[#0B2D5C]">
              {label}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-lg font-black tracking-tight text-[#0B2D5C]">
          {score}%
        </span>
      </div>

      <div className="grid grid-cols-3 border-t border-amber-100/70 bg-white/70">
        <CompatibilityItem
          label="Age"
          matched={
            (ageScore ?? 0) > 0
          }
        />

        <CompatibilityItem
          label="Faith"
          matched={
            (denominationScore ?? 0) >
            0
          }
        />

        <CompatibilityItem
          label="Education"
          matched={
            (educationScore ?? 0) >
            0
          }
        />
      </div>
    </div>
  );
}

function CompatibilityItem({
  label,
  matched,
}: {
  label: string;
  matched: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-1 border-r border-slate-100 px-2 py-2.5 last:border-r-0">
      <CheckCircle2
        size={12}
        className={
          matched
            ? "text-emerald-600"
            : "text-slate-300"
        }
      />

      <span
        className={[
          "text-[10px] font-extrabold",

          matched
            ? "text-slate-600"
            : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

/*
 * ============================================================
 * Detail Row
 * ============================================================
 */

function ProfileDetail({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 text-[#0B2D5C] transition-colors duration-300 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:text-blue-700">
        {icon}
      </span>

      <p className="min-w-0 truncate text-[13px] font-semibold text-slate-600">
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * Basic Profile Summary
 * ============================================================
 */

function buildBasicDetails(
  profile: BrowseProfile
): string {
  return [
    profile.age
      ? `${profile.age} yrs`
      : null,

    profile.gender?.trim(),

    profile.maritalStatus?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");
}

/*
 * ============================================================
 * Church Summary
 * ============================================================
 */

function buildChurchDetails(
  profile: BrowseProfile
): string {
  const churchName =
    profile.churchName?.trim();

  const denomination =
    profile.denomination?.trim();

  if (
    churchName &&
    denomination
  ) {
    return `${churchName} • ${denomination}`;
  }

  return (
    churchName ||
    denomination ||
    ""
  );
}

/*
 * ============================================================
 * Location Summary
 * ============================================================
 */

function buildLocation(
  profile: BrowseProfile
): string {
  return [
    profile.city?.trim(),
    profile.state?.trim(),
    profile.country?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}
