"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import { useProfile } from "@/features/profile/context/useProfile";

interface ReviewProps {
  onBack: () => void;
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
    // TODO:
    // Replace this with API integration in Sprint 5.
    console.log("Profile Submitted", {
      basicInfo,
      churchInfo,
      educationInfo,
      familyInfo,
      preferenceInfo,
      photoInfo,
    });

    alert("Profile submitted successfully.");
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-slate-200 p-5">
      <h3 className="mb-4 text-lg font-semibold text-[#0B2D5C]">
        {title}
      </h3>

      <div className="space-y-2 text-sm text-slate-700">
        {children}
      </div>
    </div>
  );

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0B2D5C]">
          Review Your Profile
        </h2>

        <p className="mt-2 text-slate-500">
          Please review your information before submitting.
        </p>
      </div>

      <div className="space-y-6">
        <Section title="Basic Information">
          <p><strong>Name:</strong> {basicInfo.fullName}</p>
          <p><strong>Mobile:</strong> {basicInfo.mobile}</p>
          <p><strong>Date of Birth:</strong> {basicInfo.dateOfBirth}</p>
          <p><strong>Gender:</strong> {basicInfo.gender}</p>
        </Section>

        <Section title="Church Information">
          <p><strong>Church:</strong> {churchInfo.churchName}</p>
          <p><strong>Denomination:</strong> {churchInfo.denomination}</p>
          <p><strong>Pastor:</strong> {churchInfo.pastorName}</p>
        </Section>

        <Section title="Education">
          <p><strong>Education:</strong> {educationInfo.highestEducation}</p>
          <p><strong>Profession:</strong> {educationInfo.profession}</p>
          <p><strong>Company:</strong> {educationInfo.company}</p>
          <p><strong>Income:</strong> {educationInfo.annualIncome}</p>
        </Section>

        <Section title="Family">
          <p><strong>Father:</strong> {familyInfo.fatherName}</p>
          <p><strong>Mother:</strong> {familyInfo.motherName}</p>
          <p><strong>Siblings:</strong> {familyInfo.siblings}</p>
          <p><strong>Location:</strong> {familyInfo.familyLocation}</p>
        </Section>

        <Section title="Partner Preferences">
          <p>
            <strong>Age:</strong>{" "}
            {preferenceInfo.preferredAgeFrom} - {preferenceInfo.preferredAgeTo}
          </p>

          <p>
            <strong>Denomination:</strong>{" "}
            {preferenceInfo.denomination}
          </p>

          <p>
            <strong>Education:</strong>{" "}
            {preferenceInfo.education}
          </p>
        </Section>

        <Section title="Photos">
          <p>
            <strong>Total Photos:</strong>{" "}
            {photoInfo.photos?.length ?? 0}
          </p>
        </Section>
      </div>

      <div className="mt-10 flex justify-between">
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
    </Card>
  );
}