
import type { BrowseProfile } from "../../types";

import ProfileInfoSection from "./ProfileInfoSection";

interface ProfileDetailsContentProps {
  profile: BrowseProfile;
}

function formatBoolean(
  value: boolean | null | undefined
): string {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "";
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProfileDetailsContent({
  profile,
}: ProfileDetailsContentProps) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <ProfileInfoSection
        title="Basic information"
        description="Personal and marital details"
        items={[
          {
            label: "Full name",
            value: profile.fullName,
          },
          {
            label: "Age",
            value: profile.age
              ? `${profile.age} years`
              : "",
          },
          {
            label: "Date of birth",
            value: formatDate(
              profile.dateOfBirth
            ),
          },
          {
            label: "Gender",
            value: profile.gender,
          },
          {
            label: "Marital status",
            value: profile.maritalStatus,
          },
        ]}
      />

      <ProfileInfoSection
        title="Church and faith"
        description="Spiritual background and church details"
        items={[
          {
            label: "Denomination",
            value: profile.denomination,
          },
          {
            label: "Church name",
            value: profile.churchName,
          },
          {
            label: "Baptized",
            value: formatBoolean(
              profile.baptized
            ),
          },
        ]}
      />

      <ProfileInfoSection
        title="Education and career"
        description="Academic and professional information"
        items={[
          {
            label: "Highest education",
            value: profile.highestEducation,
          },
          {
            label: "Profession",
            value: profile.profession,
          },
          {
            label: "Company",
            value: profile.company,
          },
          {
            label: "Annual income",
            value: profile.annualIncome,
          },
        ]}
      />

      <ProfileInfoSection
        title="Location"
        description="Current residential information"
        items={[
          {
            label: "City",
            value: profile.city,
          },
          {
            label: "State",
            value: profile.state,
          },
          {
            label: "Country",
            value: profile.country,
          },
        ]}
      />
    </div>
  );
}