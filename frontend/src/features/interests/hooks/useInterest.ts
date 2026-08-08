"use client";

import { useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { interestService } from "../services/interest.service";

export default function useInterest() {
  const [loading, setLoading] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function sendInterest(
    receiverProfileId: string,
    memberName: string,
    message?: string
  ): Promise<void> {
    if (loading || sent) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await interestService.send(
        receiverProfileId,
        message
      );

      setSent(true);

      alert(
        `Interest sent successfully to ${memberName}.`
      );
    } catch (caughtError: unknown) {
      const messageText =
        getApiErrorMessage(
          caughtError,
          "Unable to send interest."
        );

      setError(messageText);
      alert(messageText);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    sent,
    error,
    sendInterest,
  };
}
