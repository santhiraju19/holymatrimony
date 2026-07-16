"use client";

import { useProfile } from "../context/useProfile";
import { ProfileState } from "../types";

export function useProfileUpdater() {
  const { setProfile } = useProfile();

  function updateSection<
    T extends keyof ProfileState,
    K extends keyof ProfileState[T]
  >(
    section: T,
    field: K,
    value: ProfileState[T][K]
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
    updateSection,
  };
}