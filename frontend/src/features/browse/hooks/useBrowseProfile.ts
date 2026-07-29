"use client";

import { useCallback, useEffect, useState } from "react";

import { getBrowseProfileById } from "../api/browseApi";
import type { BrowseProfile } from "../types";

interface UseBrowseProfileReturn {
  profile: BrowseProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export default function useBrowseProfile(
  profileId: string
): UseBrowseProfileReturn {
  const [profile, setProfile] =
    useState<BrowseProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const loadProfile = useCallback(
    async (): Promise<void> => {
      if (!profileId.trim()) {
        setProfile(null);
        setError("Profile ID is required.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await getBrowseProfileById(profileId);

        setProfile(result);
      } catch (caughtError: unknown) {
        setProfile(null);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    },
    [profileId]
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refresh: loadProfile,
  };
}