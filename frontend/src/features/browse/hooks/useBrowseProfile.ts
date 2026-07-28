
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getBrowseProfileById } from "../api/browseApi";
import { BrowseProfile } from "../types";

interface UseBrowseProfileReturn {
  profile: BrowseProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBrowseProfile(
  profileId: string | null | undefined
): UseBrowseProfileReturn {
  const [profile, setProfile] =
    useState<BrowseProfile | null>(null);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!profileId) {
      setProfile(null);
      setError("Profile ID is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        await getBrowseProfileById(profileId);

      setProfile(result);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the profile.";

      setProfile(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

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

export default useBrowseProfile;
