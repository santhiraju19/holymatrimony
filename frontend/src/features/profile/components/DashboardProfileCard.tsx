
"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { useProfile } from "../context/useProfile";
import { useProfileApi } from "../hooks/useProfileApi";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import { ProfileState } from "../types";

export default function DashboardProfileCard() {
  const {
    basicInfo,
    churchInfo,
    educationInfo,
    familyInfo,
    preferenceInfo,
    locationInfo,
    aboutInfo,
    photoInfo,
  } = useProfile();

  const {
    loading,
    error,
    loadProfile,
  } = useProfileApi();

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const profile = useMemo<ProfileState>(
    () => ({
      basicInfo,
      churchInfo,
      educationInfo,
      familyInfo,
      preferenceInfo,
      locationInfo,
      aboutInfo,
      photoInfo,
    }),
    [
      basicInfo,
      churchInfo,
      educationInfo,
      familyInfo,
      preferenceInfo,
      locationInfo,
      aboutInfo,
      photoInfo,
    ],
  );

  const completion = useMemo(
    () => calculateProfileCompletion(profile),
    [profile],
  );

  const nextPendingSection =
    completion.pending.length > 0
      ? completion.pending[0]
      : null;

  const progressColor =
    completion.percentage === 100
      ? "bg-emerald-500"
      : completion.percentage >= 67
        ? "bg-[#D4AF37]"
        : "bg-amber-500";

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-72 max-w-full rounded bg-slate-100" />
          <div className="h-3 w-full rounded-full bg-slate-100" />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                👤
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0B2D5C]">
                  Profile Completion
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete profiles receive better visibility and more relevant
                  matches.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0B2D5C] px-5 py-3 text-center text-white">
            <p className="text-2xl font-bold">
              {completion.percentage}%
            </p>

            <p className="text-xs text-slate-200">
              Completed
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{
                width: `${completion.percentage}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>
              {completion.completed.length} of{" "}
              {completion.completed.length +
                completion.pending.length} sections completed
            </span>

            <span>
              {completion.percentage === 100
                ? "Profile complete"
                : "Keep going"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">
            Completed Sections
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {completion.completed.length}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-700">
            Remaining Sections
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-800">
            {completion.pending.length}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">
            Profile Photos
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-800">
            {photoInfo.photos.length}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-5">
        {error ? (
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-red-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-red-700">
                Unable to refresh profile
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadProfile()}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        ) : completion.percentage === 100 ? (
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-emerald-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-emerald-800">
                🎉 Your profile is complete
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Your profile is ready to receive better match recommendations.
              </p>
            </div>

            <Link
              href="/profile"
              className="rounded-xl bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Review Profile
            </Link>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-amber-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-amber-800">
                Next: {nextPendingSection}
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Complete the remaining profile sections to improve trust and
                match quality.
              </p>
            </div>

            <Link
              href="/profile"
              className="rounded-xl bg-[#0B2D5C] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#123C73]"
            >
              Continue Profile
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}