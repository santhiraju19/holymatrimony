"use client";

import {
  BookOpenCheck,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Church,
  Heart,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";

import {
  useProfile,
} from "@/features/profile/context/useProfile";

import {
  calculateProfileCompletion,
} from "@/features/profile/utils/profileCompletion";

interface ReviewProps {
  onBack: () => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

interface SummaryItemProps {
  label: string;

  value?:
    | string
    | number
    | null;
}

interface ReviewSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  complete: boolean;
  children: React.ReactNode;
}

function displayValue(
  value?:
    | string
    | number
    | null
): string {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "Not provided";
  }

  return String(value);
}

function hasText(
  value?: string | null
): boolean {
  return Boolean(
    value?.trim()
  );
}

function formatHeight(
  value?: string
): string {
  if (!value?.trim()) {
    return "";
  }

  const cm =
    Number(value);

  if (
    !Number.isFinite(cm)
  ) {
    return value;
  }

  const totalInches =
    cm / 2.54;

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

  return `${feet}' ${inches}" (${cm} cm)`;
}

function formatFaithBackground(
  value?: string
): string {
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
      return value ?? "";
  }
}

function formatFaithCommitment(
  value?: string
): string {
  switch (value) {
    case "ANY":
      return "Any";

    case "PRACTICING_CHRISTIAN":
      return "Practicing Christian";

    case "REGULAR_CHURCH_ATTENDEE":
      return "Regular church attendee";

    case "BAPTIZED_CHRISTIAN":
      return "Baptized Christian";

    case "CHURCH_VERIFIED_PREFERRED":
      return "Church verified preferred";

    default:
      return value ?? "";
  }
}

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 break-words text-sm font-semibold sm:text-base",

          hasValue
            ? "text-slate-800"
            : "italic text-slate-400",
        ].join(" ")}
      >
        {displayValue(
          value
        )}
      </p>
    </div>
  );
}

function ReviewSection({
  title,
  description,
  icon,
  complete,
  children,
}: ReviewSectionProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-md">
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#0B2D5C]">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div
          className={[
            "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",

            complete
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          ].join(" ")}
        >
          {complete ? (
            <CheckCircle2
              size={15}
            />
          ) : (
            <Sparkles
              size={15}
            />
          )}

          {complete
            ? "Complete"
            : "Needs attention"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {children}
      </div>
    </Card>
  );
}

export default function Review({
  onBack,
  onSave,
  saving,
}: ReviewProps) {
  const {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    locationInfo,
    aboutInfo,
    photoInfo,
  } = useProfile();

  /*
   * =========================================================
   * Completion
   * =========================================================
   *
   * Uses the same 20-field core completion model as ProfileService.
   * Optional fields and photos do not block 100%.
   */

  const completion =
    calculateProfileCompletion({
      basicInfo,
      churchInfo,
      educationInfo,
      familyInfo,
      preferenceInfo,
      locationInfo,
      aboutInfo,
      photoInfo,
    });

  const {
    percentage:
      completionPercentage,

    completedFields,

    totalFields:
      totalRequiredFields,
  } = completion;

  const profileInformationComplete =
    completedFields ===
    totalRequiredFields;

  /*
   * =========================================================
   * Section status
   * =========================================================
   */

  const basicComplete =
    hasText(
      basicInfo.mobile
    ) &&
    hasText(
      basicInfo.dateOfBirth
    ) &&
    hasText(
      basicInfo.gender
    ) &&
    hasText(
      basicInfo.maritalStatus
    ) &&
    hasText(
      basicInfo.heightCm
    ) &&
    hasText(
      basicInfo.motherTongue
    ) &&
    hasText(
      basicInfo.religion
    ) &&
    hasText(
      locationInfo.country
    ) &&
    hasText(
      locationInfo.state
    ) &&
    hasText(
      locationInfo.city
    ) &&
    hasText(
      aboutInfo.aboutMe
    );

  /*
   * Church Information is optional.
   *
   * Denomination remains a core personal-profile field and is
   * counted by calculateProfileCompletion(), but the Church
   * section itself must never appear incomplete because optional
   * church details were left blank.
   */
  const churchComplete = true;

  const educationComplete =
    hasText(
      educationInfo.highestEducation
    ) &&
    hasText(
      educationInfo.educationField
    ) &&
    hasText(
      educationInfo.profession
    ) &&
    hasText(
      educationInfo.annualIncome
    );

  const familyComplete =
    hasText(
      familyInfo.fatherName
    ) &&
    hasText(
      familyInfo.motherName
    ) &&
    hasText(
      familyInfo.familyLocation
    ) &&
    hasText(
      familyInfo.familyType
    );

  /*
   * Partner Preferences are completely optional and therefore
   * never block profile completion or verification submission.
   */
  const preferenceComplete = true;

  const primaryPhoto =
    photoInfo.photos.find(
      (photo) =>
        photo.isPrimary
    ) ?? null;

  async function handleSubmit(): Promise<void> {
    if (saving) {
      return;
    }

    await onSave();
  }

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* =====================================================
          Completion Summary
          ===================================================== */}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-md">
              <ShieldCheck
                size={21}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
                Step 7 of 7
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0B2D5C] sm:text-2xl">
                Review Your Profile
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                Review your information before saving your Holy Matrimony profile.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 lg:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Core profile information
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#0B2D5C] sm:text-2xl">
                    {
                      completionPercentage
                    }
                    % complete
                  </p>
                </div>

                <p className="text-sm font-bold text-slate-500">
                  {
                    completedFields
                  }
                  /
                  {
                    totalRequiredFields
                  }
                </p>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500",

                    profileInformationComplete
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-r from-[#0B2D5C] to-blue-500",
                  ].join(" ")}
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>

              {profileInformationComplete ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    All required profile information is complete. Optional personal details and photos can still be added or changed later.
                  </span>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  Complete the remaining required fields to reach 100% profile completion.
                </div>
              )}
            </div>

            <div
              className={[
                "flex h-20 w-20 items-center justify-center rounded-full border-[6px] text-lg font-bold shadow-inner",

                profileInformationComplete
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-amber-100 bg-amber-50 text-amber-700",
              ].join(" ")}
            >
              {
                completionPercentage
              }
              %
            </div>
          </div>
        </div>
      </Card>

      {/* =====================================================
          Personal Information
          ===================================================== */}

      <ReviewSection
        title="Personal Information"
        description="Personal, physical, faith, community and lifestyle details."
        icon={
          <UserRound
            size={22}
          />
        }
        complete={
          basicComplete
        }
      >
        <SummaryItem
          label="Full Name"
          value={
            basicInfo.fullName
          }
        />

        <SummaryItem
          label="Email"
          value={
            basicInfo.email
          }
        />

        <SummaryItem
          label="Mobile"
          value={
            basicInfo.mobile
          }
        />

        <SummaryItem
          label="Date of Birth"
          value={
            basicInfo.dateOfBirth
          }
        />

        <SummaryItem
          label="Age"
          value={
            basicInfo.age
          }
        />

        <SummaryItem
          label="Gender"
          value={
            basicInfo.gender
          }
        />

        <SummaryItem
          label="Marital Status"
          value={
            basicInfo.maritalStatus
          }
        />

        <SummaryItem
          label="Height"
          value={
            formatHeight(
              basicInfo.heightCm
            )
          }
        />

        <SummaryItem
          label="Weight"
          value={
            basicInfo.weightKg
              ? `${basicInfo.weightKg} kg`
              : ""
          }
        />

        <SummaryItem
          label="Complexion / Skin Tone"
          value={
            basicInfo.complexion
          }
        />

        <SummaryItem
          label="Body Type"
          value={
            basicInfo.bodyType
          }
        />

        <SummaryItem
          label="Physical Status"
          value={
            basicInfo.physicalStatus
          }
        />

        <SummaryItem
          label="Mother Tongue"
          value={
            basicInfo.motherTongue
          }
        />

        <SummaryItem
          label="Religion"
          value={
            basicInfo.religion
          }
        />

        <SummaryItem
          label="Community / Caste"
          value={
            basicInfo.community
          }
        />

        <SummaryItem
          label="Sub-community"
          value={
            basicInfo.subCommunity
          }
        />

        <SummaryItem
          label="Faith Background"
          value={
            formatFaithBackground(
              basicInfo.faithBackground
            )
          }
        />

        <SummaryItem
          label="Diet"
          value={
            basicInfo.diet
          }
        />

        <SummaryItem
          label="Smoking"
          value={
            basicInfo.smoking
          }
        />

        <SummaryItem
          label="Drinking"
          value={
            basicInfo.drinking
          }
        />

        <SummaryItem
          label="Current Country"
          value={
            locationInfo.country
          }
        />

        <SummaryItem
          label="Current State"
          value={
            locationInfo.state
          }
        />

        <SummaryItem
          label="Current District"
          value={
            locationInfo.district
          }
        />

        <SummaryItem
          label="Current City"
          value={
            locationInfo.city
          }
        />

        <div className="sm:col-span-2">
          <SummaryItem
            label="About Me"
            value={
              aboutInfo.aboutMe
            }
          />
        </div>
      </ReviewSection>

      {/* =====================================================
          Church
          ===================================================== */}

      <ReviewSection
        title="Church Information"
        description="Your denomination, church and ministry information."
        icon={
          <Church
            size={22}
          />
        }
        complete={
          churchComplete
        }
      >
        <SummaryItem
          label="Church Name"
          value={
            churchInfo.churchName
          }
        />

        <SummaryItem
          label="Denomination"
          value={
            churchInfo.denomination
          }
        />

        <SummaryItem
          label="Pastor Name"
          value={
            churchInfo.pastorName
          }
        />

        <SummaryItem
          label="Baptized"
          value={
            churchInfo.baptized ===
            "true"
              ? "Yes"
              : churchInfo.baptized ===
                  "false"
                ? "No"
                : churchInfo.baptized ===
                    "rather-not-say"
                  ? "Rather not say"
                  : ""
          }
        />

        <SummaryItem
          label="Membership ID"
          value={
            churchInfo.membershipId
          }
        />

        <SummaryItem
          label="Church Country"
          value={
            churchInfo.churchCountry
          }
        />

        <SummaryItem
          label="Church State"
          value={
            churchInfo.churchState
          }
        />

        <SummaryItem
          label="Church District"
          value={
            churchInfo.churchDistrict
          }
        />

        <SummaryItem
          label="Church City"
          value={
            churchInfo.churchCity
          }
        />
      </ReviewSection>

      {/* =====================================================
          Education
          ===================================================== */}

      <ReviewSection
        title="Education & Career"
        description="Education, specialization and professional information."
        icon={
          <BriefcaseBusiness
            size={22}
          />
        }
        complete={
          educationComplete
        }
      >
        <SummaryItem
          label="Highest Education"
          value={
            educationInfo.highestEducation
          }
        />

        <SummaryItem
          label="Field of Study"
          value={
            educationInfo.educationField
          }
        />

        <SummaryItem
          label="Profession"
          value={
            educationInfo.profession
          }
        />

        <SummaryItem
          label="Company / Organization"
          value={
            educationInfo.company
          }
        />

        <SummaryItem
          label="Annual Income"
          value={
            educationInfo.annualIncome
          }
        />
      </ReviewSection>

      {/* =====================================================
          Family
          ===================================================== */}

      <ReviewSection
        title="Family Details"
        description="Family background, structure, values and location."
        icon={
          <UsersRound
            size={22}
          />
        }
        complete={
          familyComplete
        }
      >
        <SummaryItem
          label="Father's Name"
          value={
            familyInfo.fatherName
          }
        />

        <SummaryItem
          label="Mother's Name"
          value={
            familyInfo.motherName
          }
        />

        <SummaryItem
          label="Number of Siblings"
          value={
            familyInfo.siblings
          }
        />

        <SummaryItem
          label="Family Type"
          value={
            familyInfo.familyType
          }
        />

        <SummaryItem
          label="Family Values"
          value={
            familyInfo.familyValues
          }
        />

        <SummaryItem
          label="Family Country"
          value={
            familyInfo.familyCountry
          }
        />

        <SummaryItem
          label="Family State"
          value={
            familyInfo.familyState
          }
        />

        <SummaryItem
          label="Family District"
          value={
            familyInfo.familyDistrict
          }
        />

        <SummaryItem
          label="Family City"
          value={
            familyInfo.familyCity
          }
        />
      </ReviewSection>

      {/* =====================================================
          Preferences
          ===================================================== */}

      <ReviewSection
        title="Partner Preferences"
        description="Preferences used to rank compatible profiles."
        icon={
          <Heart
            size={22}
          />
        }
        complete={
          preferenceComplete
        }
      >
        <SummaryItem
          label="Preferred Age"
          value={
            preferenceInfo
              .preferredAgeFrom &&
            preferenceInfo
              .preferredAgeTo
              ? `${preferenceInfo.preferredAgeFrom} – ${preferenceInfo.preferredAgeTo}`
              : ""
          }
        />

        <SummaryItem
          label="Preferred Height"
          value={
            preferenceInfo
              .preferredHeightFromCm &&
            preferenceInfo
              .preferredHeightToCm
              ? `${formatHeight(
                  preferenceInfo.preferredHeightFromCm
                )} – ${formatHeight(
                  preferenceInfo.preferredHeightToCm
                )}`
              : ""
          }
        />

        <SummaryItem
          label="Preferred Religion"
          value={
            preferenceInfo.preferredReligion
          }
        />

        <SummaryItem
          label="Preferred Denomination"
          value={
            preferenceInfo.preferredDenomination
          }
        />

        <SummaryItem
          label="Preferred Marital Status"
          value={
            preferenceInfo.preferredMaritalStatus
          }
        />

        <SummaryItem
          label="Community Preference"
          value={
            preferenceInfo.communityNoBar
              ? "Community No Bar"
              : preferenceInfo.preferredCommunity
          }
        />

        <SummaryItem
          label="Preferred Mother Tongue"
          value={
            preferenceInfo.preferredMotherTongue
          }
        />

        <SummaryItem
          label="Preferred Education"
          value={
            preferenceInfo.preferredEducation
          }
        />

        <SummaryItem
          label="Preferred Profession"
          value={
            preferenceInfo.preferredProfession
          }
        />

        <SummaryItem
          label="Preferred Locations"
          value={
            preferenceInfo.preferredLocations.length > 0
              ? preferenceInfo.preferredLocations
                  .map((location) =>
                    [
                      location.city,
                      location.district,
                      location.state,
                      location.country,
                    ]
                      .map((value) =>
                        value.trim()
                      )
                      .filter(Boolean)
                      .join(", ")
                  )
                  .filter(Boolean)
                  .join(" • ")
              : [
                  preferenceInfo.preferredCity,
                  preferenceInfo.preferredDistrict,
                  preferenceInfo.preferredState,
                  preferenceInfo.preferredCountry,
                ]
                  .map((value) =>
                    value.trim()
                  )
                  .filter(Boolean)
                  .join(", ")
          }
        />

        <SummaryItem
          label="Preferred Diet"
          value={
            preferenceInfo.preferredDiet
          }
        />

        <SummaryItem
          label="Preferred Smoking"
          value={
            preferenceInfo.preferredSmoking
          }
        />

        <SummaryItem
          label="Preferred Drinking"
          value={
            preferenceInfo.preferredDrinking
          }
        />

        <SummaryItem
          label="Faith Commitment"
          value={
            formatFaithCommitment(
              preferenceInfo.preferredFaithCommitment
            )
          }
        />
      </ReviewSection>

      {/* =====================================================
          Photos
          ===================================================== */}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-md">
              <Camera
                size={22}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-[#0B2D5C]">
                  Profile Photos
                </h3>

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                  Optional
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Photos improve profile visibility but do not affect profile completion.
              </p>
            </div>
          </div>

          <div
            className={[
              "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",

              photoInfo.photos.length > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {photoInfo.photos.length >
            0 ? (
              <CheckCircle2
                size={15}
              />
            ) : (
              <Camera
                size={15}
              />
            )}

            {photoInfo.photos.length >
            0
              ? `${photoInfo.photos.length} uploaded`
              : "Skipped for now"}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {primaryPhoto ? (
            <div className="grid gap-4 sm:grid-cols-[105px_1fr] sm:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-md">
                <img
                  src={
                    primaryPhoto.preview
                  }
                  alt="Primary profile"
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-2 top-2 rounded-full bg-[#0B2D5C] px-2.5 py-1 text-xs font-bold text-white">
                  Primary
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0B2D5C]">
                  Primary photo selected
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This photo will appear first when other members view your profile.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <Camera
                size={38}
                className="mx-auto text-slate-300"
              />

              <h4 className="mt-3 font-bold text-slate-700">
                No photo added yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You can save and complete your profile without a photo. Adding one later is strongly recommended.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* =====================================================
          Readiness
          ===================================================== */}

      <Card
        className={[
          "overflow-hidden p-4 sm:p-5",

          profileInformationComplete
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50"
            : "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md",

                profileInformationComplete
                  ? "bg-emerald-600"
                  : "bg-amber-500",
              ].join(" ")}
            >
              {profileInformationComplete ? (
                <BookOpenCheck
                  size={25}
                />
              ) : (
                <Sparkles
                  size={25}
                />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2D5C]">
                {profileInformationComplete
                  ? "Your core profile information is complete"
                  : "Your profile still needs information"}
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {profileInformationComplete
                  ? "All 30 core profile fields are complete. Optional community, lifestyle, appearance and photo information can still be changed anytime."
                  : "Return to the relevant steps and complete the remaining required fields. Optional fields and photos do not prevent 100% completion."}
              </p>
            </div>
          </div>

          <div
            className={[
              "inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm ring-1",

              profileInformationComplete
                ? "text-emerald-700 ring-emerald-200"
                : "text-amber-700 ring-amber-200",
            ].join(" ")}
          >
            <ShieldCheck
              size={17}
            />

            {profileInformationComplete
              ? "Ready to save"
              : `${completedFields}/${totalRequiredFields} fields complete`}
          </div>
        </div>
      </Card>

      {/* =====================================================
          Navigation
          ===================================================== */}

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="sm:w-auto"
            onClick={
              onBack
            }
            disabled={
              saving
            }
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            fullWidth
            className="sm:w-auto"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={
              saving
            }
            leftIcon={
              saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <ShieldCheck
                  size={18}
                />
              )
            }
          >
            {saving
              ? "Saving Profile..."
              : "Save My Profile"}
          </Button>
        </div>
      </Card>
    </div>
  );
}