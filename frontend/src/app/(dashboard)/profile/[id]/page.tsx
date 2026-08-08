"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  GraduationCap,
  Loader2,
  MapPin,
  UserRound,
} from "lucide-react";

import Card from "@/components/ui/Card";

import InterestButton from "@/features/interests/components/InterestButton";
import {
  getBrowseProfileById,
} from "@/features/browse/api/browseApi";
import type {
  BrowseProfile,
} from "@/features/browse/types";
import {
  resolveBrowsePhotoUrl,
} from "@/features/browse/utils/photoUrl";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function MemberProfilePage() {
  const params = useParams<{
    id: string;
  }>();

  const profileId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [profile, setProfile] =
    useState<BrowseProfile | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile(): Promise<void> {
      if (!profileId.trim()) {
        setError(
          "A valid profile ID is required."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await getBrowseProfileById(
            profileId
          );

        if (active) {
          setProfile(result);
        }
      } catch (caughtError: unknown) {
        if (active) {
          setProfile(null);
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to load this profile."
            )
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <h2 className="text-2xl font-bold text-[#0B2D5C]">
            Profile Not Found
          </h2>

          <p className="mt-2 text-slate-500">
            {error ??
              "The requested member profile could not be found."}
          </p>

          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B2D5C] px-5 py-3 font-semibold text-white transition hover:bg-[#123C73]"
          >
            <ArrowLeft size={18} />
            Back to profiles
          </Link>
        </Card>
      </div>
    );
  }

  const displayName =
    profile.fullName?.trim() ||
    "Holy Matrimony Member";

  const photoUrl =
    resolveBrowsePhotoUrl(
      profile.primaryPhotoUrl
    );

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
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
      >
        <ArrowLeft size={18} />
        Back to profiles
      </Link>

      <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={`${displayName} profile photo`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 380px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <UserRound
                    size={96}
                    strokeWidth={1.3}
                    className="text-blue-300"
                  />
                </div>
              )}

              {profile.profileCompleted && (
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-blue-700 shadow">
                  <CheckCircle2
                    size={18}
                  />
                  Completed
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                Profile completion
              </span>

              <span className="font-bold text-blue-700">
                {completionPercentage}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </Card>

          <InterestButton
            receiverProfileId={
              profile.id
            }
            memberName={displayName}
            message={`Hello ${displayName}, I am interested in connecting with you through Holy Matrimony.`}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#0B2D5C] sm:text-4xl">
                  {displayName}
                </h1>

                <p className="mt-2 text-lg text-slate-500">
                  {buildHeadline(profile)}
                </p>
              </div>

              {profile.profileCompleted && (
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  <CheckCircle2
                    size={17}
                  />
                  Completed profile
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info
                label="Age"
                value={
                  profile.age &&
                  profile.age > 0
                    ? `${profile.age} Years`
                    : "Not specified"
                }
              />

              <Info
                label="Gender"
                value={
                  profile.gender?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Marital status"
                value={
                  profile.maritalStatus?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Education"
                value={
                  profile.highestEducation?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Profession"
                value={
                  profile.profession?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Company"
                value={
                  profile.company?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Annual income"
                value={
                  profile.annualIncome?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Location"
                value={
                  location ||
                  "Not specified"
                }
              />
            </div>
          </Card>

          <Card>
            <SectionHeading
              icon={<Church size={21} />}
              title="Church and Faith"
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info
                label="Church"
                value={
                  profile.churchName?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Denomination"
                value={
                  profile.denomination?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Faith details"
                value={
                  churchDetails ||
                  "Not specified"
                }
              />

              <Info
                label="Baptized"
                value={
                  profile.baptized === true
                    ? "Yes"
                    : profile.baptized ===
                        false
                      ? "No"
                      : "Not specified"
                }
              />
            </div>
          </Card>

          <Card>
            <SectionHeading
              icon={
                <BriefcaseBusiness
                  size={21}
                />
              }
              title="About"
            />

            <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
              {profile.aboutMe?.trim() ||
                "This member has not added an introduction yet."}
            </p>
          </Card>

          <Card>
            <SectionHeading
              icon={
                <GraduationCap size={21} />
              }
              title="Profile Summary"
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info
                label="Education"
                value={
                  profile.highestEducation?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Profession"
                value={
                  profile.profession?.trim() ||
                  "Not specified"
                }
              />

              <Info
                label="Location"
                value={
                  location ||
                  "Not specified"
                }
              />

              <Info
                label="Profile completion"
                value={`${completionPercentage}%`}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </span>

      <h2 className="text-xl font-bold text-[#0B2D5C]">
        {title}
      </h2>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div className="mt-1 font-semibold text-[#0B2D5C]">
        {value}
      </div>
    </div>
  );
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

function buildHeadline(
  profile: BrowseProfile
): string {
  const items = [
    profile.profession?.trim(),
    profile.age &&
    profile.age > 0
      ? `${profile.age} years`
      : "",
    profile.city?.trim(),
  ].filter(Boolean);

  return items.length > 0
    ? items.join(" • ")
    : "Holy Matrimony member";
}
