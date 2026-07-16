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
        profile.basicInfo.fullName.trim() !== "" &&
        profile.basicInfo.mobile.trim() !== "" &&
        profile.basicInfo.gender.trim() !== "" &&
        profile.basicInfo.dateOfBirth.trim() !== "",
    },
    {
      label: "Church Information",
      valid:
        profile.churchInfo.churchName.trim() !== "" &&
        profile.churchInfo.denomination.trim() !== "",
    },
    {
      label: "Education",
      valid:
        profile.educationInfo.highestEducation.trim() !== "" &&
        profile.educationInfo.profession.trim() !== "",
    },
    {
      label: "Family",
      valid:
        profile.familyInfo.fatherName.trim() !== "" &&
        profile.familyInfo.motherName.trim() !== "",
    },
    {
      label: "Partner Preferences",
      valid:
        profile.preferenceInfo.preferredAgeFrom.trim() !== "" &&
        profile.preferenceInfo.preferredAgeTo.trim() !== "",
    },
    {
      label: "Photos",
      valid: profile.photoInfo.photos.length > 0,
    },
  ];

  sections.forEach((section) => {
    section.valid
      ? completed.push(section.label)
      : pending.push(section.label);
  });

  return {
    percentage: Math.round((completed.length / sections.length) * 100),
    completed,
    pending,
  };
}