"use client";

import { useMemo } from "react";

import { useProfileWizard } from "@/features/profile/hooks/useProfileWizard";
import { useProfile } from "@/features/profile/context/useProfile";

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
  const profile = useProfile();

  const { step, next, back } = useProfileWizard();

  const completion = useMemo(
    () => calculateProfileCompletion(profile),
    [profile]
  );

  const forms = [
    <BasicInfoForm
      key="basic"
      onNext={next}
    />,

    <ChurchInfoForm
      key="church"
      onBack={back}
      onNext={next}
    />,

    <EducationForm
      key="education"
      onBack={back}
      onNext={next}
    />,

    <FamilyForm
      key="family"
      onBack={back}
      onNext={next}
    />,

    <PreferencesForm
      key="preferences"
      onBack={back}
      onNext={next}
    />,

    <PhotoUpload
      key="photos"
      onBack={back}
      onNext={next}
    />,

    <Review
      key="review"
      onBack={back}
    />,
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#0B2D5C]">
          Complete Your Profile
        </h1>

        <p className="mt-2 text-slate-500">
          Complete your profile to start finding your God-given life partner.
        </p>
      </div>

      <ProfileCompletionCard
        percentage={completion.percentage}
        completed={completion.completed}
        pending={completion.pending}
      />

      <ProfileStepper currentStep={step + 1} />

      {forms[step]}
    </div>
  );
}