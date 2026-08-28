"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  ProfileVerificationStatus,
} from "@/features/profile/services/profile.service";

interface ProfileVerificationBannerProps {
  status: ProfileVerificationStatus;
  completionPercentage: number;
  profileCompleted: boolean;
  reason?: string | null;
  loading?: boolean;
}

export default function ProfileVerificationBanner({
  status,
  completionPercentage,
  profileCompleted,
  reason,
  loading = false,
}: ProfileVerificationBannerProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-44 rounded bg-slate-200" />
        <div className="mt-3 h-4 max-w-xl rounded bg-slate-100" />
      </div>
    );
  }

  /*
   * Approved profiles should not receive a large warning.
   * Keep the dashboard clean once verification is complete.
   */

  if (
    status ===
    "APPROVED"
  ) {
    return (
      <div className="flex flex-col gap-3 rounded-[20px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-green-50 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck
              size={21}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-black text-emerald-900">
                Profile Verified
              </h2>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                Approved
              </span>
            </div>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Your Holy Matrimony profile has been reviewed and approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Pending
   */

  if (
    status ===
    "PENDING"
  ) {
    return (
      <div className="overflow-hidden rounded-[22px] border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-yellow-50 shadow-[0_12px_35px_rgba(245,158,11,0.12)]">
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

        <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
              <Clock3
                size={23}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-[#0B2D5C] sm:text-lg">
                  Verification in Progress
                </h2>

                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                  Under Review
                </span>
              </div>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                Your profile has been submitted successfully and is waiting for administrator review. No further action is required right now.
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-black text-amber-800 shadow-sm transition hover:bg-amber-50"
          >
            View Profile

            <ArrowRight
              size={16}
            />
          </Link>
        </div>
      </div>
    );
  }

  /*
   * Rejected
   *
   * This is intentionally the strongest dashboard state because
   * the member must review administrator feedback and resubmit.
   */

  if (
    status ===
    "REJECTED"
  ) {
    return (
      <div className="overflow-hidden rounded-[22px] border-2 border-rose-300 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-[0_14px_40px_rgba(225,29,72,0.14)]">
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                <ShieldAlert
                  size={25}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-rose-900">
                    Verification Needs Attention
                  </h2>

                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700 ring-1 ring-rose-200">
                    Action Required
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-700">
                  Your profile could not be approved. Review the feedback below, correct the necessary information and submit your profile again.
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-rose-700"
            >
              Review & Resubmit

              <ArrowRight
                size={17}
              />
            </Link>
          </div>

          {reason?.trim() && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-white/90 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={19}
                  className="mt-0.5 shrink-0 text-rose-600"
                />

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">
                    Review Feedback
                  </p>

                  <p className="mt-1.5 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">
                    {reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
            <Sparkles
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>
              Open your profile, update the requested fields, save your changes and use the verification section below Save My Profile to resubmit.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Not submitted + incomplete
   */

  if (
    !profileCompleted
  ) {
    const safePercentage =
      Math.min(
        Math.max(
          completionPercentage,
          0
        ),
        100
      );

    return (
      <div className="overflow-hidden rounded-[22px] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-[#0B2D5C] to-blue-500" />

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-md">
                <ShieldCheck
                  size={22}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black text-[#0B2D5C] sm:text-lg">
                    Complete Your Profile for Verification
                  </h2>

                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                    Not Submitted
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                  Complete the required profile information before submitting your profile for review.
                </p>

                <div className="mt-3 max-w-md">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>
                      Profile completion
                    </span>

                    <span>
                      {safePercentage}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] to-blue-500 transition-all"
                      style={{
                        width: `${safePercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#123f79]"
            >
              Complete Profile

              <ArrowRight
                size={17}
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Not submitted + complete
   */

  return (
    <div className="overflow-hidden rounded-[22px] border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-amber-50 shadow-[0_12px_35px_rgba(16,185,129,0.11)]">
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-[#D4AF37]" />

      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
            <CheckCircle2
              size={23}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-[#0B2D5C] sm:text-lg">
                Your Profile Is Ready for Verification
              </h2>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                Ready
              </span>
            </div>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              Your required profile information is complete. Review your details, save any latest changes and submit your profile for verification.
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-700"
        >
          Review & Submit

          <ArrowRight
            size={17}
          />
        </Link>
      </div>
    </div>
  );
}
