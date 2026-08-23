"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Church,
  MapPin,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getToken,
} from "@/lib/auth";

import {
  resolvePhotoUrl,
} from "@/features/profile/services/photoService";

import type {
  RecommendedMatch,
} from "@/features/dashboard/types";

interface RecommendedMatchesProps {
  matches?: RecommendedMatch[];
  loading?: boolean;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

const API_BASE_URL =
  (
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1"
  ).replace(/\/$/, "");

function getInitials(
  name: string
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) =>
      part.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeScore(
  value: number | null | undefined
): number {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      Math.round(value),
      100
    )
  );
}

function MatchSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
      <div className="aspect-[5/3] animate-pulse bg-slate-200" />

      <div className="space-y-2.5 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="h-9 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function RecommendedMatches({
  matches: initialMatches = [],
  loading: externalLoading = false,
}: RecommendedMatchesProps) {
  const [
    matches,
    setMatches,
  ] = useState<RecommendedMatch[]>(
    initialMatches
  );

  const [
    loading,
    setLoading,
  ] = useState(
    externalLoading ||
      initialMatches.length === 0
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (
      externalLoading ||
      initialMatches.length > 0
    ) {
      setMatches(
        initialMatches
      );

      setLoading(
        externalLoading
      );

      return;
    }

    let cancelled = false;

    async function loadRecommendations() {
      setLoading(true);
      setError(null);

      try {
        const token =
          getToken();

        if (!token) {
          if (!cancelled) {
            setMatches([]);
          }

          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/recommendations?limit=6`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `Unable to load recommendations (${response.status})`
          );
        }

        const payload =
          (
            await response.json()
          ) as
            | ApiEnvelope<
                RecommendedMatch[]
              >
            | RecommendedMatch[];

        const data =
          Array.isArray(payload)
            ? payload
            : Array.isArray(
                  payload.data
                )
              ? payload.data
              : [];

        if (!cancelled) {
          setMatches(
            data
          );
        }
      } catch (loadError) {
        console.error(
          "Unable to load recommended matches",
          loadError
        );

        if (!cancelled) {
          setMatches([]);

          setError(
            "Recommendations are temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [
    externalLoading,
    initialMatches,
  ]);

  const rankedMatches =
    useMemo(
      () =>
        [...matches].sort(
          (left, right) =>
            normalizeScore(
              right.compatibilityScore
            ) -
            normalizeScore(
              left.compatibilityScore
            )
        ),
      [matches]
    );

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
      {/* Header */}

      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-[#F2D675] shadow-sm">
            <UsersRound
              size={17}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={11}
                className="text-[#B38B19]"
              />

              <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19] sm:text-[10px]">
                Suggested for you
              </p>
            </div>

            <h2 className="mt-0.5 text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
              Recommended Matches
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              Personalized using mutual partner preferences.
            </p>
          </div>
        </div>

        <Link
          href="/search"
          className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-white px-3.5 text-xs font-bold text-[#0B2D5C] shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
        >
          View All

          <ArrowRight
            size={14}
          />
        </Link>
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            <MatchSkeleton />
            <MatchSkeleton />
            <MatchSkeleton />
          </div>
        ) : error ? (
          <div className="rounded-[18px] border border-amber-200 bg-amber-50/70 px-4 py-4">
            <p className="text-sm font-bold text-amber-900">
              {error}
            </p>

            <Link
              href="/search"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#0B2D5C]"
            >
              Browse profiles

              <ArrowRight
                size={13}
              />
            </Link>
          </div>
        ) : rankedMatches.length === 0 ? (
          <div className="relative overflow-hidden rounded-[18px] border border-dashed border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/60 px-4 py-5 sm:px-5">
            <div className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-blue-200/25 blur-3xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-md">
                  <UsersRound
                    size={20}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-black text-[#0B2D5C] sm:text-base">
                    Find your next match
                  </h3>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                    Complete your partner preferences and browse suitable Christian profiles. Personalized recommendations will appear as matching data becomes available.
                  </p>
                </div>
              </div>

              <Link
                href="/search"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-4 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:text-sm"
              >
                <Search
                  size={15}
                />

                Search Profiles
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {rankedMatches.map(
              (match) => {
                const score =
                  normalizeScore(
                    match.compatibilityScore
                  );

                const resolvedImageUrl =
                  resolvePhotoUrl(
                    match.imageUrl
                  );

                return (
                  <article
                    key={match.id}
                    className="group overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_7px_22px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]"
                  >
                    <Link
                      href={`/browse/${match.id}`}
                      className="block"
                    >
                      <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B2D5C] via-blue-700 to-blue-400">
                        {resolvedImageUrl ? (
                          <Image
                            src={
                              resolvedImageUrl
                            }
                            unoptimized
                            alt={
                              match.name
                            }
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/15 text-xl font-black text-white backdrop-blur">
                            {getInitials(
                              match.name
                            ) || (
                              <UserRound
                                size={34}
                              />
                            )}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          {score > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-[#0B2D5C]/90 px-2.5 py-1 text-[10px] font-black text-[#F2D675] backdrop-blur">
                              <Sparkles
                                size={11}
                              />

                              {score}% Match
                            </span>
                          )}

                          {match.verified && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-500/90 px-2 py-1 text-[9px] font-black text-white backdrop-blur">
                              <CheckCircle2
                                size={11}
                              />

                              Verified
                            </span>
                          )}

                          {match.churchVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-[#D4AF37]/95 px-2 py-1 text-[9px] font-black text-[#071B36]">
                              <Church
                                size={11}
                              />

                              Church
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5 pt-10">
                          <h3 className="truncate text-lg font-black tracking-[-0.02em] text-white">
                            {match.name}

                            {match.age
                              ? `, ${match.age}`
                              : ""}
                          </h3>

                          {match.denomination && (
                            <p className="mt-0.5 truncate text-xs font-bold text-[#F2D675]">
                              {
                                match.denomination
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="p-3.5">
                      {score > 0 && (
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">
                              Compatibility
                            </span>

                            <span className="text-xs font-black text-[#0B2D5C]">
                              {score}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#0B2D5C]"
                              style={{
                                width:
                                  `${score}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <MatchDetail
                          icon={
                            <BriefcaseBusiness
                              size={14}
                            />
                          }
                          value={
                            match.profession ||
                            "Profession not specified"
                          }
                        />

                        <MatchDetail
                          icon={
                            <MapPin
                              size={14}
                            />
                          }
                          value={
                            match.location ||
                            "Location not specified"
                          }
                        />
                      </div>

                      <Link
                        href={`/browse/${match.id}`}
                        className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 text-xs font-black text-white transition hover:shadow-md"
                      >
                        View Profile

                        <ArrowRight
                          size={13}
                        />
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function MatchDetail({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </span>

      <span className="truncate text-xs font-semibold text-slate-600">
        {value}
      </span>
    </div>
  );
}
