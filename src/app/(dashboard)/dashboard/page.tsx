"use client";

import ProfileStepper from "@/features/profile/components/ProfileStepper";
import BasicInfoForm from "@/features/profile/components/BasicInfoForm";

export default function ProfilePage() {
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

      <ProfileStepper currentStep={0} />

      <BasicInfoForm />
    </div>
  );
}