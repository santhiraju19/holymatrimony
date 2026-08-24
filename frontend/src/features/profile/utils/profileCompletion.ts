import { ProfileState } from "../types";

export interface CompletionResult {
  percentage: number;
  completed: string[];
  pending: string[];
  completedFields: number;
  totalFields: number;
}

function hasText(
  value?: string | null
): boolean {
  return Boolean(
    value?.trim()
  );
}

/*
 * This completion rule intentionally mirrors
 * backend ProfileService.calculateCompletion().
 *
 * Core profile fields only are counted.
 *
 * Excluded from completion:
 *
 * - Photos
 * - Church Information
 * - Partner Preferences
 * - Optional / sensitive personal fields
 *
 * Denomination remains part of the member's
 * core personal profile.
 *
 * Core field count:
 *
 * Basic                 4
 * Personal              4
 * Current Location      3
 * About                 1
 * Education & Career    4
 * Family                4
 *
 * Total                20
 */
export function calculateProfileCompletion(
  profile: ProfileState
): CompletionResult {
  const completed: string[] = [];
  const pending: string[] = [];

  const sections = [
    {
      label: "Basic & Personal Information",

      checks: [
        hasText(
          profile.basicInfo.mobile
        ),

        hasText(
          profile.basicInfo.dateOfBirth
        ),

        hasText(
          profile.basicInfo.gender
        ),

        hasText(
          profile.basicInfo.maritalStatus
        ),

        hasText(
          profile.basicInfo.heightCm
        ),

        hasText(
          profile.basicInfo.motherTongue
        ),

        hasText(
          profile.basicInfo.religion
        ),

        hasText(
          profile.churchInfo.denomination
        ),
      ],
    },

    {
      label: "Current Location & About",

      checks: [
        hasText(
          profile.locationInfo.city
        ),

        hasText(
          profile.locationInfo.state
        ),

        hasText(
          profile.locationInfo.country
        ),

        hasText(
          profile.aboutInfo.aboutMe
        ),
      ],
    },

    {
      label: "Education & Career",

      checks: [
        hasText(
          profile.educationInfo.highestEducation
        ),

        hasText(
          profile.educationInfo.educationField
        ),

        hasText(
          profile.educationInfo.profession
        ),

        hasText(
          profile.educationInfo.annualIncome
        ),
      ],
    },

    {
      label: "Family Information",

      checks: [
        hasText(
          profile.familyInfo.fatherName
        ),

        hasText(
          profile.familyInfo.motherName
        ),

        hasText(
          profile.familyInfo.familyLocation
        ),

        hasText(
          profile.familyInfo.familyType
        ),
      ],
    },
  ];

  let completedFields = 0;
  let totalFields = 0;

  sections.forEach(
    (section) => {
      totalFields +=
        section.checks.length;

      const sectionCompleted =
        section.checks.filter(
          Boolean
        ).length;

      completedFields +=
        sectionCompleted;

      if (
        sectionCompleted ===
        section.checks.length
      ) {
        completed.push(
          section.label
        );
      } else {
        pending.push(
          section.label
        );
      }
    }
  );

  const percentage =
    totalFields === 0
      ? 0
      : Math.min(
          100,
          Math.floor(
            (
              completedFields /
              totalFields
            ) *
              100
          )
        );

  return {
    percentage,
    completed,
    pending,
    completedFields,
    totalFields,
  };
}
