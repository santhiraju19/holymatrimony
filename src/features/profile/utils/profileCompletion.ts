import { ProfileState } from "../types";

export interface CompletionResult {
  percentage: number;
  completed: string[];
  pending: string[];
}

export function calculateProfileCompletion(
  profile: ProfileState
): CompletionResult {
  const completed: string[] = [];
  const pending: string[] = [];

  const sections = [
    {
      label: "Basic Information",
      valid:
        !!profile.basicInfo.fullName &&
        !!profile.basicInfo.mobile &&
        !!profile.basicInfo.gender &&
        !!profile.basicInfo.dateOfBirth,
    },
    {
      label: "Church Information",
      valid:
        !!profile.churchInfo.churchName &&
        !!profile.churchInfo.denomination,
    },
    {
      label: "Education",
      valid:
        !!profile.educationInfo.highestEducation &&
        !!profile.educationInfo.profession,
    },
    {
      label: "Family",
      valid:
        !!profile.familyInfo.fatherName &&
        !!profile.familyInfo.motherName,
    },
    {
      label: "Partner Preferences",
      valid:
        !!profile.preferenceInfo.preferredAgeFrom &&
        !!profile.preferenceInfo.preferredAgeTo,
    },
    {
      label: "Photos",
      valid:
        Array.isArray((profile.photoInfo as any).photos)
          ? (profile.photoInfo as any).photos.length > 0
          : !!profile.photoInfo.profilePhoto,
    },
  ];

  sections.forEach((section) => {
    if (section.valid) {
      completed.push(section.label);
    } else {
      pending.push(section.label);
    }
  });

  return {
    percentage: Math.round(
      (completed.length / sections.length) * 100
    ),
    completed,
    pending,
  };
}