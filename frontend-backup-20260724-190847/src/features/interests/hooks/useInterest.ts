"use client";

import { useState } from "react";
import { interestService } from "../services/interest.service";

export default function useInterest() {
  const [loading, setLoading] = useState(false);

  async function sendInterest(
    memberId: number,
    memberName: string
  ) {
    setLoading(true);

    await interestService.send(
      memberId,
      memberName
    );

    setLoading(false);

    alert("Interest Sent ❤️");
  }

  return {
    loading,
    sendInterest,
  };
}