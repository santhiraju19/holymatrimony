import {
  BadgeCheck,
  CheckCircle2,
  Church,
  Fingerprint,
  ShieldCheck,
  Smartphone,
  Sparkles,
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

function formatHeight(
  centimeters:
    | number
    | null
    | undefined
): string {
  if (
    centimeters === null ||
    centimeters === undefined ||
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

  return `${feet}' ${inches}" (${centimeters} cm)`;
}

function formatWeight(
  kilograms:
    | number
    | null
    | undefined
): string {
  if (
    kilograms === null ||
    kilograms === undefined ||
    !Number.isFinite(
      kilograms
    ) ||
    kilograms <= 0
  ) {
    return "";
  }

  return `${kilograms} kg`;
}

function formatFaithBackground(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "";
  }

  switch (value) {
    case "CHRISTIAN_BY_BIRTH":
      return "Christian by birth";

    case "CONVERTED_TO_CHRISTIANITY":
      return "Converted to Christianity";

    case "CHRISTIAN_FAMILY_BACKGROUND":
      return "Christian family background";

    case "PREFER_NOT_TO_SAY":
      return "Prefer not to say";

    default:
      return value;
  }
}

export default function ProfileDetailsContent({
  profile,
}: ProfileDetailsContentProps) {
  const hasCompatibility =
    profile.compatibilityScore !==
      null &&
    profile.compatibilityScore !==
      undefined;

  return (
    <div className="mt-5 space-y-5">

      {/* =====================================================
          Trust & Verification
          ===================================================== */}

      <TrustVerificationSection
        profile={profile}
      />

      {/* =====================================================
          Compatibility
          ===================================================== */}

      {hasCompatibility && (
        <CompatibilitySection
          profile={profile}
        />
      )}

      {/* =====================================================
          Profile Information
          ===================================================== */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* ===================================================
            Personal Information
            =================================================== */}

        <ProfileInfoSection
          title="Personal Information"
          description="Personal, physical and marital details"
          items={[
            {
              label: "Full name",
              value:
                profile.fullName,
            },

            {
              label: "Age",
              value:
                profile.age
                  ? `${profile.age} years`
                  : "",
            },

            {
              label:
                "Date of birth",
              value:
                formatDate(
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

            {
              label: "Height",
              value:
                formatHeight(
                  profile.heightCm
                ),
            },

            {
              label: "Weight",
              value:
                formatWeight(
                  profile.weightKg
                ),
            },

            {
              label:
                "Complexion / Skin tone",
              value:
                profile.complexion,
            },

            {
              label: "Body type",
              value:
                profile.bodyType,
            },

            {
              label:
                "Physical status",
              value:
                profile.physicalStatus,
            },

            {
              label:
                "Mother tongue",
              value:
                profile.motherTongue,
            },
          ]}
        />

        {/* ===================================================
            Religion & Community
            =================================================== */}

        <ProfileInfoSection
          title="Religion & Community"
          description="Religious identity and community background"
          items={[
            {
              label: "Religion",
              value:
                profile.religion,
            },

            {
              label:
                "Community / Caste",
              value:
                profile.community,
            },

            {
              label:
                "Sub-community",
              value:
                profile.subCommunity,
            },

            {
              label:
                "Faith background",
              value:
                formatFaithBackground(
                  profile.faithBackground
                ),
            },
          ]}
        />

        {/* ===================================================
            Church & Faith
            =================================================== */}

        <ProfileInfoSection
          title="Church & Faith"
          description="Church affiliation and spiritual background"
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
              label:
                "Pastor name",
              value:
                profile.pastorName,
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

        {/* ===================================================
            Education & Career
            =================================================== */}

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
                "Field of study",
              value:
                profile.educationField,
            },

            {
              label:
                "Profession",
              value:
                profile.profession,
            },

            {
              label:
                "Company / Organization",
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

        {/* ===================================================
            Lifestyle
            =================================================== */}

        <ProfileInfoSection
          title="Lifestyle"
          description="Daily lifestyle preferences and habits"
          items={[
            {
              label: "Diet",
              value:
                profile.diet,
            },

            {
              label: "Smoking",
              value:
                profile.smoking,
            },

            {
              label: "Drinking",
              value:
                profile.drinking,
            },
          ]}
        />

        {/* ===================================================
            Family
            =================================================== */}

        <ProfileInfoSection
          title="Family Background"
          description="Family structure and values"
          items={[
            {
              label:
                "Family type",
              value:
                profile.familyType,
            },

            {
              label:
                "Family values",
              value:
                profile.familyValues,
            },
          ]}
        />

        {/* ===================================================
            Location
            =================================================== */}

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

        {/* ===================================================
            About
            =================================================== */}

        <ProfileInfoSection
          title="About"
          description="A little more about this member"
          items={[
            {
              label: "About me",
              value:
                profile.aboutMe,
            },
          ]}
        />
      </div>
    </div>
  );
}

/* ============================================================
 * Compatibility
 * ============================================================
 */

interface CompatibilitySectionProps {
  profile: BrowseProfile;
}

function CompatibilitySection({
  profile,
}: CompatibilitySectionProps) {
  const score =
    Math.min(
      Math.max(
        profile.compatibilityScore ??
          0,
        0
      ),
      100
    );

  const ageScore =
    profile.compatibilityAgeScore ??
    0;

  const denominationScore =
    profile
      .compatibilityDenominationScore ??
    0;

  const educationScore =
    profile
      .compatibilityEducationScore ??
    0;

  const matchLabel =
    score >= 85
      ? "Excellent Match"
      : score >= 65
        ? "Strong Match"
        : score >= 40
          ? "Good Potential"
          : "Explore Match";

  const matchDescription =
    score >= 85
      ? "Your preferences align very closely with this profile."
      : score >= 65
        ? "Several important preferences align with this profile."
        : score >= 40
          ? "There are some meaningful areas of compatibility."
          : "Review the profile to explore your compatibility.";

  return (
    <section className="overflow-hidden rounded-[20px] border border-amber-200/70 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">

      <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50/90 via-white to-blue-50/80 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-[#F7D66D] shadow-sm">
              <Sparkles
                size={19}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-600">
                Match Compatibility
              </p>

              <h2 className="mt-0.5 text-base font-black text-[#0B2D5C]">
                {matchLabel}
              </h2>

              <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-500">
                {matchDescription}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black tracking-[-0.05em] text-[#0B2D5C]">
                {score}
              </span>

              <span className="pb-1 text-sm font-black text-slate-400">
                %
              </span>
            </div>

            <p className="mt-0.5 text-right text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              Overall Match
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#0B2D5C] transition-all duration-700"
              style={{
                width: `${score}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-3">
          <h3 className="text-xs font-black text-slate-800">
            Compatibility Breakdown
          </h3>

          <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
            Match points are calculated from mutual partner preferences.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <CompatibilityMetric
            title="Age Preference"
            description="Preferred age range"
            score={
              ageScore
            }
            maximum={40}
          />

          <CompatibilityMetric
            title="Faith & Denomination"
            description="Faith preference"
            score={
              denominationScore
            }
            maximum={35}
          />

          <CompatibilityMetric
            title="Education"
            description="Education preference"
            score={
              educationScore
            }
            maximum={25}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-start gap-2">
          <Sparkles
            size={12}
            className="mt-1 shrink-0 text-[#D4AF37]"
          />

          <p className="text-[10px] leading-5 text-slate-500 sm:text-[11px]">
            Compatibility is a preference-based guide designed to help you discover relevant profiles. It does not guarantee relationship suitability or marriage compatibility.
          </p>
        </div>
      </div>
    </section>
  );
}

interface CompatibilityMetricProps {
  title: string;
  description: string;
  score: number;
  maximum: number;
}

function CompatibilityMetric({
  title,
  description,
  score,
  maximum,
}: CompatibilityMetricProps) {
  const safeScore =
    Math.min(
      Math.max(
        score,
        0
      ),
      maximum
    );

  const percentage =
    maximum > 0
      ? Math.round(
          (
            safeScore /
            maximum
          ) *
            100
        )
      : 0;

  const matched =
    safeScore > 0;

  return (
    <div
      className={[
        "rounded-2xl border p-3.5 transition-colors",

        matched
          ? "border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/40"
          : "border-slate-200 bg-slate-50/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",

            matched
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-400",
          ].join(" ")}
        >
          <CheckCircle2
            size={16}
          />
        </div>

        <span
          className={[
            "rounded-full px-2 py-1 text-[10px] font-black",

            matched
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-500",
          ].join(" ")}
        >
          {safeScore}/{maximum}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={[
            "text-[10px] font-extrabold",

            matched
              ? "text-emerald-700"
              : "text-slate-400",
          ].join(" ")}
        >
          {matched
            ? "Preference matched"
            : "Not matched"}
        </span>

        <span className="text-[10px] font-black text-slate-500">
          {percentage}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={[
            "h-full rounded-full transition-all duration-700",

            matched
              ? "bg-gradient-to-r from-emerald-500 to-blue-600"
              : "bg-slate-300",
          ].join(" ")}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
 * Trust & Verification
 * ============================================================
 */

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
              Verification helps members connect with greater confidence.
            </p>
          </div>
        </div>

        <div
          className={[
            "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black",

            fullyVerified
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : verifiedCount > 0
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-500",
          ].join(" ")}
        >
          {fullyVerified && (
            <BadgeCheck
              size={13}
            />
          )}

          {fullyVerified
            ? "Fully Verified"
            : `${verifiedCount}/3 Verified`}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <VerificationItem
          icon={
            <Smartphone
              size={17}
            />
          }
          title="Mobile"
          description="Mobile number verified"
          verified={
            mobileVerified
          }
        />

        <VerificationItem
          icon={
            aadhaarVerified ? (
              <Fingerprint
                size={17}
              />
            ) : (
              <BadgeCheck
                size={17}
              />
            )
          }
          title={
            identityLabel
          }
          description={
            identityDescription
          }
          verified={
            identityVerified
          }
        />

        <VerificationItem
          icon={
            <Church
              size={17}
            />
          }
          title="Church"
          description="Church verification approved"
          verified={
            churchVerified
          }
        />
      </div>
    </section>
  );
}

interface VerificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  verified: boolean;
}

function VerificationItem({
  icon,
  title,
  description,
  verified,
}: VerificationItemProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-3.5",

        verified
          ? "border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/30"
          : "border-slate-200 bg-slate-50/80",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",

            verified
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-400",
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-black text-slate-800">
              {title}
            </p>

            {verified && (
              <CheckCircle2
                size={13}
                className="shrink-0 text-emerald-600"
              />
            )}
          </div>

          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            {verified
              ? description
              : "Not verified yet"}
          </p>
        </div>
      </div>

      <div
        className={[
          "mt-3 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em]",

          verified
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-200 text-slate-500",
        ].join(" ")}
      >
        {verified
          ? "Verified"
          : "Pending"}
      </div>
    </div>
  );
}