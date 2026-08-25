"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  GraduationCap,
  Languages,
  MapPin,
  Rocket,
  Ruler,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";

import PremiumVerifiedBadge from "@/features/browse/components/PremiumVerifiedBadge";
import ProfileTrustBadges from "@/features/browse/components/ProfileTrustBadges";

import InterestButton from "@/features/interests/components/InterestButton";

import type {
  BrowseProfile,
  CompatibilityCategory,
  CompatibilityCategoryStatus,
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

  const faithDetails =
    buildFaithDetails(
      profile
    );

  const basicDetails =
    buildBasicDetails(
      profile
    );

  const languageCommunityDetails =
    buildLanguageCommunityDetails(
      profile
    );

  const educationDetails =
    buildEducationDetails(
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

  const boostedProfile =
    Boolean(
      profile.boostedProfile
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

    boostedProfile
      ? "border-violet-300/90 shadow-[0_16px_42px_rgba(124,58,237,0.18)] hover:border-violet-400 hover:shadow-[0_24px_60px_rgba(124,58,237,0.25)]"
      : highlightedProfile
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
          Premium / Boost Frame
          ===================================================== */}

      {(highlightedProfile ||
        boostedProfile) && (
        <>
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-0 z-30 rounded-[24px] ring-1 ring-inset",

              boostedProfile
                ? "ring-violet-300/60"
                : "ring-amber-300/50",
            ].join(" ")}
          />

          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute -right-16 -top-16 z-0 h-40 w-40 rounded-full blur-3xl",

              boostedProfile
                ? "bg-violet-200/30"
                : "bg-amber-200/25",
            ].join(" ")}
          />
        </>
      )}

      {/* =====================================================
          Top Accent
          ===================================================== */}

      <div
        aria-hidden="true"
        className={[
          "absolute inset-x-10 top-0 z-40 h-[2px] bg-gradient-to-r from-transparent to-transparent transition-opacity duration-300",

          boostedProfile
            ? "via-violet-500 opacity-100"
            : highlightedProfile
              ? "via-[#D4AF37] opacity-100"
              : "via-[#D4AF37] opacity-0 group-hover:opacity-100",
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
              Primary Promotion Badge
              ================================================= */}

          {boostedProfile ? (
            <div className="absolute left-3 top-3 z-30">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-gradient-to-r from-violet-700/95 to-indigo-700/95 px-3 py-1.5 text-white shadow-lg backdrop-blur-xl">
                <Rocket
                  size={12}
                  strokeWidth={2.6}
                  className="text-violet-100"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.08em]">
                  Boosted
                </span>
              </div>
            </div>
          ) : highlightedProfile ? (
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
          ) : null}

          {/* =================================================
              Trust Badges
              ================================================= */}

          {hasTrustCredentials && (
            <div
              className={[
                "absolute left-3 z-20 max-w-[calc(100%-3.5rem)]",

                boostedProfile ||
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
                  {compatibilityScore}% Match
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

                {languageCommunityDetails && (
                  <p className="mt-1 truncate text-[11px] font-semibold text-white/75">
                    {languageCommunityDetails}
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

          boostedProfile
            ? "bg-gradient-to-b from-violet-50/35 via-white to-white"
            : highlightedProfile
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
                Platinum Verified
                ================================================= */}

            {profile.verifiedPremiumBadge && (
              <div className="flex items-center">
                <PremiumVerifiedBadge />
              </div>
            )}

            {/* =================================================
                Boost / Highlight Summary
                ================================================= */}

            {boostedProfile ? (
              <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-indigo-50/70 px-3 py-2.5">
                <Rocket
                  size={14}
                  className="shrink-0 text-violet-600"
                />

                <p className="text-[11px] font-extrabold text-[#0B2D5C]">
                  Profile boosted for higher visibility
                </p>
              </div>
            ) : highlightedProfile ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/90 via-white to-yellow-50/70 px-3 py-2.5">
                <Sparkles
                  size={14}
                  className="shrink-0 text-amber-600"
                />

                <p className="text-[11px] font-extrabold text-[#0B2D5C]">
                  Premium highlighted profile
                </p>
              </div>
            ) : null}

            {/* =================================================
                Match Snapshot
                ================================================= */}

            <div className="grid grid-cols-2 gap-2">
              <SnapshotItem
                icon={
                  <Ruler
                    size={14}
                  />
                }
                label="Height"
                value={
                  profile.heightCm
                    ? formatHeight(
                        profile.heightCm
                      )
                    : "Not specified"
                }
              />

              <SnapshotItem
                icon={
                  <Church
                    size={14}
                  />
                }
                label="Religion"
                value={
                  profile.religion?.trim() ||
                  "Not specified"
                }
              />

              <SnapshotItem
                icon={
                  <UsersRound
                    size={14}
                  />
                }
                label="Community"
                value={
                  profile.community?.trim() ||
                  "No preference"
                }
              />

              <SnapshotItem
                icon={
                  <Languages
                    size={14}
                  />
                }
                label="Mother Tongue"
                value={
                  profile.motherTongue?.trim() ||
                  "Not specified"
                }
              />
            </div>

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
                  educationDetails ||
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
                  faithDetails ||
                  "Faith information not specified"
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
                Compatibility 2.0
                ================================================= */}

            {compatibilityScore !== null && (
              <CompatibilitySummary
                score={
                  compatibilityScore
                }
                categories={
                  profile.compatibilityCategories
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

            boostedProfile
              ? "border-violet-100 bg-gradient-to-r from-violet-50/45 via-white to-blue-50/35"
              : highlightedProfile
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
 * Match Snapshot
 * ============================================================
 */

function SnapshotItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/40 px-2.5 py-2.5">
      <div className="flex items-center gap-1.5 text-[#0B2D5C]">
        {icon}

        <span className="truncate text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-[11px] font-extrabold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * Compatibility 2.0 Summary
 * ============================================================
 */

interface CompatibilitySummaryProps {
  score: number;

  categories:
    | CompatibilityCategory[]
    | null;

  /*
   * Legacy fallback.
   *
   * These remain until all deployed API responses are guaranteed
   * to contain Compatibility 2.0 categories.
   */
  ageScore: number | null;
  denominationScore: number | null;
  educationScore: number | null;
}

function CompatibilitySummary({
  score,
  categories,
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

  const normalizedCategories =
    buildCompatibilityCategories(
      categories,
      ageScore,
      denominationScore,
      educationScore
    );

  /*
   * Browse cards stay intentionally compact.
   *
   * Prioritize the categories most useful at a glance.
   * The complete 13-category explanation belongs on the
   * full profile page.
   */
  const visibleCategories =
    selectCardCompatibilityCategories(
      normalizedCategories
    );

  const matchedCount =
    normalizedCategories.filter(
      (category) =>
        category.status ===
        "MATCH"
    ).length;

  const mismatchCount =
    normalizedCategories.filter(
      (category) =>
        category.status ===
        "MISMATCH"
    ).length;

  const flexibleCount =
    normalizedCategories.filter(
      (category) =>
        category.status ===
        "FLEXIBLE"
    ).length;

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

            {normalizedCategories.length >
              0 && (
              <p className="mt-0.5 truncate text-[9px] font-bold text-slate-400">
                {matchedCount} matched
                {flexibleCount > 0
                  ? ` • ${flexibleCount} flexible`
                  : ""}
                {mismatchCount > 0
                  ? ` • ${mismatchCount} different`
                  : ""}
              </p>
            )}
          </div>
        </div>

        <span className="shrink-0 text-lg font-black tracking-tight text-[#0B2D5C]">
          {score}%
        </span>
      </div>

      {visibleCategories.length >
        0 && (
        <div className="grid grid-cols-2 border-t border-amber-100/70 bg-white/70">
          {visibleCategories.map(
            (category) => (
              <CompatibilityItem
                key={
                  category.key
                }
                label={
                  category.label
                }
                status={
                  category.status
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * Compatibility Category Normalization
 * ============================================================
 */

function buildCompatibilityCategories(
  categories:
    | CompatibilityCategory[]
    | null,
  ageScore: number | null,
  denominationScore: number | null,
  educationScore: number | null
): CompatibilityCategory[] {
  if (
    Array.isArray(categories) &&
    categories.length > 0
  ) {
    return categories
      .filter(
        (category) =>
          Boolean(
            category &&
              category.key &&
              category.label &&
              isCompatibilityStatus(
                category.status
              )
          )
      )
      .map(
        (category) => ({
          ...category,

          key:
            category.key.trim(),

          label:
            category.label.trim(),

          weight:
            Number.isFinite(
              category.weight
            )
              ? Math.max(
                  0,
                  category.weight
                )
              : 0,
        })
      );
  }

  /*
   * ========================================================
   * Legacy API fallback
   * ========================================================
   */

  const legacyCategories: CompatibilityCategory[] =
    [];

  if (
    ageScore !== null &&
    ageScore !== undefined
  ) {
    legacyCategories.push({
      key: "age",
      label: "Age",
      status:
        ageScore > 0
          ? "MATCH"
          : "MISMATCH",
      weight: 0,
    });
  }

  if (
    denominationScore !== null &&
    denominationScore !== undefined
  ) {
    legacyCategories.push({
      key: "denomination",
      label: "Denomination",
      status:
        denominationScore > 0
          ? "MATCH"
          : "MISMATCH",
      weight: 0,
    });
  }

  if (
    educationScore !== null &&
    educationScore !== undefined
  ) {
    legacyCategories.push({
      key: "education",
      label: "Education",
      status:
        educationScore > 0
          ? "MATCH"
          : "MISMATCH",
      weight: 0,
    });
  }

  return legacyCategories;
}

/*
 * ============================================================
 * Card Compatibility Priorities
 * ============================================================
 */

function selectCardCompatibilityCategories(
  categories: CompatibilityCategory[]
): CompatibilityCategory[] {
  const preferredKeys = [
    "age",
    "denomination",
    "location",
    "education",
  ];

  const selected: CompatibilityCategory[] =
    [];

  for (const key of preferredKeys) {
    const category =
      categories.find(
        (item) =>
          item.key === key
      );

    if (category) {
      selected.push(
        category
      );
    }
  }

  /*
   * Legacy responses may not contain all four preferred
   * categories. Fill any remaining spaces from available data.
   */

  if (selected.length < 4) {
    for (const category of categories) {
      if (
        selected.some(
          (item) =>
            item.key ===
            category.key
        )
      ) {
        continue;
      }

      selected.push(
        category
      );

      if (selected.length >= 4) {
        break;
      }
    }
  }

  return selected.slice(
    0,
    4
  );
}

/*
 * ============================================================
 * Compatibility Status Guard
 * ============================================================
 */

function isCompatibilityStatus(
  status: unknown
): status is CompatibilityCategoryStatus {
  return (
    status === "MATCH" ||
    status === "MISMATCH" ||
    status === "FLEXIBLE"
  );
}

/*
 * ============================================================
 * Compatibility Item
 * ============================================================
 */

function CompatibilityItem({
  label,
  status,
}: {
  label: string;
  status: CompatibilityCategoryStatus;
}) {
  const matched =
    status === "MATCH";

  const flexible =
    status === "FLEXIBLE";

  const statusLabel =
    matched
      ? "Matched"
      : flexible
        ? "Flexible"
        : "Different";

  return (
    <div className="min-w-0 border-b border-r border-slate-100 px-2 py-2.5 even:border-r-0">
      <div className="flex items-center justify-center gap-1">
        {flexible ? (
          <Sparkles
            size={12}
            className="shrink-0 text-amber-500"
          />
        ) : (
          <CheckCircle2
            size={12}
            className={
              matched
                ? "shrink-0 text-emerald-600"
                : "shrink-0 text-slate-300"
            }
          />
        )}

        <span
          className={[
            "truncate text-[10px] font-extrabold",

            matched
              ? "text-slate-600"
              : flexible
                ? "text-amber-700"
                : "text-slate-400",
          ].join(" ")}
        >
          {label}
        </span>
      </div>

      <p
        className={[
          "mt-0.5 text-center text-[8px] font-bold uppercase tracking-[0.05em]",

          matched
            ? "text-emerald-600"
            : flexible
              ? "text-amber-600"
              : "text-slate-400",
        ].join(" ")}
      >
        {statusLabel}
      </p>
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
 * Height Formatting
 * ============================================================
 */

function formatHeight(
  centimeters: number
): string {
  if (
    !Number.isFinite(
      centimeters
    ) ||
    centimeters <= 0
  ) {
    return "";
  }

  const totalInches =
    centimeters / 2.54;

  let feet =
    Math.floor(
      totalInches / 12
    );

  let inches =
    Math.round(
      totalInches -
        feet * 12
    );

  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  return `${feet}' ${inches}"`;
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

    profile.heightCm
      ? formatHeight(
          profile.heightCm
        )
      : null,

    profile.maritalStatus?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");
}

/*
 * ============================================================
 * Community / Language Summary
 * ============================================================
 */

function buildLanguageCommunityDetails(
  profile: BrowseProfile
): string {
  return [
    profile.religion?.trim(),
    profile.community?.trim(),
    profile.motherTongue?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");
}

/*
 * ============================================================
 * Faith Summary
 * ============================================================
 */

function buildFaithDetails(
  profile: BrowseProfile
): string {
  const denomination =
    profile.denomination?.trim();

  const churchName =
    profile.churchName?.trim();

  if (
    denomination &&
    churchName
  ) {
    return `${denomination} • ${churchName}`;
  }

  return (
    denomination ||
    churchName ||
    profile.religion?.trim() ||
    ""
  );
}

/*
 * ============================================================
 * Education Summary
 * ============================================================
 */

function buildEducationDetails(
  profile: BrowseProfile
): string {
  const education =
    profile.highestEducation?.trim();

  const field =
    profile.educationField?.trim();

  if (
    education &&
    field
  ) {
    return `${education} • ${field}`;
  }

  return (
    education ||
    field ||
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
