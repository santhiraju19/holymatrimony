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
  type LucideIcon,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import ProfileVerificationBadge from "@/features/admin/profiles/components/ProfileVerificationBadge";
import VerificationDecisionModal from "@/features/admin/profiles/components/VerificationDecisionModal";
import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

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
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children:
    React.ReactNode;
}) {
  return (
    <AdminSectionCard
      title={title}
      icon={Icon}
      contentClassName="grid gap-3 sm:grid-cols-2"
    >
      {children}
    </AdminSectionCard>
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
      <AdminPageHeader
        eyebrow="Member Administration"
        title={profile.fullName || "Member Profile"}
        description="Review profile information, photos and verification status."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {pending && (
              <>
                <AdminButton
                  type="button"
                  variant="danger"
                  icon={<XCircle size={16} />}
                  onClick={() => {
                    setDecisionError(null);
                    setDecision("REJECTED");
                  }}
                >
                  Reject
                </AdminButton>

                <AdminButton
                  type="button"
                  variant="success"
                  icon={<CheckCircle2 size={16} />}
                  onClick={() => {
                    setDecisionError(null);
                    setDecision("APPROVED");
                  }}
                >
                  Approve
                </AdminButton>
              </>
            )}

            <Link
              href="/admin/profiles"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-[#0B2D5C]">
            {profile.photos?.find(
              (photo) =>
                photo.primaryPhoto
            ) ? (
              <img
                src={
                  profile.photos.find(
                    (photo) =>
                      photo.primaryPhoto
                  )!.imageUrl
                }
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={28} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ProfileVerificationBadge
                status={
                  profile.verificationStatus
                }
              />

              <span className="text-xs font-semibold text-slate-500">
                Submitted:{" "}
                {formatDate(
                  profile.verificationSubmittedAt
                )}
              </span>
            </div>

            <p className="mt-2 break-all text-sm font-medium text-slate-600">
              {profile.email}
            </p>
          </div>
        </div>
      </AdminPageHeader>

      {/* Completion */}

      <AdminSectionCard
        title="Profile Completion"
        description="Current readiness of the member profile."
        icon={ShieldCheck}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-end justify-between gap-4">
              <p className="text-3xl font-black text-[#0B2D5C]">
                {profile.completionPercentage ?? 0}%
              </p>

              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={18}
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

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0B2D5C] transition-all"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      profile.completionPercentage ?? 0
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </AdminSectionCard>

      <DetailSection
        title="Basic Information"
        icon={UserRound}
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
        icon={Church}
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
        icon={BriefcaseBusiness}
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
        icon={UsersRound}
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
        icon={Heart}
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

      <AdminSectionCard
        title="Profile Photos"
        description="Photos submitted by the member with the primary profile photo identified."
        icon={MapPin}
      >
        {profile.photos &&
        profile.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {profile.photos.map(
              (photo) => (
                <div
                  key={
                    photo.id
                  }
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <img
                    src={
                      photo.imageUrl
                    }
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />

                  {photo.primaryPhoto && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#0B2D5C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                      Primary
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <UserRound
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-bold text-slate-600">
              No photos uploaded
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Photos are optional for verification.
            </p>
          </div>
        )}
      </AdminSectionCard>

      {/* Existing review result */}

      {profile.verificationStatus ===
        "REJECTED" &&
        profile.verificationReason && (
          <AdminSectionCard
            title="Verification Result"
            description="The most recent administrative verification decision."
            icon={ShieldCheck}
          >
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <XCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="font-black text-red-900">
                  Profile Rejected
                </p>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  {profile.verificationReason}
                </p>
              </div>
            </div>
          </AdminSectionCard>
        )}

      {profile.verificationStatus ===
        "APPROVED" && (
          <AdminSectionCard
            title="Verification Result"
            description="The most recent administrative verification decision."
            icon={ShieldCheck}
          >
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="font-black text-emerald-900">
                  Profile Verified
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  Reviewed{" "}
                  {formatDate(
                    profile.verificationReviewedAt
                  )}
                </p>
              </div>
            </div>
          </AdminSectionCard>
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