"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { useProfile } from "@/features/profile/context/useProfile";

interface ReviewProps {
  onBack: () => void;
  onSave: () => Promise<void>;
  saving: boolean;
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
  onSave,
  saving,
}: ReviewProps) {
  const {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    photoInfo,
  } = useProfile();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSuccess(false);
    setError("");

    try {
      await onSave();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    }
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
            verified={basicInfo.email.trim() !== ""}
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
          <div className="space-y-2">
            <p><strong>Name:</strong> {basicInfo.fullName}</p>
            <p><strong>Email:</strong> {basicInfo.email}</p>
            <p><strong>Mobile:</strong> {basicInfo.mobile}</p>
            <p><strong>DOB:</strong> {basicInfo.dateOfBirth}</p>
            <p><strong>Gender:</strong> {basicInfo.gender}</p>
            <p><strong>Marital Status:</strong> {basicInfo.maritalStatus}</p>
          </div>

          <div className="space-y-2">
            <p><strong>Church:</strong> {churchInfo.churchName}</p>
            <p><strong>Denomination:</strong> {churchInfo.denomination}</p>
            <p><strong>Education:</strong> {educationInfo.highestEducation}</p>
            <p><strong>Profession:</strong> {educationInfo.profession}</p>
            <p><strong>Father:</strong> {familyInfo.fatherName}</p>
            <p>
              <strong>Preferred Age:</strong>{" "}
              {preferenceInfo.preferredAgeFrom} -{" "}
              {preferenceInfo.preferredAgeTo}
            </p>
            <p><strong>Photos:</strong> {photoInfo.photos.length}</p>
          </div>
        </div>

        {success && (
          <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
            ✅ Profile saved successfully.
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={saving}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Submit Profile"}
        </Button>
      </div>
    </div>
  );
}
