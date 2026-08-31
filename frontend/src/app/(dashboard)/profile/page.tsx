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

import BasicInfoForm from "@/features/profile/components/BasicInfoForm";
import ChurchInfoForm from "@/features/profile/components/ChurchInfoForm";
import EducationForm from "@/features/profile/components/EducationForm";
import FamilyForm from "@/features/profile/components/FamilyForm";
import PreferencesForm from "@/features/profile/components/PreferencesForm";
import PhotoUpload from "@/features/profile/components/PhotoUpload";
import Review from "@/features/profile/components/Review";

import profileService from "@/features/profile/services/profile.service";

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
   * Backend completion state
   * =========================================================
   *
   * Verification eligibility comes from
   * the backend and does not require photos.
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
   * Local profile state
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
    goTo,
  } =
    useProfileWizard();

  /*
   * Local profile-quality completion.
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
   * Load backend verification/completion state
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
   * Refresh backend state
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

      const saved =
        await saveProfile();

      if (!saved) {
        return;
      }

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
   * Direct navigation between journey steps.
   */

  const handleStepClick = (
    stepNumber: number
  ): void => {
    const targetIndex =
      stepNumber - 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        TOTAL_STEPS
    ) {
      return;
    }

    setSuccessMessage(
      null
    );

    goTo(
      targetIndex
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
   * Final profile save
   * =========================================================
   */

  const handleFinalSave =
    async (): Promise<void> => {
      setSuccessMessage(
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
        "Your profile has been saved successfully. Completed profiles are now available to other members."
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
      <div className="flex min-h-[45vh] items-center justify-center">
        <div className="rounded-[20px] border border-slate-200 bg-white px-8 py-8 text-center shadow-[0_12px_36px_rgba(15,23,42,0.07)]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <Loader2
              size={22}
              className="animate-spin"
            />
          </div>

          <h2 className="mt-3 text-base font-black text-[#0B2D5C]">
            Loading your profile
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Preparing your saved information securely.
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
    <div className="space-y-4 pb-8">

      {/* =====================================================
          Compact premium profile header
          ===================================================== */}

      <section className="relative overflow-hidden rounded-[22px] border border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-4 py-4 text-white shadow-[0_14px_38px_rgba(11,45,92,0.16)] sm:px-5 lg:px-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-[30%] h-48 w-48 rounded-full bg-[#D4AF37]/15 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F2D675]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675] sm:text-[10px]">
              <Sparkles
                size={11}
              />

              Build a meaningful profile
            </div>

            <div className="mt-3 flex items-start gap-3">
              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur sm:flex">
                <UserRound
                  size={17}
                />
              </div>

              <div>
                <h1 className="text-xl font-black tracking-[-0.025em] sm:text-2xl">
                  Complete Your Profile
                </h1>

                <p className="mt-1.5 max-w-xl text-xs leading-5 text-blue-100/90 sm:text-sm">
                  Share your faith, family and life journey to help compatible members understand you better.
                </p>
              </div>
            </div>
          </div>

          {/* Compact profile status */}

          <div className="grid gap-2 sm:grid-cols-2 lg:w-[390px]">
            <div className="rounded-[15px] border border-white/10 bg-white/[0.08] px-3.5 py-3 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-blue-200">
                    Profile completion
                  </p>

                  <p className="mt-0.5 text-xl font-black">
                    {
                      completion.percentage
                    }
                    %
                  </p>
                </div>

                <span className="text-xs font-black text-[#F2D675]">
                  Step {currentStep}/{TOTAL_STEPS}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#FFF2B2]"
                  style={{
                    width: `${completion.percentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-[15px] border border-white/10 bg-white/[0.08] px-3.5 py-3 backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-blue-200">
                Profile journey
              </p>

              <p className="mt-1 text-sm font-black text-white">
                {completion.pending.length ===
                0
                  ? "Profile ready"
                  : `${completion.pending.length} sections remaining`}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-blue-100">
                <ShieldCheck
                  size={12}
                  className="text-emerald-400"
                />

                Secure profile editing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Compact status messages
          ===================================================== */}

      <div
        className="space-y-2"
        aria-live="polite"
      >
        {(saving ||
          saveStatus ===
            "saving") && (
          <StatusMessage
            tone="blue"
            icon={
              <Loader2
                size={15}
                className="animate-spin"
              />
            }
          >
            {saving
              ? "Saving your profile..."
              : "Saving your draft..."}
          </StatusMessage>
        )}

        {!saving &&
          saveStatus ===
            "saved" &&
          !successMessage &&
          !error &&
          (
            <StatusMessage
              tone="green"
              icon={
                <CheckCircle2
                  size={15}
                />
              }
            >
              Draft saved securely
            </StatusMessage>
          )}

        {error && (
          <StatusMessage
            tone="red"
            icon={
              <AlertCircle
                size={15}
              />
            }
            role="alert"
          >
            {error}
          </StatusMessage>
        )}


        {successMessage &&
          !error &&
          (
            <StatusMessage
              tone="green"
              icon={
                <CheckCircle2
                  size={15}
                />
              }
              role="status"
            >
              {
                successMessage
              }
            </StatusMessage>
          )}
      </div>

      {/* =====================================================
          Profile Workspace
          ===================================================== */}

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[245px_minmax(0,1fr)]">

        {/* Sidebar */}

        <aside className="min-w-0 lg:sticky lg:top-[88px]">
          <div className="space-y-3">

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
<ProfileStepper
              currentStep={
                currentStep
              }
              onStepClick={
                handleStepClick
              }
            />

            {/* Compact security note */}

            <div className="hidden rounded-[16px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-blue-50 px-3.5 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] xl:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <ShieldCheck
                    size={15}
                  />
                </div>

                <div>
                  <h3 className="text-xs font-black text-[#0B2D5C]">
                    Your information is secure
                  </h3>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                    <Clock3
                      size={11}
                    />

                    Draft saving enabled
                  </div>
                </div>
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

type StatusTone =
  | "blue"
  | "green"
  | "red";

function StatusMessage({
  tone,
  icon,
  children,
  role,
}: {
  tone: StatusTone;
  icon: React.ReactNode;
  children: React.ReactNode;
  role?:
    | "alert"
    | "status";
}) {
  const styles: Record<
    StatusTone,
    string
  > = {
    blue:
      "border-blue-200 bg-blue-50/80 text-blue-700",

    green:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700",

    red:
      "border-red-200 bg-red-50/80 text-red-700",
  };

  return (
    <div
      role={role}
      className={[
        "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-sm sm:text-sm",
        styles[tone],
      ].join(" ")}
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span>
        {children}
      </span>
    </div>
  );
}
