"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  Heart,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import ProfileVerificationBadge from "@/features/admin/profiles/components/ProfileVerificationBadge";
import VerificationDecisionModal from "@/features/admin/profiles/components/VerificationDecisionModal";

import {
  getAdminProfile,
  updateAdminProfileVerification,
} from "@/features/admin/profiles/services/adminProfileService";

import type {
  AdminProfileDetail,
} from "@/features/admin/profiles/types/adminProfile";

type Decision =
  | "APPROVED"
  | "REJECTED";

function displayValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() ===
      ""
  ) {
    return "—";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  return String(value);
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString();
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | boolean
    | null
    | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {displayValue(
          value
        )}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon:
    React.ReactNode;
  children:
    React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2D5C] text-white">
          {icon}
        </div>

        <h2 className="text-lg font-black text-[#0B2D5C]">
          {title}
        </h2>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

export default function AdminProfileDetailPage() {
  const params =
    useParams();

  const rawId =
    params?.id;

  const profileId =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId;

  const [
    profile,
    setProfile,
  ] =
    useState<AdminProfileDetail | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    decision,
    setDecision,
  ] =
    useState<Decision | null>(
      null
    );

  const [
    updating,
    setUpdating,
  ] =
    useState(false);

  const [
    decisionError,
    setDecisionError,
  ] =
    useState<string | null>(
      null
    );

  const loadProfile =
    useCallback(
      async () => {
        if (
          !profileId ||
          typeof profileId !==
            "string"
        ) {
          setError(
            "Invalid profile ID."
          );

          setLoading(false);

          return;
        }

        setLoading(true);
        setError(null);

        try {
          const result =
            await getAdminProfile(
              profileId
            );

          setProfile(
            result
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load profile."
          );
        } finally {
          setLoading(false);
        }
      },
      [profileId]
    );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleDecision(
    reason?: string
  ): Promise<void> {
    if (
      !profile ||
      !decision
    ) {
      return;
    }

    setUpdating(true);
    setDecisionError(
      null
    );

    try {
      const updated =
        await updateAdminProfileVerification(
          profile.profileId,
          {
            status:
              decision,

            reason:
              reason ??
              null,
          }
        );

      setProfile(
        updated
      );

      setDecision(
        null
      );
    } catch (
      updateError
    ) {
      setDecisionError(
        updateError instanceof
          Error
          ? updateError.message
          : "Unable to update profile verification."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#0B2D5C]"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !profile
  ) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/profiles"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C]"
        >
          <ArrowLeft
            size={17}
          />

          Back to Profiles
        </Link>

        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="mt-0.5 text-red-600"
            />

            <div>
              <h2 className="font-black text-red-900">
                Profile could
                not be loaded
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error ||
                  "Unable to load this profile."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pending =
    profile.verificationStatus ===
    "PENDING";

  return (
    <div className="space-y-6 pb-10">
      <Link
        href="/admin/profiles"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C] transition hover:underline"
      >
        <ArrowLeft
          size={17}
        />

        Back to Profiles
      </Link>

      {/* Header */}

      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {profile.photos?.find(
                (photo) =>
                  photo.primaryPhoto
              ) ? (
                <img
                  src={
                    profile.photos.find(
                      (photo) =>
                        photo.primaryPhoto
                    )!
                      .imageUrl
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound
                  size={30}
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black">
                  {
                    profile.fullName
                  }
                </h1>

                <ProfileVerificationBadge
                  status={
                    profile.verificationStatus
                  }
                />
              </div>

              <p className="mt-2 text-sm text-blue-100">
                {
                  profile.email
                }
              </p>

              <p className="mt-2 text-xs text-blue-200">
                Submitted:{" "}
                {formatDate(
                  profile.verificationSubmittedAt
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {pending && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionError(
                      null
                    );

                    setDecision(
                      "REJECTED"
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  <XCircle
                    size={18}
                  />

                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionError(
                      null
                    );

                    setDecision(
                      "APPROVED"
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <CheckCircle2
                    size={18}
                  />

                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Completion */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Profile
              Completion
            </p>

            <p className="mt-1 text-3xl font-black text-[#0B2D5C]">
              {
                profile.completionPercentage ??
                0
              }
              %
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck
              size={20}
              className={
                profile.profileCompleted
                  ? "text-emerald-600"
                  : "text-amber-600"
              }
            />

            <span className="text-sm font-bold text-slate-700">
              {profile.profileCompleted
                ? "Profile information complete"
                : "Profile incomplete"}
            </span>
          </div>
        </div>
      </section>

      <DetailSection
        title="Basic Information"
        icon={
          <UserRound
            size={20}
          />
        }
      >
        <DetailItem
          label="Mobile"
          value={
            profile.mobile
          }
        />

        <DetailItem
          label="Date of Birth"
          value={
            profile.dateOfBirth
          }
        />

        <DetailItem
          label="Gender"
          value={
            profile.gender
          }
        />

        <DetailItem
          label="Age"
          value={
            profile.age
          }
        />

        <DetailItem
          label="Marital Status"
          value={
            profile.maritalStatus
          }
        />

        <DetailItem
          label="Country"
          value={
            profile.country
          }
        />

        <DetailItem
          label="State"
          value={
            profile.state
          }
        />

        <DetailItem
          label="City"
          value={
            profile.city
          }
        />

        <div className="sm:col-span-2">
          <DetailItem
            label="About Me"
            value={
              profile.aboutMe
            }
          />
        </div>
      </DetailSection>

      <DetailSection
        title="Church Information"
        icon={
          <Church
            size={20}
          />
        }
      >
        <DetailItem
          label="Denomination"
          value={
            profile.denomination
          }
        />

        <DetailItem
          label="Church Name"
          value={
            profile.churchName
          }
        />

        <DetailItem
          label="Pastor Name"
          value={
            profile.pastorName
          }
        />

        <DetailItem
          label="Baptized"
          value={
            profile.baptized
          }
        />

        <DetailItem
          label="Membership ID"
          value={
            profile.membershipId ||
            "Not provided"
          }
        />

        <DetailItem
          label="Church Address"
          value={
            profile.churchAddress
          }
        />
      </DetailSection>

      <DetailSection
        title="Education & Career"
        icon={
          <BriefcaseBusiness
            size={20}
          />
        }
      >
        <DetailItem
          label="Highest Education"
          value={
            profile.highestEducation
          }
        />

        <DetailItem
          label="Profession"
          value={
            profile.profession
          }
        />

        <DetailItem
          label="Company"
          value={
            profile.company
          }
        />

        <DetailItem
          label="Annual Income"
          value={
            profile.annualIncome
          }
        />
      </DetailSection>

      <DetailSection
        title="Family Information"
        icon={
          <UsersRound
            size={20}
          />
        }
      >
        <DetailItem
          label="Father's Name"
          value={
            profile.fatherName
          }
        />

        <DetailItem
          label="Mother's Name"
          value={
            profile.motherName
          }
        />

        <DetailItem
          label="Siblings"
          value={
            profile.siblings
          }
        />

        <DetailItem
          label="Family Location"
          value={
            profile.familyLocation
          }
        />
      </DetailSection>

      <DetailSection
        title="Partner Preferences"
        icon={
          <Heart
            size={20}
          />
        }
      >
        <DetailItem
          label="Preferred Age From"
          value={
            profile.preferredAgeFrom
          }
        />

        <DetailItem
          label="Preferred Age To"
          value={
            profile.preferredAgeTo
          }
        />

        <DetailItem
          label="Preferred Denomination"
          value={
            profile.preferredDenomination
          }
        />

        <DetailItem
          label="Preferred Education"
          value={
            profile.preferredEducation
          }
        />
      </DetailSection>

      {/* Photos */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2D5C] text-white">
            <MapPin
              size={20}
            />
          </div>

          <h2 className="text-lg font-black text-[#0B2D5C]">
            Profile Photos
          </h2>
        </div>

        <div className="p-5">
          {profile.photos &&
          profile.photos.length >
            0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {profile.photos.map(
                (photo) => (
                  <div
                    key={
                      photo.id
                    }
                    className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src={
                        photo.imageUrl
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />

                    {photo.primaryPhoto && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#0B2D5C] px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        Primary
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No photos uploaded.
              Photos are optional
              for verification.
            </div>
          )}
        </div>
      </section>

      {/* Existing review result */}

      {profile.verificationStatus ===
        "REJECTED" &&
        profile.verificationReason && (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-black text-red-900">
              Rejection Reason
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {
                profile.verificationReason
              }
            </p>
          </section>
        )}

      {profile.verificationStatus ===
        "APPROVED" && (
        <section className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2
            size={22}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <h3 className="font-black text-emerald-900">
              Profile Verified
            </h3>

            <p className="mt-1 text-sm text-emerald-700">
              Reviewed{" "}
              {formatDate(
                profile.verificationReviewedAt
              )}
            </p>
          </div>
        </section>
      )}

      <VerificationDecisionModal
        open={
          decision !==
          null
        }
        decision={
          decision
        }
        submitting={
          updating
        }
        error={
          decisionError
        }
        onClose={() => {
          if (!updating) {
            setDecision(
              null
            );

            setDecisionError(
              null
            );
          }
        }}
        onConfirm={
          handleDecision
        }
      />
    </div>
  );
}