"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ProfileState } from "../types";
import {
  saveDraft,
  loadDraft,
  clearDraft,
} from "../utils/profileStorage";

type SaveStatus = "idle" | "saving" | "saved";

export function useProfileRecovery(
  profile: ProfileState
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] =
    useState<SaveStatus>("idle");

  /**
   * Restore draft from localStorage
   */
  const restoreDraft = useCallback(() => {
    const draft = loadDraft();

    if (!draft) {
      return null;
    }

    return draft.data;
  }, []);

  /**
   * Clear draft
   */
  const removeDraft = useCallback(() => {
    clearDraft();
  }, []);

  /**
   * Auto Save (Debounced)
   */
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setStatus("saving");

    timerRef.current = setTimeout(() => {
      saveDraft(profile);

      setStatus("saved");
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [profile]);

  return {
    restoreDraft,
    removeDraft,
    saveStatus: status,
  };
}