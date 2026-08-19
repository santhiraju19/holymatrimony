"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
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

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
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
  const safeCompletion =
    Math.min(
      Math.max(
        completionPercentage,
        0
      ),
      100
    );

  const profileComplete =
    safeCompletion >= 100;

  const formattedSubmittedAt =
    formatDate(
      submittedAt
    );

  const formattedReviewedAt =
    formatDate(
      reviewedAt
    );

  if (
    status === "APPROVED"
  ) {
    return (
      <section className="overflow-hidden rounded-[18px] border border-emerald-200 bg-white shadow-[0_7px_22px_rgba(15,23,42,0.045)]">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3.5 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <CheckCircle2
                size={16}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-emerald-100">
                Verification status
              </p>

              <h3 className="text-sm font-black">
                Verified Profile
              </h3>
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <p className="text-[11px] leading-5 text-slate-600">
            Your profile has been reviewed and approved by Holy Matrimony.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
            <ShieldCheck
              size={11}
            />

            Holy Matrimony Verified
          </div>

          {formattedReviewedAt && (
            <p className="mt-2.5 text-[9px] font-semibold text-slate-400">
              Verified{" "}
              {formattedReviewedAt}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (
    status === "PENDING"
  ) {
    return (
      <section className="overflow-hidden rounded-[18px] border border-amber-200 bg-white shadow-[0_7px_22px_rgba(15,23,42,0.045)]">
        <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-3.5 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Clock3
                size={16}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-amber-100">
                Verification status
              </p>

              <h3 className="text-sm font-black">
                Under Review
              </h3>
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <p className="text-[11px] leading-5 text-slate-600">
            Your profile has been submitted and is waiting for verification review.
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-2.5 py-2 text-[10px] font-bold text-amber-700">
            <Loader2
              size={12}
              className="shrink-0 animate-spin"
            />

            Waiting for admin review
          </div>

          {formattedSubmittedAt && (
            <p className="mt-2.5 text-[9px] font-semibold text-slate-400">
              Submitted{" "}
              {formattedSubmittedAt}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (
    status === "REJECTED"
  ) {
    return (
      <section className="overflow-hidden rounded-[18px] border border-red-200 bg-white shadow-[0_7px_22px_rgba(15,23,42,0.045)]">
        <div className="bg-gradient-to-r from-red-600 to-rose-500 px-3.5 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <AlertCircle
                size={16}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-red-100">
                Verification status
              </p>

              <h3 className="text-sm font-black">
                Needs Attention
              </h3>
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <p className="text-[11px] leading-5 text-slate-600">
            Review the feedback below, update your profile and resubmit it for verification.
          </p>

          {reason && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5">
              <p className="text-[8px] font-black uppercase tracking-[0.1em] text-red-500">
                Admin feedback
              </p>

              <p className="mt-1 text-[10px] leading-5 text-red-700">
                {reason}
              </p>
            </div>
          )}

          {formattedReviewedAt && (
            <p className="mt-2.5 text-[9px] font-semibold text-slate-400">
              Reviewed{" "}
              {formattedReviewedAt}
            </p>
          )}

          <button
            type="button"
            disabled={
              submitting ||
              !profileComplete
            }
            onClick={() =>
              void onSubmit()
            }
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-3 text-[11px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2
                  size={13}
                  className="animate-spin"
                />

                Resubmitting...
              </>
            ) : (
              <>
                <RotateCcw
                  size={13}
                />

                Resubmit Verification
              </>
            )}
          </button>

          {!profileComplete && (
            <p className="mt-2 text-center text-[9px] font-semibold leading-4 text-red-500">
              Complete all required profile information before resubmitting.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-blue-100 bg-white shadow-[0_7px_22px_rgba(15,23,42,0.045)]">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/50 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2D5C] text-white shadow-sm">
            <ShieldCheck
              size={15}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Sparkles
                size={9}
                className="text-[#B38B19]"
              />

              <p className="text-[8px] font-black uppercase tracking-[0.11em] text-[#B38B19]">
                Trust & safety
              </p>
            </div>

            <h3 className="mt-0.5 text-sm font-black text-[#0B2D5C]">
              Profile Verification
            </h3>
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <p className="text-[10px] leading-5 text-slate-500">
          Complete your required profile information and submit it for Holy Matrimony review.
        </p>

        {/* Completion */}
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/75 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
              Verification readiness
            </span>

            <span
              className={[
                "text-xs font-black",

                profileComplete
                  ? "text-emerald-600"
                  : "text-[#0B2D5C]",
              ].join(" ")}
            >
              {safeCompletion}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className={[
                "h-full rounded-full transition-all duration-300",

                profileComplete
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-[#0B2D5C] to-blue-600",
              ].join(" ")}
              style={{
                width: `${safeCompletion}%`,
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
          onClick={() =>
            void onSubmit()
          }
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-3 text-[11px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2
                size={13}
                className="animate-spin"
              />

              Submitting...
            </>
          ) : (
            <>
              <Send
                size={13}
              />

              Submit for Verification
            </>
          )}
        </button>

        {!profileComplete && (
          <p className="mt-2 text-center text-[9px] font-semibold leading-4 text-slate-400">
            Complete your required profile information to enable submission.
          </p>
        )}
      </div>
    </section>
  );
}
