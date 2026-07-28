"use client";

import { useMemo, useState } from "react";

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

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

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
  } = useProfileWizard();

  const completion = useMemo(
    () =>
      calculateProfileCompletion(profile),
    [profile]
  );

  const handleNext =
    async (): Promise<void> => {
      setSuccessMessage(null);

      const saved = await saveProfile();

      if (!saved) {
        return;
      }

      setSuccessMessage(
        "Profile saved successfully."
      );

      next();
    };

  const handleFinalSave =
    async (): Promise<void> => {
      setSuccessMessage(null);

      const saved = await saveProfile();

      if (!saved) {
        return;
      }

      setSuccessMessage(
        "Your profile has been saved successfully."
      );
    };

  const forms = [
    <BasicInfoForm
      key="basic"
      onNext={handleNext}
    />,

    <ChurchInfoForm
      key="church"
      onBack={back}
      onNext={handleNext}
    />,

    <EducationForm
      key="education"
      onBack={back}
      onNext={handleNext}
    />,

    <FamilyForm
      key="family"
      onBack={back}
      onNext={handleNext}
    />,

    <PreferencesForm
      key="preferences"
      onBack={back}
      onNext={handleNext}
    />,

    <PhotoUpload
      key="photos"
      onBack={back}
      onNext={handleNext}
    />,

    <Review
      key="review"
      onBack={back}
      onSave={handleFinalSave}
      saving={saving}
    />,
  ];

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#0B2D5C]">
            Complete Your Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Complete your profile to start
            finding your God-given life
            partner.
          </p>
        </div>

        <div
          className="min-h-6 text-sm font-medium"
          aria-live="polite"
        >
          {saving && (
            <span className="text-blue-600">
              Saving profile...
            </span>
          )}

          {!saving &&
            saveStatus === "saving" && (
              <span className="text-blue-600">
                Saving draft...
              </span>
            )}

          {!saving &&
            saveStatus === "saved" && (
              <span className="text-emerald-600">
                Draft saved
              </span>
            )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && !error && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700"
        >
          ✓ {successMessage}
        </div>
      )}

      <ProfileCompletionCard
        percentage={completion.percentage}
        completed={completion.completed}
        pending={completion.pending}
      />

      <ProfileStepper
        currentStep={step + 1}
      />

      {forms[step] ?? forms[0]}
    </div>
  );
}