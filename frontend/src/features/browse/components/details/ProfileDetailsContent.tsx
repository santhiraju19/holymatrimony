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
  CompatibilityCategory,
  CompatibilityCategoryStatus,
} from "../../types";

import ProfileInfoSection from "./ProfileInfoSection";

interface ProfileDetailsContentProps {
  profile: BrowseProfile;
}

/*
 * ============================================================
 * Formatting Helpers
 * ============================================================
 */

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

/*
 * ============================================================
 * Main Content
 * ============================================================
 */

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

/*
 * ============================================================
 * Compatibility 2.0
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

  const categories =
    buildCompatibilityCategories(
      profile.compatibilityCategories,
      profile.compatibilityAgeScore,
      profile.compatibilityDenominationScore,
      profile.compatibilityEducationScore
    );

  const matchedCount =
    categories.filter(
      (category) =>
        category.status ===
        "MATCH"
    ).length;

  const mismatchCount =
    categories.filter(
      (category) =>
        category.status ===
        "MISMATCH"
    ).length;

  const flexibleCount =
    categories.filter(
      (category) =>
        category.status ===
        "FLEXIBLE"
    ).length;

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
      ? "Your mutual partner preferences align very closely with this profile."
      : score >= 65
        ? "Several important mutual preferences align with this profile."
        : score >= 40
          ? "There are some meaningful areas of preference compatibility."
          : "Review the profile and preferences to explore your compatibility.";

  return (
    <section className="overflow-hidden rounded-[20px] border border-amber-200/70 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">

      {/* =====================================================
          Header
          ===================================================== */}

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

      {/* =====================================================
          Summary
          ===================================================== */}

      {categories.length > 0 && (
        <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <CompatibilitySummaryBadge
              label="Matched"
              count={matchedCount}
              status="MATCH"
            />

            <CompatibilitySummaryBadge
              label="Flexible"
              count={flexibleCount}
              status="FLEXIBLE"
            />

            <CompatibilitySummaryBadge
              label="Different"
              count={mismatchCount}
              status="MISMATCH"
            />
          </div>
        </div>
      )}

      {/* =====================================================
          Full Category Breakdown
          ===================================================== */}

      <div className="p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-xs font-black text-slate-800">
            Compatibility Breakdown
          </h3>

          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Compatibility is calculated from mutual partner preferences. Flexible means neither side restricted that category.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map(
              (category) => (
                <CompatibilityMetric
                  key={
                    category.key
                  }
                  category={
                    category
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
            <p className="text-xs font-bold text-slate-500">
              Detailed compatibility information is not available yet.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          Disclaimer
          ===================================================== */}

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

/*
 * ============================================================
 * Compatibility Summary Badge
 * ============================================================
 */

interface CompatibilitySummaryBadgeProps {
  label: string;
  count: number;
  status: CompatibilityCategoryStatus;
}

function CompatibilitySummaryBadge({
  label,
  count,
  status,
}: CompatibilitySummaryBadgeProps) {
  const className =
    status === "MATCH"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "FLEXIBLE"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black",
        className,
      ].join(" ")}
    >
      {status === "MATCH" && (
        <CheckCircle2
          size={12}
        />
      )}

      {status === "FLEXIBLE" && (
        <Sparkles
          size={12}
        />
      )}

      {label}: {count}
    </span>
  );
}

/*
 * ============================================================
 * Compatibility Metric
 * ============================================================
 */

interface CompatibilityMetricProps {
  category: CompatibilityCategory;
}

function CompatibilityMetric({
  category,
}: CompatibilityMetricProps) {
  const matched =
    category.status ===
    "MATCH";

  const flexible =
    category.status ===
    "FLEXIBLE";

  const statusLabel =
    matched
      ? "Preference matched"
      : flexible
        ? "Flexible preference"
        : "Preference differs";

  const description =
    compatibilityDescription(
      category.key
    );

  return (
    <div
      className={[
        "rounded-2xl border p-3.5 transition-colors",

        matched
          ? "border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/40"
          : flexible
            ? "border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/40"
            : "border-slate-200 bg-slate-50/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",

            matched
              ? "bg-emerald-100 text-emerald-700"
              : flexible
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-400",
          ].join(" ")}
        >
          {flexible ? (
            <Sparkles
              size={16}
            />
          ) : (
            <CheckCircle2
              size={16}
            />
          )}
        </div>

        <span
          className={[
            "rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.06em]",

            matched
              ? "bg-emerald-100 text-emerald-700"
              : flexible
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-500",
          ].join(" ")}
        >
          {matched
            ? "Matched"
            : flexible
              ? "Flexible"
              : "Different"}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-xs font-black text-slate-800">
          {category.label}
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={[
            "text-[10px] font-extrabold",

            matched
              ? "text-emerald-700"
              : flexible
                ? "text-amber-700"
                : "text-slate-500",
          ].join(" ")}
        >
          {statusLabel}
        </span>

        {category.weight > 0 && (
          <span className="text-[9px] font-black text-slate-400">
            Weight {category.weight}
          </span>
        )}
      </div>
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
   * Legacy fallback.
   */

  const legacyCategories: CompatibilityCategory[] =
    [];

  if (
    ageScore !== null &&
    ageScore !== undefined
  ) {
    legacyCategories.push({
      key: "age",
      label: "Age Preference",
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
 * Compatibility Status Guard
 * ============================================================
 */

function isCompatibilityStatus(
  value: unknown
): value is CompatibilityCategoryStatus {
  return (
    value === "MATCH" ||
    value === "MISMATCH" ||
    value === "FLEXIBLE"
  );
}

/*
 * ============================================================
 * Compatibility Descriptions
 * ============================================================
 */

function compatibilityDescription(
  key: string
): string {
  switch (key) {
    case "age":
      return "Mutual preferred age ranges.";

    case "height":
      return "Mutual preferred height ranges.";

    case "religion":
      return "Religious preference alignment.";

    case "denomination":
      return "Christian denomination preferences.";

    case "maritalStatus":
      return "Preferred marital status.";

    case "community":
      return "Community preference alignment.";

    case "motherTongue":
      return "Preferred mother tongue.";

    case "education":
      return "Educational preference alignment.";

    case "profession":
      return "Professional preference alignment.";

    case "location":
      return "Preferred country, state, district and city.";

    case "diet":
      return "Dietary preference alignment.";

    case "smoking":
      return "Smoking preference alignment.";

    case "drinking":
      return "Drinking preference alignment.";

    default:
      return "Mutual partner preference alignment.";
  }
}

/*
 * ============================================================
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

/*
 * ============================================================
 * Verification Item
 * ============================================================
 */

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
