"use client";

import {
  useState,
} from "react";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  interestService,
} from "../services/interest.service";

export default function useInterest() {
  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    sent,
    setSent,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function sendInterest(
    receiverProfileId: string,
    message?: string
  ): Promise<boolean> {
    if (
      loading ||
      sent
    ) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await interestService.send(
        receiverProfileId,
        message
      );

      setSent(true);

      return true;

    } catch (
      caughtError:
        unknown
    ) {
      const messageText =
        getApiErrorMessage(
          caughtError,
          "Unable to send interest."
        );

      setError(
        messageText
      );

      return false;

    } finally {
      setLoading(false);
    }
  }

  function clearError(): void {
    setError(
      null
    );
  }

  return {
    loading,
    sent,
    error,
    sendInterest,
    clearError,
  };
}
