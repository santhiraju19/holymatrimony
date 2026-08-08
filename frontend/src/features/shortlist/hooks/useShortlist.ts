"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getApiErrorMessage } from "@/lib/api";

import { shortlistService } from "../services/shortlist.service";

interface UseShortlistResult {
  shortlisted: boolean;
  checkingStatus: boolean;
  updating: boolean;
  error: string | null;
  toggleShortlist: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export default function useShortlist(
  profileId: string,
  memberName: string
): UseShortlistResult {
  const [
    shortlisted,
    setShortlisted,
  ] = useState(false);

  const [
    checkingStatus,
    setCheckingStatus,
  ] = useState(true);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refreshStatus =
    useCallback(async (): Promise<void> => {
      if (!profileId.trim()) {
        setCheckingStatus(false);
        return;
      }

      setCheckingStatus(true);
      setError(null);

      try {
        const status =
          await shortlistService.getStatus(
            profileId
          );

        setShortlisted(
          Boolean(status.shortlisted)
        );
      } catch (caughtError: unknown) {
        setError(
          getApiErrorMessage(
            caughtError,
            "Unable to check shortlist status."
          )
        );
      } finally {
        setCheckingStatus(false);
      }
    }, [profileId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  async function toggleShortlist(): Promise<void> {
    if (
      updating ||
      checkingStatus
    ) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      if (shortlisted) {
        await shortlistService.remove(
          profileId
        );

        setShortlisted(false);

        alert(
          `${memberName} was removed from your shortlist.`
        );
      } else {
        await shortlistService.add(
          profileId
        );

        setShortlisted(true);

        alert(
          `${memberName} was added to your shortlist.`
        );
      }
    } catch (caughtError: unknown) {
      const message =
        getApiErrorMessage(
          caughtError,
          shortlisted
            ? "Unable to remove this profile from your shortlist."
            : "Unable to shortlist this profile."
        );

      setError(message);
      alert(message);
    } finally {
      setUpdating(false);
    }
  }

  return {
    shortlisted,
    checkingStatus,
    updating,
    error,
    toggleShortlist,
    refreshStatus,
  };
}