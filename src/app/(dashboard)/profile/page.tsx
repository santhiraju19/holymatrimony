"use client";

import { useProfileWizard } from "@/features/profile/hooks/useProfileWizard";

import ProfileStepper from "@/features/profile/components/ProfileStepper";
import BasicInfoForm from "@/features/profile/components/BasicInfoForm";
import ChurchInfoForm from "@/features/profile/components/ChurchInfoForm";

export default function ProfilePage() {
  const { step, next, back } = useProfileWizard();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#0B2D5C]">
          Complete Your Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Let's complete your profile in a few simple steps.
        </p>
      </div>

      <ProfileStepper currentStep={step} />

      {step === 0 && <BasicInfoForm onNext={next} />}

      {step === 1 && (
        <>
          <ChurchInfoForm />

          <div className="mt-8">
            <button
              type="button"
              onClick={back}
              className="rounded-xl bg-slate-300 px-6 py-3 text-white"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}