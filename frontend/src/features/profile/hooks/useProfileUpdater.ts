"use client";

import { useProfile } from "../context/useProfile";
import { ProfileState } from "../types";

/*
 * Editable profile sections.
 *
 * memberId is intentionally excluded because it is a permanent,
 * system-generated Holy Matrimony Membership ID.
 */
type EditableProfileSection =
  Exclude<keyof ProfileState, "memberId">;

export function useProfileUpdater() {
  const { setProfile } = useProfile();

  /*
   * Update one field in an editable profile section.
   */
  function updateField<
    Section extends EditableProfileSection,
    Field extends keyof ProfileState[Section],
  >(
    section: Section,
    field: Field,
    value: ProfileState[Section][Field]
  ) {
    setProfile((prev) => ({
      ...prev,

      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  /*
   * Preserve the existing updateSection(section, field, value)
   * contract used by the profile forms.
   */
  function updateSection<
    Section extends EditableProfileSection,
    Field extends keyof ProfileState[Section],
  >(
    section: Section,
    field: Field,
    value: ProfileState[Section][Field]
  ) {
    setProfile((prev) => ({
      ...prev,

      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  return {
    updateField,
    updateSection,
  };
}
