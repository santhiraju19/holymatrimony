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

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { useProfile } from "@/features/profile/context/useProfile";

interface ReviewProps {
  onBack: () => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

interface SummaryItemProps {
  label: string;
  value?: string | number | null;
}

interface ReviewSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  complete: boolean;
  children: React.ReactNode;
}

function displayValue(
  value?: string | number | null
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

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
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
        {displayValue(value)}
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
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-md">
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
            <CheckCircle2 size={15} />
          ) : (
            <Sparkles size={15} />
          )}

          {complete
            ? "Complete"
            : "Needs attention"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </Card>
  );
}

function hasText(
  value?: string | null
): boolean {
  return Boolean(
    value?.trim()
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
   * Section completion
   * =========================================================
   *
   * FINAL RULE:
   *
   * Every profile-information field is required.
   * Photos are the only optional profile item.
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
      locationInfo.city
    ) &&
    hasText(
      locationInfo.state
    ) &&
    hasText(
      locationInfo.country
    ) &&
    hasText(
      aboutInfo.aboutMe
    );

  const churchComplete =
    hasText(
      churchInfo.denomination
    ) &&
    hasText(
      churchInfo.churchName
    ) &&
    hasText(
      churchInfo.pastorName
    ) &&
    hasText(
      churchInfo.baptized
    ) &&
  
    hasText(
      churchInfo.churchAddress
    );

  const educationComplete =
    hasText(
      educationInfo.highestEducation
    ) &&
    hasText(
      educationInfo.profession
    ) &&
    hasText(
      educationInfo.company
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
      familyInfo.siblings
    ) &&
    hasText(
      familyInfo.familyLocation
    );

  const preferenceComplete =
    hasText(
      preferenceInfo.preferredAgeFrom
    ) &&
    hasText(
      preferenceInfo.preferredAgeTo
    ) &&
    hasText(
      preferenceInfo.preferredDenomination
    ) &&
    hasText(
      preferenceInfo.preferredEducation
    );

  /*
   * =========================================================
   * Exact 26-field completion
   * =========================================================
   *
   * This intentionally mirrors the backend
   * ProfileService completion rule.
   *
   * Photos are excluded.
   */

  const requiredFields = [
    // Basic
    hasText(
      basicInfo.mobile
    ),
    hasText(
      basicInfo.dateOfBirth
    ),
    hasText(
      basicInfo.gender
    ),
    hasText(
      basicInfo.maritalStatus
    ),

    // Current location
    hasText(
      locationInfo.city
    ),
    hasText(
      locationInfo.state
    ),
    hasText(
      locationInfo.country
    ),

    // About
    hasText(
      aboutInfo.aboutMe
    ),

    // Church
    hasText(
      churchInfo.denomination
    ),
    hasText(
      churchInfo.churchName
    ),
    hasText(
      churchInfo.pastorName
    ),
    hasText(
      churchInfo.baptized
    ),
    hasText(
      churchInfo.membershipId
    ),
    hasText(
      churchInfo.churchAddress
    ),

    // Education
    hasText(
      educationInfo.highestEducation
    ),
    hasText(
      educationInfo.profession
    ),
    hasText(
      educationInfo.company
    ),
    hasText(
      educationInfo.annualIncome
    ),

    // Family
    hasText(
      familyInfo.fatherName
    ),
    hasText(
      familyInfo.motherName
    ),
    hasText(
      familyInfo.siblings
    ),
    hasText(
      familyInfo.familyLocation
    ),

    // Preferences
    hasText(
      preferenceInfo.preferredAgeFrom
    ),
    hasText(
      preferenceInfo.preferredAgeTo
    ),
    hasText(
      preferenceInfo.preferredDenomination
    ),
    hasText(
      preferenceInfo.preferredEducation
    ),
  ];

  const completedFields =
    requiredFields.filter(
      Boolean
    ).length;

  const totalRequiredFields =
    requiredFields.length;

  const completionPercentage =
    Math.floor(
      (
        completedFields /
        totalRequiredFields
      ) *
        100
    );

  const profileInformationComplete =
    completedFields ===
    totalRequiredFields;

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
    <div className="space-y-6">
      {/* =====================================================
          Review completion summary
          ===================================================== */}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-lg sm:h-14 sm:w-14">
              <ShieldCheck
                size={27}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
                Step 7 of 7
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2D5C] sm:text-3xl">
                Review Your
                Profile
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Review all of your
                information before
                saving your Holy
                Matrimony profile.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-7 lg:p-10">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Required profile
                    information
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#0B2D5C] sm:text-3xl">
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
                  ].join(
                    " "
                  )}
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
                    All required
                    profile
                    information is
                    complete. Photos
                    are optional and
                    may be added
                    later.
                  </span>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  Complete all
                  required profile
                  information to
                  reach 100% and
                  become eligible
                  for profile
                  verification.
                </div>
              )}
            </div>

            <div
              className={[
                "flex h-24 w-24 items-center justify-center rounded-full border-8 text-xl font-bold shadow-inner",
                profileInformationComplete
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-amber-100 bg-amber-50 text-amber-700",
              ].join(
                " "
              )}
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
          Basic Information
          ===================================================== */}

      <ReviewSection
        title="Basic Information"
        description="Your personal details, current location and profile introduction."
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
          Church Information
          ===================================================== */}

      <ReviewSection
        title="Church Information"
        description="Your church membership and spiritual background."
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
          label="Church Location"
          value={
            churchInfo.churchAddress
          }
        />
      </ReviewSection>

      {/* =====================================================
          Education & Career
          ===================================================== */}

      <ReviewSection
        title="Education & Career"
        description="Your education, profession and employment information."
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
        description="Your family information and family home location."
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
          label="Family Location"
          value={
            familyInfo.familyLocation
          }
        />
      </ReviewSection>

      {/* =====================================================
          Preferences
          ===================================================== */}

      <ReviewSection
        title="Partner Preferences"
        description="The preferences used to help find compatible matches."
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
          label="Preferred Denomination"
          value={
            preferenceInfo.preferredDenomination
          }
        />

        <SummaryItem
          label="Preferred Education"
          value={
            preferenceInfo.preferredEducation
          }
        />
      </ReviewSection>

      {/* =====================================================
          Photos — OPTIONAL
          ===================================================== */}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-md">
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
                Photos are not
                required for
                profile completion
                or verification.
              </p>
            </div>
          </div>

          <div
            className={[
              "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold",
              photoInfo.photos
                .length > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600",
            ].join(
              " "
            )}
          >
            {photoInfo.photos
              .length > 0 ? (
              <CheckCircle2
                size={15}
              />
            ) : (
              <Camera
                size={15}
              />
            )}

            {photoInfo.photos
              .length > 0
              ? `${photoInfo.photos.length} uploaded`
              : "Skipped for now"}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Recommendation */}

          <div className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-amber-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <Sparkles
                size={20}
                className="mt-0.5 shrink-0 text-[#B38B19]"
              />

              <div>
                <p className="text-sm font-bold text-[#0B2D5C]">
                  Photos are
                  strongly
                  recommended
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Adding clear,
                  recent photos can
                  help your profile
                  attract more
                  attention and
                  relevant match
                  interest. You can
                  also upload or
                  update photos
                  later.
                </p>
              </div>
            </div>
          </div>

          {primaryPhoto ? (
            <div className="grid gap-5 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-md">
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
                  Primary photo
                  selected
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your primary
                  photo will appear
                  first when other
                  members view your
                  profile.
                </p>

                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  Great — your
                  profile includes
                  a photo.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <Camera
                size={38}
                className="mx-auto text-slate-300"
              />

              <h4 className="mt-3 font-bold text-slate-700">
                No photo added yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You can complete,
                save and submit
                your profile for
                verification
                without a photo.
                We recommend adding
                one later to
                improve profile
                visibility and help
                potential matches
                know you better.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* =====================================================
          Final readiness
          ===================================================== */}

      <Card
        className={[
          "overflow-hidden p-5 sm:p-7",
          profileInformationComplete
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50"
            : "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50",
        ].join(" ")}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg",
                profileInformationComplete
                  ? "bg-emerald-600"
                  : "bg-amber-500",
              ].join(
                " "
              )}
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
              <h3 className="text-xl font-bold text-[#0B2D5C]">
                {profileInformationComplete
                  ? "Your profile information is complete"
                  : "Your profile still needs information"}
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {profileInformationComplete
                  ? "All required profile information has been completed. Save your profile to keep the latest details. Photos remain optional."
                  : "Please return to the relevant steps and complete all required profile information. Photos are the only optional profile item."}
              </p>
            </div>
          </div>

          <div
            className={[
              "inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm ring-1",
              profileInformationComplete
                ? "text-emerald-700 ring-emerald-200"
                : "text-amber-700 ring-amber-200",
            ].join(
              " "
            )}
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

      <Card className="p-4 sm:p-6">
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