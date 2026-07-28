
"use client";

import Link from "next/link";

import useBrowseProfile from "../hooks/useBrowseProfile";

import ProfileDetailsContent from "./details/ProfileDetailsContent";
import ProfileDetailsHeader from "./details/ProfileDetailsHeader";
import ProfileDetailsSkeleton from "./details/ProfileDetailsSkeleton";

interface ProfileDetailsPageProps {
  profileId: string;
}

export default function ProfileDetailsPage({
  profileId,
}: ProfileDetailsPageProps) {
  const {
    profile,
    loading,
    error,
    refresh,
  } = useBrowseProfile(profileId);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProfileDetailsSkeleton />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Unable to load profile
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Try again
            </button>

            <Link
              href="/browse"
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to profiles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Profile not found
          </h1>

          <Link
            href="/browse"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Browse profiles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProfileDetailsHeader
          profile={profile}
        />

        <ProfileDetailsContent
          profile={profile}
        />
      </div>
    </main>
  );
}