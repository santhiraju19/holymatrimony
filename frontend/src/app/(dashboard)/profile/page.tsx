"use client";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileWizard } from "@/features/profile/hooks/useProfileWizard";

import { calculateProfileCompletion } from "@/features/profile/utils/profileCompletion";

import ProfileCompletionCard from "@/features/profile/components/ProfileCompletionCard";
import ProfileStepper from "@/features/profile/components/ProfileStepper";
import ProfileVerificationCard from "@/features/profile/components/ProfileVerificationCard";

import BasicInfoForm from "@/features/profile/components/BasicInfoForm";
import ChurchInfoForm from "@/features/profile/components/ChurchInfoForm";
import EducationForm from "@/features/profile/components/EducationForm";
import FamilyForm from "@/features/profile/components/FamilyForm";
import PreferencesForm from "@/features/profile/components/PreferencesForm";
import PhotoUpload from "@/features/profile/components/PhotoUpload";
import Review from "@/features/profile/components/Review";

import profileService, {
  type ProfileVerificationStatus,
} from "@/features/profile/services/profile.service";

const TOTAL_STEPS = 7;

export default function ProfilePage() {
  const {
    loading,
    saving,
    error,
    saveStatus,
    saveProfile,

    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    locationInfo,
    aboutInfo,
    photoInfo,
  } = useProfile();

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null
  );

  /*
   * =========================================================
   * Verification state
   * =========================================================
   */

  const [
    verificationStatus,
    setVerificationStatus,
  ] =
    useState<ProfileVerificationStatus>(
      "NOT_SUBMITTED"
    );

  const [
    verificationSubmittedAt,
    setVerificationSubmittedAt,
  ] =
    useState<string | null>(
      null
    );

  const [
    verificationReviewedAt,
    setVerificationReviewedAt,
  ] =
    useState<string | null>(
      null
    );

  const [
    verificationReason,
    setVerificationReason,
  ] =
    useState<string | null>(
      null
    );

  const [
    submittingVerification,
    setSubmittingVerification,
  ] =
    useState(false);

  const [
    verificationError,
    setVerificationError,
  ] =
    useState<string | null>(
      null
    );

  /*
   * Backend completion state.
   *
   * IMPORTANT:
   *
   * This is what determines whether the
   * member may submit for verification.
   *
   * The backend completion calculation does
   * not require profile photos.
   */
  const [
    backendCompletionPercentage,
    setBackendCompletionPercentage,
  ] = useState(0);

  const [
    backendProfileCompleted,
    setBackendProfileCompleted,
  ] = useState(false);

  /*
   * =========================================================
   * Local wizard profile state
   * =========================================================
   */

  const profile = {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    locationInfo,
    aboutInfo,
    photoInfo,
  };

  const {
    step,
    next,
    back,
  } =
    useProfileWizard();

  /*
   * Frontend completion can continue including
   * photos and other quality indicators.
   *
   * This score is used for the normal profile
   * completion UI only.
   */
  const completion =
    useMemo(
      () =>
        calculateProfileCompletion(
          profile
        ),
      [
        basicInfo,
        churchInfo,
        educationInfo,
        familyInfo,
        preferenceInfo,
        locationInfo,
        aboutInfo,
        photoInfo,
      ]
    );

  /*
   * =========================================================
   * Load backend profile / verification state
   * =========================================================
   */

  useEffect(() => {
    let active = true;

    async function loadVerification() {
      try {
        const data =
          await profileService
            .getProfile();

        if (
          !active ||
          !data
        ) {
          return;
        }

        setVerificationStatus(
          data.verificationStatus ??
            "NOT_SUBMITTED"
        );

        setVerificationSubmittedAt(
          data.verificationSubmittedAt ??
            null
        );

        setVerificationReviewedAt(
          data.verificationReviewedAt ??
            null
        );

        setVerificationReason(
          data.verificationReason ??
            null
        );

        /*
         * Verification eligibility comes
         * directly from the backend.
         */
        setBackendCompletionPercentage(
          data.completionPercentage ??
            0
        );

        setBackendProfileCompleted(
          Boolean(
            data.profileCompleted
          )
        );
      } catch (loadError) {
        /*
         * ProfileProvider already owns the
         * main profile loading/error flow.
         *
         * A verification metadata error should
         * not break the profile wizard.
         */
        console.error(
          "Unable to load verification status:",
          loadError
        );
      }
    }

    void loadVerification();

    return () => {
      active = false;
    };
  }, []);

  const currentStep =
    Math.min(
      step + 1,
      TOTAL_STEPS
    );

  /*
   * =========================================================
   * Helper: refresh backend verification/completion data
   * =========================================================
   */

  const refreshVerificationState =
    async (): Promise<void> => {
      const data =
        await profileService
          .getProfile();

      if (!data) {
        return;
      }

      setVerificationStatus(
        data.verificationStatus ??
          "NOT_SUBMITTED"
      );

      setVerificationSubmittedAt(
        data.verificationSubmittedAt ??
          null
      );

      setVerificationReviewedAt(
        data.verificationReviewedAt ??
          null
      );

      setVerificationReason(
        data.verificationReason ??
          null
      );

      setBackendCompletionPercentage(
        data.completionPercentage ??
          0
      );

      setBackendProfileCompleted(
        Boolean(
          data.profileCompleted
        )
      );
    };

  /*
   * =========================================================
   * Wizard navigation
   * =========================================================
   */

  const handleNext =
    async (): Promise<void> => {
      setSuccessMessage(
        null
      );

      setVerificationError(
        null
      );

      const saved =
        await saveProfile();

      if (!saved) {
        return;
      }

      /*
       * Refresh backend completion after
       * every successful save.
       */
      try {
        await refreshVerificationState();
      } catch (refreshError) {
        console.error(
          "Unable to refresh backend profile state:",
          refreshError
        );
      }

      setSuccessMessage(
        "Profile saved successfully."
      );

      next();

      window.requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      );
    };

  const handleBack =
    (): void => {
      setSuccessMessage(
        null
      );

      setVerificationError(
        null
      );

      back();

      window.requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      );
    };

  /*
   * =========================================================
   * Final profile save
   * =========================================================
   */

  const handleFinalSave =
    async (): Promise<void> => {
      setSuccessMessage(
        null
      );

      setVerificationError(
        null
      );

      const saved =
        await saveProfile();

      if (!saved) {
        return;
      }

      try {
        await refreshVerificationState();
      } catch (reloadError) {
        console.error(
          "Unable to refresh verification status:",
          reloadError
        );
      }

      setSuccessMessage(
        "Your profile has been saved successfully."
      );

      window.requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      );
    };

  /*
   * =========================================================
   * Submit / resubmit for verification
   * =========================================================
   */

  const handleSubmitForVerification =
    async (): Promise<void> => {
      if (
        submittingVerification
      ) {
        return;
      }

      setSubmittingVerification(
        true
      );

      setVerificationError(
        null
      );

      setSuccessMessage(
        null
      );

      try {
        /*
         * Save the latest wizard data first.
         */
        const saved =
          await saveProfile();

        if (!saved) {
          setVerificationError(
            "Please save your profile before submitting it for verification."
          );

          return;
        }

        /*
         * Re-read from the backend.
         *
         * This is important because backend
         * completion is the source of truth for
         * verification eligibility.
         *
         * Photos are not required by the backend
         * completion calculation.
         */
        const latestProfile =
          await profileService
            .getProfile();

        if (!latestProfile) {
          setVerificationError(
            "Unable to load your saved profile."
          );

          return;
        }

        const latestCompletion =
          latestProfile
            .completionPercentage ??
          0;

        const latestCompleted =
          Boolean(
            latestProfile
              .profileCompleted
          );

        setBackendCompletionPercentage(
          latestCompletion
        );

        setBackendProfileCompleted(
          latestCompleted
        );

        if (!latestCompleted) {
          setVerificationError(
            "Please complete all required profile information before submitting for verification."
          );

          return;
        }

        /*
         * Backend will enforce:
         *
         * NOT_SUBMITTED -> PENDING
         * REJECTED      -> PENDING
         *
         * PENDING and APPROVED cannot
         * be submitted again.
         */
        const updatedProfile =
          await profileService
            .submitForVerification();

        setVerificationStatus(
          updatedProfile.verificationStatus ??
            "PENDING"
        );

        setVerificationSubmittedAt(
          updatedProfile.verificationSubmittedAt ??
            null
        );

        setVerificationReviewedAt(
          updatedProfile.verificationReviewedAt ??
            null
        );

        setVerificationReason(
          updatedProfile.verificationReason ??
            null
        );

        setBackendCompletionPercentage(
          updatedProfile.completionPercentage ??
            latestCompletion
        );

        setBackendProfileCompleted(
          Boolean(
            updatedProfile.profileCompleted ??
              latestCompleted
          )
        );

        setSuccessMessage(
          verificationStatus ===
            "REJECTED"
            ? "Your profile has been resubmitted for verification."
            : "Your profile has been submitted for verification."
        );

        window.requestAnimationFrame(
          () => {
            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          }
        );
      } catch (
        submitError
      ) {
        console.error(
          "Unable to submit profile for verification:",
          submitError
        );

        if (
          axios.isAxiosError(
            submitError
          )
        ) {
          const responseData =
            submitError.response
              ?.data as
              | {
                  message?: string;
                  error?: string;
                }
              | undefined;

          setVerificationError(
            responseData?.message ??
              responseData?.error ??
              "Unable to submit your profile for verification."
          );
        } else {
          setVerificationError(
            submitError instanceof
              Error
              ? submitError.message
              : "Unable to submit your profile for verification."
          );
        }
      } finally {
        setSubmittingVerification(
          false
        );
      }
    };

  /*
   * =========================================================
   * Wizard forms
   * =========================================================
   */

  const forms = [
    <BasicInfoForm
      key="basic"
      onNext={
        handleNext
      }
    />,

    <ChurchInfoForm
      key="church"
      onBack={
        handleBack
      }
      onNext={
        handleNext
      }
    />,

    <EducationForm
      key="education"
      onBack={
        handleBack
      }
      onNext={
        handleNext
      }
    />,

    <FamilyForm
      key="family"
      onBack={
        handleBack
      }
      onNext={
        handleNext
      }
    />,

    <PreferencesForm
      key="preferences"
      onBack={
        handleBack
      }
      onNext={
        handleNext
      }
    />,

    <PhotoUpload
      key="photos"
      onBack={
        handleBack
      }
      onNext={
        handleNext
      }
    />,

    <Review
      key="review"
      onBack={
        handleBack
      }
      onSave={
        handleFinalSave
      }
      saving={
        saving
      }
    />,
  ];

  /*
   * =========================================================
   * Loading
   * =========================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="rounded-[28px] border border-slate-200 bg-white px-10 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-[#0B2D5C]">
            <Loader2
              size={30}
              className="animate-spin"
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#0B2D5C]">
            Loading your profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Preparing your saved
            information securely.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * Page
   * =========================================================
   */

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}

      <section className="relative overflow-hidden rounded-[30px] border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-5 py-7 text-white shadow-[0_24px_70px_rgba(11,45,92,0.22)] sm:px-8 sm:py-9 lg:px-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D675]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#F2D675]">
              <Sparkles
                size={14}
              />

              Build a meaningful
              profile
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur sm:flex">
                <UserRound
                  size={27}
                />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Complete Your
                  Profile
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                  Share the
                  information that
                  helps compatible
                  Christian members
                  understand your
                  faith, family and
                  life journey.
                </p>
              </div>
            </div>
          </div>

          {/* Local profile-quality completion */}

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:min-w-64">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
                  Profile
                  completion
                </p>

                <p className="mt-2 text-4xl font-black text-white">
                  {
                    completion.percentage
                  }
                  %
                </p>
              </div>

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-white/15 bg-white/10">
                <span className="text-lg font-black text-[#F2D675]">
                  {
                    completion.percentage
                  }
                  %
                </span>
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#FFF2B2] transition-all duration-500"
                style={{
                  width: `${completion.percentage}%`,
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-blue-100">
                Step{" "}
                {
                  currentStep
                }{" "}
                of{" "}
                {
                  TOTAL_STEPS
                }
              </span>

              <span className="font-bold text-[#F2D675]">
                {completion
                  .pending
                  .length ===
                0
                  ? "Ready"
                  : `${completion.pending.length} remaining`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Status messages */}

      <div
        className="min-h-6 space-y-3"
        aria-live="polite"
      >
        {(saving ||
          saveStatus ===
            "saving") && (
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm">
            <Loader2
              size={18}
              className="animate-spin"
            />

            {saving
              ? "Saving your profile..."
              : "Saving your draft..."}
          </div>
        )}

        {!saving &&
          saveStatus ===
            "saved" &&
          !successMessage &&
          !error &&
          !verificationError && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">
              <CheckCircle2
                size={18}
              />

              Draft saved
              securely
            </div>
          )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700 shadow-sm"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>
          </div>
        )}

        {verificationError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-700 shadow-sm"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {
                verificationError
              }
            </span>
          </div>
        )}

        {successMessage &&
          !error &&
          !verificationError && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700 shadow-sm"
            >
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>
                {
                  successMessage
                }
              </span>
            </div>
          )}
      </div>

      {/* Main layout */}

      <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sidebar */}

        <aside className="min-w-0 xl:sticky xl:top-[106px]">
          <div className="space-y-5">
            {/*
             * Normal profile quality card.
             *
             * This may still encourage photo upload.
             */}
            <ProfileCompletionCard
              percentage={
                completion.percentage
              }
              completed={
                completion.completed
              }
              pending={
                completion.pending
              }
            />

            {/*
             * Verification eligibility uses
             * backend completion, NOT the local
             * completion score.
             *
             * Therefore photos can be skipped.
             */}
            <ProfileVerificationCard
              status={
                verificationStatus
              }
              completionPercentage={
                backendProfileCompleted
                  ? 100
                  : backendCompletionPercentage
              }
              submittedAt={
                verificationSubmittedAt
              }
              reviewedAt={
                verificationReviewedAt
              }
              reason={
                verificationReason
              }
              submitting={
                submittingVerification
              }
              onSubmit={
                handleSubmitForVerification
              }
            />

            <ProfileStepper
              currentStep={
                currentStep
              }
            />

            <div className="hidden rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] xl:block">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <ShieldCheck
                  size={21}
                />
              </div>

              <h3 className="mt-4 font-black text-[#0B2D5C]">
                Your information
                is secure
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Profile details
                are saved securely
                and can be updated
                later from My
                Profile.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <Clock3
                  size={15}
                />

                Draft saving
                enabled
              </div>
            </div>
          </div>
        </aside>

        {/* Wizard */}

        <section className="min-w-0">
          <div className="relative">
            <div
              key={step}
              className="animate-[profileStepIn_300ms_ease-out]"
            >
              {forms[step] ??
                forms[0]}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}