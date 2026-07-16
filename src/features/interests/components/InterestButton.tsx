"use client";

import { Heart, Loader2 } from "lucide-react";
import useInterest from "../hooks/useInterest";

interface Props {
  memberId: number;
  memberName: string;
}

export default function InterestButton({
  memberId,
  memberName,
}: Props) {
  const { loading, sendInterest } = useInterest();

  return (
    <button
      disabled={loading}
      onClick={() => sendInterest(memberId, memberName)}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73] disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          Sending...
        </>
      ) : (
        <>
          <Heart size={18} />
          Send Interest
        </>
      )}
    </button>
  );
}