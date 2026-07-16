"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { useProfile } from "@/features/profile/context/useProfile";

interface ReviewProps {
  onBack: () => void;
}

function Status({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
      <span className="font-medium">{label}</span>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          verified
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {verified ? "Verified" : "Pending"}
      </span>
    </div>
  );
}

export default function Review({
  onBack,
}: ReviewProps) {
  const {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    photoInfo,
  } = useProfile();

  const handleSubmit = () => {
    console.log({
      basicInfo,
      churchInfo,
      educationInfo,
      familyInfo,
      preferenceInfo,
      photoInfo,
    });

    alert("Profile submitted successfully.");
  };

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="mb-2 text-3xl font-bold text-[#0B2D5C]">
          Review Your Profile
        </h2>

        <p className="text-slate-500">
          Review your information before submitting.
        </p>
      </Card>

      <Card>
        <h3 className="mb-6 text-xl font-bold text-[#0B2D5C]">
          Verification Status
        </h3>

        <div className="space-y-4">
          <Status
            label="Email Verification"
            verified={false}
          />

          <Status
            label="Mobile Verification"
            verified={basicInfo.mobile.trim() !== ""}
          />

          <Status
            label="Church Verification"
            verified={churchInfo.churchName.trim() !== ""}
          />

          <Status
            label="Pastor Recommendation"
            verified={churchInfo.pastorName.trim() !== ""}
          />

          <Status
            label="Profile Photos"
            verified={photoInfo.photos.length > 0}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-6 text-xl font-bold text-[#0B2D5C]">
          Profile Summary
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p><strong>Name:</strong> {basicInfo.fullName}</p>
            <p><strong>Mobile:</strong> {basicInfo.mobile}</p>
            <p><strong>DOB:</strong> {basicInfo.dateOfBirth}</p>
            <p><strong>Gender:</strong> {basicInfo.gender}</p>
          </div>

          <div>
            <p><strong>Church:</strong> {churchInfo.churchName}</p>
            <p><strong>Education:</strong> {educationInfo.highestEducation}</p>
            <p><strong>Profession:</strong> {educationInfo.profession}</p>
            <p><strong>Photos:</strong> {photoInfo.photos.length}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
        >
          Submit Profile
        </Button>
      </div>
    </div>
  );
}