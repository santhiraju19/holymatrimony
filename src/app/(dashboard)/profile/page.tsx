"use client";

import { useProfileWizard } from "@/features/profile/hooks/useProfileWizard";

import ProfileStepper from "@/features/profile/components/ProfileStepper";

import BasicInfoForm from "@/features/profile/components/BasicInfoForm";
import ChurchInfoForm from "@/features/profile/components/ChurchInfoForm";

export default function ProfilePage() {
  const { step, next, back } = useProfileWizard();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#0B2D5C]">
          Complete Your Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Complete your profile to start finding your God-given life partner.
        </p>
      </div>

      {/* Stepper */}
      <ProfileStepper currentStep={step} />

      {/* Step 1 */}
      {step === 0 && (
        <BasicInfoForm
          onNext={next}
        />
      )}

      {/* Step 2 */}
      {step === 1 && (
        <ChurchInfoForm
          onBack={back}
          onNext={next}
        />
      )}
    </div>
  );
}