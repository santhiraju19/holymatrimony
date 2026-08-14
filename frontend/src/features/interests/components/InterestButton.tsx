"use client";

import {
  CheckCircle2,
  Heart,
  Loader2,
} from "lucide-react";

import useInterest from "../hooks/useInterest";

interface Props {
  receiverProfileId: string;
  memberName: string;
  message?: string;
}

export default function InterestButton({
  receiverProfileId,
  memberName,
  message,
}: Props) {
  const {
    loading,
    sent,
    sendInterest,
  } = useInterest();

  return (
    <button
      type="button"
      disabled={loading || sent}
    onClick={(event) => {
  event.preventDefault();
  event.stopPropagation();

  void sendInterest(
    receiverProfileId,
    memberName,
    message
  );
}}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition",
        sent
          ? "cursor-default bg-emerald-600"
          : "bg-[#0B2D5C] hover:bg-[#123C73]",
        "disabled:opacity-70",
      ].join(" ")}
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          Sending...
        </>
      ) : sent ? (
        <>
          <CheckCircle2 size={18} />
          Interest Sent
        </>
      ) : (
        <>
          <Heart size={18} />
          Express Interest
        </>
      )}
    </button>
  );
}
