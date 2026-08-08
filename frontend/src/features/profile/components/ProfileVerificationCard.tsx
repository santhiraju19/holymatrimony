"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";

import type {
  ProfileVerificationStatus,
} from "@/features/profile/services/profile.service";

interface ProfileVerificationCardProps {
  status: ProfileVerificationStatus;
  completionPercentage: number;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reason?: string | null;
  submitting?: boolean;
  onSubmit: () => void | Promise<void>;
}

function formatDate(
  value?: string | null
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString();
}

export default function ProfileVerificationCard({
  status,
  completionPercentage,
  submittedAt,
  reviewedAt,
  reason,
  submitting = false,
  onSubmit,
}: ProfileVerificationCardProps) {
  const profileComplete =
    completionPercentage >= 100;

  const formattedSubmittedAt =
    formatDate(submittedAt);

  const formattedReviewedAt =
    formatDate(reviewedAt);

  if (status === "APPROVED") {
    return (
      <div className="rounded-[26px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
          <CheckCircle2 size={23} />
        </div>

        <h3 className="mt-4 text-lg font-black text-emerald-900">
          Verified Profile
        </h3>

        <p className="mt-2 text-sm leading-6 text-emerald-800/80">
          Your profile has been reviewed and
          approved by Holy Matrimony.
        </p>

        {formattedReviewedAt && (
          <p className="mt-4 text-xs font-semibold text-emerald-700">
            Verified {formattedReviewedAt}
          </p>
        )}

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <ShieldCheck size={14} />
          Holy Matrimony Verified
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
          <Clock3 size={23} />
        </div>

        <h3 className="mt-4 text-lg font-black text-amber-900">
          Verification Under Review
        </h3>

        <p className="mt-2 text-sm leading-6 text-amber-800/80">
          Your profile has been submitted.
          Our verification team will review
          the information you provided.
        </p>

        {formattedSubmittedAt && (
          <p className="mt-4 text-xs font-semibold text-amber-700">
            Submitted {formattedSubmittedAt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-700">
          <Loader2
            size={15}
            className="animate-spin"
          />

          Waiting for admin review
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-[26px] border border-red-200 bg-gradient-to-br from-red-50 via-white to-orange-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
          <AlertCircle size={23} />
        </div>

        <h3 className="mt-4 text-lg font-black text-red-900">
          Verification Needs Attention
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-800/80">
          Your profile was not approved.
          Please review the feedback, update
          your profile and submit it again.
        </p>

        {reason && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-500">
              Admin feedback
            </p>

            <p className="mt-2 text-sm leading-6 text-red-800">
              {reason}
            </p>
          </div>
        )}

        {formattedReviewedAt && (
          <p className="mt-3 text-xs font-semibold text-red-600">
            Reviewed {formattedReviewedAt}
          </p>
        )}

        <button
          type="button"
          disabled={
            submitting ||
            !profileComplete
          }
          onClick={() => void onSubmit()}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Resubmitting...
            </>
          ) : (
            <>
              <RotateCcw size={17} />
              Resubmit for Verification
            </>
          )}
        </button>

        {!profileComplete && (
          <p className="mt-3 text-center text-xs font-semibold text-red-600">
            Complete your profile before
            resubmitting.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-md">
        <ShieldCheck size={23} />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#0B2D5C]">
        Profile Verification
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Complete your profile and submit it
        for review to receive the Holy
        Matrimony verified profile status.
      </p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Completion
          </span>

          <span
            className={`text-sm font-black ${
              profileComplete
                ? "text-emerald-600"
                : "text-[#0B2D5C]"
            }`}
          >
            {completionPercentage}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#0B2D5C] transition-all"
            style={{
              width: `${Math.min(
                completionPercentage,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      <button
        type="button"
        disabled={
          submitting ||
          !profileComplete
        }
        onClick={() => void onSubmit()}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2
              size={17}
              className="animate-spin"
            />
            Submitting...
          </>
        ) : (
          <>
            <Send size={17} />
            Submit for Verification
          </>
        )}
      </button>

      {!profileComplete && (
        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
          Complete your profile to 100% to
          enable verification submission.
        </p>
      )}
    </div>
  );
}