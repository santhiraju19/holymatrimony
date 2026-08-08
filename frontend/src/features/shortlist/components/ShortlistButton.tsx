"use client";

import {
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";

import useShortlist from "../hooks/useShortlist";

interface ShortlistButtonProps {
  profileId: string;
  memberName: string;
  className?: string;
}

export default function ShortlistButton({
  profileId,
  memberName,
  className,
}: ShortlistButtonProps) {
  const {
    shortlisted,
    checkingStatus,
    updating,
    toggleShortlist,
  } = useShortlist(
    profileId,
    memberName
  );

  const loading =
    checkingStatus || updating;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        void toggleShortlist();
      }}
      aria-pressed={shortlisted}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
        shortlisted
          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
          : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
        className ?? "",
      ].join(" ")}
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />

          {checkingStatus
            ? "Checking..."
            : "Updating..."}
        </>
      ) : shortlisted ? (
        <>
          <BookmarkCheck size={18} />
          Shortlisted
        </>
      ) : (
        <>
          <Bookmark size={18} />
          Shortlist Profile
        </>
      )}
    </button>
  );
}