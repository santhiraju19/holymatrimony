"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Crown,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";

import useWhoViewedMe from "../hooks/useWhoViewedMe";

import type {
  ProfileViewer,
} from "../types";

function formatLocation(
  viewer: ProfileViewer
): string {
  return [
    viewer.city,
    viewer.state,
    viewer.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatViewedTime(
  value: string
): string {
  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference / 60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function isMembershipError(
  error: string
): boolean {
  const normalized =
    error.toLowerCase();

  return (
    normalized.includes(
      "upgrade"
    ) ||
    normalized.includes(
      "membership"
    ) ||
    normalized.includes(
      "who viewed"
    )
  );
}

function ViewerCard({
  viewer,
}: {
  viewer: ProfileViewer;
}) {
  const location =
    formatLocation(viewer);

  return (
    <Link
      href={`/profile/${viewer.profileId}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {viewer.primaryPhotoUrl ? (
          <Image
            src={
              viewer.primaryPhotoUrl
            }
            alt={
              viewer.fullName ||
              "Member profile"
            }
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <UserRound
              size={70}
              className="text-slate-400"
            />
          </div>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-[#071B36]/85 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur">
          <Eye size={14} />

          {viewer.viewCount === 1
            ? "Viewed once"
            : `Viewed ${viewer.viewCount} times`}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-[#071B36]">
              {viewer.fullName ||
                "Holy Matrimony Member"}
            </h3>

            {viewer.age != null && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {viewer.age} years
              </p>
            )}
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#A77C11] transition group-hover:bg-[#D4AF37] group-hover:text-[#071B36]">
            <ArrowRight
              size={18}
            />
          </div>
        </div>

        {location && (
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-[#D4AF37]"
            />

            <span>
              {location}
            </span>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <Clock3
            size={15}
            className="text-slate-400"
          />

          Viewed{" "}
          {formatViewedTime(
            viewer.lastViewedAt
          )}
        </div>
      </div>
    </Link>
  );
}

function UpgradeState() {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[#D4AF37]/30 bg-white shadow-xl">
      <div className="relative overflow-hidden bg-[#071B36] px-6 py-12 text-center text-white sm:px-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#D4AF37]/20 blur-3xl" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#F0D576] to-[#B88A18] text-[#071B36] shadow-xl">
          <Crown size={30} />
        </div>

        <div className="relative mt-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#E8CB6A]">
            Premium feature
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            See who viewed your profile
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Discover members who are
            showing interest in your
            profile and connect with
            promising matches sooner.
          </p>
        </div>

        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/membership"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F0D576] px-6 py-3 text-sm font-black text-[#071B36] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Sparkles size={17} />
            View Membership Plans
          </Link>

          <Link
            href="/browse"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Browse Profiles
          </Link>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
        {[
          [
            "Visitor insights",
            "See members who recently viewed your profile.",
          ],
          [
            "View frequency",
            "Know when someone has visited your profile multiple times.",
          ],
          [
            "Connect sooner",
            "Open their profile and decide whether you want to connect.",
          ],
        ].map(
          ([
            title,
            description,
          ]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <Eye
                size={20}
                className="text-[#B58A18]"
              />

              <h3 className="mt-3 font-black text-[#071B36]">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function WhoViewedMePage() {
  const {
    viewers,

    page,
    totalElements,
    totalPages,

    hasNext,
    hasPrevious,

    loading,
    error,

    nextPage,
    previousPage,
    goToPage,

    refresh,
  } = useWhoViewedMe({
    pageSize: 12,
  });

  const membershipRestricted =
    error
      ? isMembershipError(
          error
        )
      : false;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-[32px] bg-[#071B36] px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#E8CB6A]">
              <Eye size={16} />
              Profile activity
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Who Viewed Me
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Discover members who
              recently visited your
              profile and explore
              potential connections.
            </p>
          </div>

          {!membershipRestricted && (
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-2xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          )}
        </div>
      </section>

      <div className="mt-7">
        {loading &&
        viewers.length === 0 ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#D4AF37]" />

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Loading profile
                visitors...
              </p>
            </div>
          </div>
        ) : membershipRestricted ? (
          <UpgradeState />
        ) : error ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="font-bold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#071B36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C73]"
            >
              <RefreshCw
                size={16}
              />
              Try Again
            </button>
          </div>
        ) : viewers.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D4AF37]/10 text-[#B58A18]">
              <Eye size={30} />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#071B36]">
              No profile views yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              When members visit your
              profile, they will appear
              here.
            </p>

            <Link
              href="/profile"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#071B36] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#123C73]"
            >
              Improve My Profile
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-black text-[#071B36]">
                  {totalElements}{" "}
                  {totalElements === 1
                    ? "member"
                    : "members"}{" "}
                  viewed your profile
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Most recent visitors
                  appear first.
                </p>
              </div>

              {totalPages > 1 && (
                <p className="text-xs font-semibold text-slate-500">
                  Page {page + 1} of{" "}
                  {totalPages}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {viewers.map(
                (viewer) => (
                  <ViewerCard
                    key={
                      viewer.profileId
                    }
                    viewer={
                      viewer
                    }
                  />
                )
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={
                    previousPage
                  }
                  disabled={
                    loading ||
                    !hasPrevious
                  }
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#071B36] shadow-sm transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft
                    size={16}
                  />
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index
                )
                  .slice(
                    Math.max(
                      0,
                      page - 2
                    ),
                    Math.min(
                      totalPages,
                      page + 3
                    )
                  )
                  .map(
                    (
                      pageNumber
                    ) => (
                      <button
                        key={
                          pageNumber
                        }
                        type="button"
                        onClick={() =>
                          goToPage(
                            pageNumber
                          )
                        }
                        disabled={
                          loading
                        }
                        className={[
                          "h-11 min-w-11 rounded-xl px-3 text-sm font-black transition",
                          pageNumber ===
                          page
                            ? "bg-[#D4AF37] text-[#071B36] shadow-md"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-[#D4AF37]",
                        ].join(
                          " "
                        )}
                      >
                        {pageNumber +
                          1}
                      </button>
                    )
                  )}

                <button
                  type="button"
                  onClick={
                    nextPage
                  }
                  disabled={
                    loading ||
                    !hasNext
                  }
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#071B36] shadow-sm transition hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight
                    size={16}
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}