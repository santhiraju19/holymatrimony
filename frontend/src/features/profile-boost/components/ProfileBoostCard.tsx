"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  Rocket,
  Sparkles,
} from "lucide-react";

import profileBoostService, {
  ProfileBoostStatus,
} from "../services/profileBoost.service";

function formatRemainingTime(
  minutes: number
): string {
  if (minutes <= 0) {
    return "Ending soon";
  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (hours <= 0) {
    return `${remainingMinutes}m remaining`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h remaining`;
  }

  return `${hours}h ${remainingMinutes}m remaining`;
}

function getErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response =
      (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return "Unable to update your profile boost right now.";
}

export default function ProfileBoostCard() {
  const [
    status,
    setStatus,
  ] =
    useState<ProfileBoostStatus | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    activating,
    setActivating,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const loadStatus =
    useCallback(async () => {
      try {
        setError(null);

        const result =
          await profileBoostService.getStatus();

        setStatus(result);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function handleActivate() {
    if (
      activating ||
      status?.active
    ) {
      return;
    }

    try {
      setActivating(true);
      setError(null);

      const result =
        await profileBoostService.activate();

      setStatus(result);
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[190px] items-center justify-center rounded-[20px] border border-violet-100 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
        <div className="text-center">
          <Loader2
            size={24}
            className="mx-auto animate-spin text-violet-600"
          />

          <p className="mt-3 text-xs font-semibold text-slate-500">
            Checking profile boost...
          </p>
        </div>
      </section>
    );
  }

  if (!status?.eligible) {
    return (
      <section className="overflow-hidden rounded-[20px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50/60 p-5 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
            <Rocket size={20} />
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-600">
              Premium Visibility
            </p>

            <h2 className="mt-0.5 text-lg font-black text-[#0B2D5C]">
              Profile Boost
            </h2>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-600">
          Get higher visibility in Recommended
          profiles and help more compatible
          members discover you.
        </p>

        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-xs font-bold text-amber-800">
            Profile Boost is available with
            Gold and Platinum memberships.
          </p>
        </div>

        <Link
          href="/membership"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#0B2D5C] px-4 py-3 text-xs font-black text-white transition hover:bg-[#123f78]"
        >
          View Membership Plans
        </Link>

        {error && (
          <p className="mt-3 text-xs font-semibold text-rose-600">
            {error}
          </p>
        )}
      </section>
    );
  }

  if (status.active) {
    return (
      <section className="overflow-hidden rounded-[20px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/60 p-5 shadow-[0_10px_30px_rgba(124,58,237,0.10)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
              <Rocket size={20} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-600">
                Premium Visibility
              </p>

              <h2 className="mt-0.5 text-lg font-black text-[#0B2D5C]">
                Profile Boost
              </h2>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-black text-white">
            <Sparkles size={11} />
            ACTIVE
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-violet-100 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-violet-700">
            <CheckCircle2 size={17} />

            <p className="text-sm font-black">
              Your profile is boosted
            </p>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Your profile is receiving increased
            visibility in Recommended profiles.
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock3
              size={14}
              className="text-violet-600"
            />

            {formatRemainingTime(
              status.remainingMinutes
            )}
          </div>
        </div>

        {status.expiresAt && (
          <p className="mt-3 text-[10px] font-medium text-slate-400">
            Boost expires{" "}
            {new Date(
              status.expiresAt
            ).toLocaleString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              }
            )}
          </p>
        )}

        {error && (
          <p className="mt-3 text-xs font-semibold text-rose-600">
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[20px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50/60 p-5 shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
          <Rocket size={20} />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-600">
            Premium Visibility
          </p>

          <h2 className="mt-0.5 text-lg font-black text-[#0B2D5C]">
            Profile Boost
          </h2>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-600">
        Put your profile higher in Recommended
        results for the next 24 hours and increase
        your visibility to compatible members.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2.5">
        <Sparkles
          size={15}
          className="text-violet-600"
        />

        <p className="text-xs font-bold text-violet-800">
          Gold / Platinum benefit
        </p>
      </div>

      <button
        type="button"
        onClick={handleActivate}
        disabled={activating}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {activating ? (
          <>
            <Loader2
              size={15}
              className="animate-spin"
            />
            Activating Boost...
          </>
        ) : (
          <>
            <Rocket size={15} />
            Boost My Profile for 24 Hours
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </section>
  );
}
