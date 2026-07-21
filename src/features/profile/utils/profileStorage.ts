import {
  PROFILE_DRAFT_KEY,
  PROFILE_DRAFT_VERSION,
} from "../constants";

import { ProfileState } from "../types";

export interface ProfileDraft {
  version: number;
  updatedAt: number;
  data: ProfileState;
}

export function saveDraft(
  profile: ProfileState
): void {
  try {
    const draft: ProfileDraft = {
      version: PROFILE_DRAFT_VERSION,
      updatedAt: Date.now(),
      data: profile,
    };

    localStorage.setItem(
      PROFILE_DRAFT_KEY,
      JSON.stringify(draft)
    );
  } catch (error) {
    console.error(
      "Failed to save profile draft",
      error
    );
  }
}

export function loadDraft():
  | ProfileDraft
  | null {
  try {
    const stored =
      localStorage.getItem(PROFILE_DRAFT_KEY);

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(
      "Failed to load profile draft",
      error
    );
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(
    PROFILE_DRAFT_KEY
  );
}

export function hasDraft(): boolean {
  return (
    localStorage.getItem(
      PROFILE_DRAFT_KEY
    ) !== null
  );
}