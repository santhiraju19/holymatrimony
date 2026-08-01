
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import privacyService from "@/features/privacy/api/privacy.service";

import {
  PrivacySettings,
  UpdatePrivacySettingsRequest,
} from "@/features/privacy/types";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function usePrivacySettings() {
  const [settings, setSettings] =
    useState<PrivacySettings | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [saved, setSaved] =
    useState(false);

  const loadSettings =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await privacyService
            .getMySettings();

        setSettings(data);
      } catch (
        caughtError: unknown
      ) {
        setError(
          getApiErrorMessage(
            caughtError,
            "Unable to load privacy settings."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const updateSettings =
    useCallback(
      async (
        request: UpdatePrivacySettingsRequest
      ) => {
        setSaving(true);
        setSaved(false);
        setError(null);

        try {
          const updated =
            await privacyService
              .updateMySettings(request);

          setSettings(updated);
          setSaved(true);

          window.setTimeout(() => {
            setSaved(false);
          }, 2500);
        } catch (
          caughtError: unknown
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to save privacy settings."
            )
          );

          throw caughtError;
        } finally {
          setSaving(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    saved,
    reload: loadSettings,
    updateSettings,
  };
}