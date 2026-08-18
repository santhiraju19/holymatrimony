import {
  BadgeCheck,
  CheckCircle2,
  Church,
  Fingerprint,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import type { BrowseProfile } from "../../types";

import ProfileInfoSection from "./ProfileInfoSection";

interface ProfileDetailsContentProps {
  profile: BrowseProfile;
}

function formatBoolean(
  value: boolean | null | undefined
): string {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "";
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProfileDetailsContent({
  profile,
}: ProfileDetailsContentProps) {
  return (
    <div className="mt-8 space-y-6">
      <TrustVerificationSection
        profile={profile}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileInfoSection
          title="Basic information"
          description="Personal and marital details"
          items={[
            {
              label: "Full name",
              value: profile.fullName,
            },
            {
              label: "Age",
              value: profile.age
                ? `${profile.age} years`
                : "",
            },
            {
              label: "Date of birth",
              value: formatDate(
                profile.dateOfBirth
              ),
            },
            {
              label: "Gender",
              value: profile.gender,
            },
            {
              label: "Marital status",
              value: profile.maritalStatus,
            },
          ]}
        />

        <ProfileInfoSection
          title="Church and faith"
          description="Spiritual background and church details"
          items={[
            {
              label: "Denomination",
              value: profile.denomination,
            },
            {
              label: "Church name",
              value: profile.churchName,
            },
            {
              label: "Baptized",
              value: formatBoolean(
                profile.baptized
              ),
            },
          ]}
        />

        <ProfileInfoSection
          title="Education and career"
          description="Academic and professional information"
          items={[
            {
              label: "Highest education",
              value:
                profile.highestEducation,
            },
            {
              label: "Profession",
              value: profile.profession,
            },
            {
              label: "Company",
              value: profile.company,
            },
            {
              label: "Annual income",
              value: profile.annualIncome,
            },
          ]}
        />

        <ProfileInfoSection
          title="Location"
          description="Current residential information"
          items={[
            {
              label: "City",
              value: profile.city,
            },
            {
              label: "State",
              value: profile.state,
            },
            {
              label: "Country",
              value: profile.country,
            },
          ]}
        />
      </div>
    </div>
  );
}

interface TrustVerificationSectionProps {
  profile: BrowseProfile;
}

function TrustVerificationSection({
  profile,
}: TrustVerificationSectionProps) {
  const mobileVerified =
    Boolean(profile.mobileVerified);

  const churchVerified =
    Boolean(profile.churchVerified);

  const identityVerified =
    Boolean(profile.identityVerified);

  const verifiedCount = [
    mobileVerified,
    churchVerified,
    identityVerified,
  ].filter(Boolean).length;

  const fullyVerified =
    Boolean(profile.verifiedProfile) ||
    verifiedCount === 3;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-emerald-50 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-sm">
              <ShieldCheck
                size={22}
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#0B2D5C]">
                Trust & Verification
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Verification checks completed
                through Holy Matrimony.
              </p>
            </div>
          </div>

          {fullyVerified && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-black text-emerald-700">
              <BadgeCheck
                size={17}
              />
              Verified Profile
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <VerificationStatus
            icon={
              <Smartphone
                size={20}
              />
            }
            label="Mobile"
            verified={mobileVerified}
          />

          <VerificationStatus
            icon={
              <Church
                size={20}
              />
            }
            label="Church"
            verified={churchVerified}
          />

          <VerificationStatus
            icon={
              <Fingerprint
                size={20}
              />
            }
            label="Identity"
            verified={identityVerified}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
          {fullyVerified ? (
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-black text-slate-800">
                  All available verification checks completed
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  This member has completed
                  mobile, church and identity
                  verification through Holy
                  Matrimony.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black text-slate-800">
                  Verification progress
                </p>

                <span className="text-sm font-black text-[#0B2D5C]">
                  {verifiedCount}/3
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                This member has completed{" "}
                {verifiedCount} of 3 available
                verification checks.
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
                  style={{
                    width: `${
                      (verifiedCount / 3) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          Verification badges indicate checks
          completed through Holy Matrimony.
          Members should still communicate
          carefully and make independent
          decisions before proceeding.
        </p>
      </div>
    </section>
  );
}

interface VerificationStatusProps {
  icon: React.ReactNode;
  label: string;
  verified: boolean;
}

function VerificationStatus({
  icon,
  label,
  verified,
}: VerificationStatusProps) {
  return (
    <div
      className={
        verified
          ? "rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"
          : "rounded-2xl border border-slate-200 bg-slate-50 p-4"
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={
            verified
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500"
          }
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-800">
            {label} Verification
          </p>

          <div
            className={
              verified
                ? "mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700"
                : "mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"
            }
          >
            {verified && (
              <CheckCircle2
                size={14}
              />
            )}

            {verified
              ? "Verified"
              : "Not verified"}
          </div>
        </div>
      </div>
    </div>
  );
}
