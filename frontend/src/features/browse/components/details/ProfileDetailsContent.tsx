import type {
  ReactNode,
} from "react";

import {
  BadgeCheck,
  CheckCircle2,
  Church,
  Fingerprint,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import type {
  BrowseProfile,
} from "../../types";

import ProfileInfoSection from "./ProfileInfoSection";

interface ProfileDetailsContentProps {
  profile: BrowseProfile;
}

function formatBoolean(
  value:
    | boolean
    | null
    | undefined
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
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

export default function ProfileDetailsContent({
  profile,
}: ProfileDetailsContentProps) {
  return (
    <div className="mt-5 space-y-5">
      <TrustVerificationSection
        profile={profile}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileInfoSection
          title="Basic Information"
          description="Personal and marital details"
          items={[
            {
              label: "Full name",
              value:
                profile.fullName,
            },
            {
              label: "Age",
              value: profile.age
                ? `${profile.age} years`
                : "",
            },
            {
              label:
                "Date of birth",
              value: formatDate(
                profile.dateOfBirth
              ),
            },
            {
              label: "Gender",
              value:
                profile.gender,
            },
            {
              label:
                "Marital status",
              value:
                profile.maritalStatus,
            },
          ]}
        />

        <ProfileInfoSection
          title="Church & Faith"
          description="Spiritual background and church details"
          items={[
            {
              label:
                "Denomination",
              value:
                profile.denomination,
            },
            {
              label:
                "Church name",
              value:
                profile.churchName,
            },
            {
              label: "Baptized",
              value:
                formatBoolean(
                  profile.baptized
                ),
            },
          ]}
        />

        <ProfileInfoSection
          title="Education & Career"
          description="Academic and professional information"
          items={[
            {
              label:
                "Highest education",
              value:
                profile.highestEducation,
            },
            {
              label:
                "Profession",
              value:
                profile.profession,
            },
            {
              label: "Company",
              value:
                profile.company,
            },
            {
              label:
                "Annual income",
              value:
                profile.annualIncome,
            },
          ]}
        />

        <ProfileInfoSection
          title="Location"
          description="Current residential information"
          items={[
            {
              label: "City",
              value:
                profile.city,
            },
            {
              label: "State",
              value:
                profile.state,
            },
            {
              label: "Country",
              value:
                profile.country,
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
    Boolean(
      profile.mobileVerified
    );

  const churchVerified =
    Boolean(
      profile.churchVerified
    );

  const aadhaarVerified =
    Boolean(
      profile.aadhaarVerified
    );

  const idVerified =
    Boolean(
      profile.idVerified
    );

  const identityVerified =
    aadhaarVerified ||
    idVerified ||
    Boolean(
      profile.identityVerified
    );

  const verifiedCount = [
    mobileVerified,
    identityVerified,
    churchVerified,
  ].filter(Boolean).length;

  const fullyVerified =
    verifiedCount === 3;

  const identityLabel =
    aadhaarVerified
      ? "Aadhaar"
      : idVerified
        ? "ID"
        : "Identity";

  const identityDescription =
    aadhaarVerified
      ? "Aadhaar document approved"
      : idVerified
        ? "Government ID approved"
        : "Identity document approved";

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">

      {/* =====================================================
          Compact Header
          ===================================================== */}

      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-sm">
            <ShieldCheck
              size={18}
            />
          </div>

          <div>
            <h2 className="text-sm font-black text-[#0B2D5C] sm:text-base">
              Trust & Verification
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
              Verification checks completed through Holy Matrimony.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black text-[#0B2D5C]">
            {verifiedCount}/3 Verified
          </span>

          {fullyVerified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
              <BadgeCheck
                size={12}
              />

              Fully Verified
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          Verification Credentials
          ===================================================== */}

      <div className="p-4 sm:p-5">
        <div className="grid gap-2.5 md:grid-cols-3">
          <VerificationStatus
            icon={
              <Smartphone
                size={17}
              />
            }
            label="Mobile"
            verified={
              mobileVerified
            }
            description="Mobile number verified"
          />

          <VerificationStatus
            icon={
              aadhaarVerified ? (
                <ShieldCheck
                  size={17}
                />
              ) : (
                <Fingerprint
                  size={17}
                />
              )
            }
            label={
              identityLabel
            }
            verified={
              identityVerified
            }
            description={
              identityDescription
            }
            variant={
              aadhaarVerified
                ? "aadhaar"
                : "identity"
            }
          />

          <VerificationStatus
            icon={
              <Church
                size={17}
              />
            }
            label="Church"
            verified={
              churchVerified
            }
            description="Church information approved"
            variant="church"
          />
        </div>

        {/* Progress / summary */}
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={16}
              className={
                fullyVerified
                  ? "shrink-0 text-emerald-600"
                  : "shrink-0 text-blue-600"
              }
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-slate-700">
                  {fullyVerified
                    ? "All verification checks completed"
                    : "Verification progress"}
                </p>

                <span className="text-[10px] font-black text-[#0B2D5C]">
                  {Math.round(
                    (verifiedCount /
                      3) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] via-blue-600 to-emerald-500 transition-all duration-300"
                  style={{
                    width: `${
                      (verifiedCount /
                        3) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[10px] leading-5 text-slate-400 sm:text-[11px]">
          Verification indicates checks completed through Holy
          Matrimony. Members should still communicate carefully
          and make independent decisions before proceeding.
        </p>
      </div>
    </section>
  );
}

type VerificationStatusVariant =
  | "default"
  | "aadhaar"
  | "identity"
  | "church";

interface VerificationStatusProps {
  icon: ReactNode;
  label: string;
  verified: boolean;
  description?: string;
  variant?: VerificationStatusVariant;
}

function VerificationStatus({
  icon,
  label,
  verified,
  description,
  variant = "default",
}: VerificationStatusProps) {
  const cardStyles: Record<
    VerificationStatusVariant,
    string
  > = {
    default:
      "border-emerald-200 bg-emerald-50/60",

    aadhaar:
      "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50/70",

    identity:
      "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/60",

    church:
      "border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50/60",
  };

  const iconStyles: Record<
    VerificationStatusVariant,
    string
  > = {
    default:
      "bg-emerald-100 text-emerald-700",

    aadhaar:
      "bg-gradient-to-br from-amber-400 to-yellow-500 text-[#0B2D5C]",

    identity:
      "bg-gradient-to-br from-blue-600 to-indigo-600 text-white",

    church:
      "bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white",
  };

  return (
    <div
      className={[
        "flex min-h-[72px] items-center gap-3 rounded-xl border px-3 py-2.5 transition",
        verified
          ? cardStyles[
              variant
            ]
          : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
          verified
            ? iconStyles[
                variant
              ]
            : "bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-black text-slate-800 sm:text-sm">
            {label}
          </p>

          {verified && (
            <BadgeCheck
              size={13}
              className="shrink-0 text-emerald-600"
            />
          )}
        </div>

        <p
          className={[
            "mt-0.5 text-[10px] font-bold",
            verified
              ? "text-emerald-700"
              : "text-slate-400",
          ].join(" ")}
        >
          {verified
            ? "Verified"
            : "Not verified"}
        </p>

        {verified &&
          description && (
            <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-[10px]">
              {description}
            </p>
          )}
      </div>
    </div>
  );
}
