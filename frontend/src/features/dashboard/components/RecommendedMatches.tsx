"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Church,
  Heart,
  MapPin,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type {
  RecommendedMatch,
} from "@/features/dashboard/types";

interface RecommendedMatchesProps {
  matches: RecommendedMatch[];
  loading?: boolean;
}

function getInitials(
  name: string
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MatchSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-200" />

      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function RecommendedMatches({
  matches,
  loading = false,
}: RecommendedMatchesProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-[#B38B19]"
            />

            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B38B19]">
              Suggested for you
            </p>
          </div>

          <h2 className="mt-1 text-xl font-black text-[#0B2D5C] sm:text-2xl">
            Recommended Matches
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Profiles based on your saved
            partner preferences.
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-[#0B2D5C] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
          View All

          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <MatchSkeleton />
            <MatchSkeleton />
            <MatchSkeleton />
          </div>
        ) : matches.length === 0 ? (
          <div className="relative overflow-hidden rounded-[26px] border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 via-white to-amber-50 px-6 py-12 text-center">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0B2D5C] text-white shadow-xl">
                <UsersRound size={34} />
              </div>

              <h3 className="mt-5 text-xl font-black text-[#0B2D5C]">
                Match recommendations are coming
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">
                Complete your partner preferences
                and use Search to discover suitable
                Christian profiles. Personalized
                dashboard recommendations will appear
                once the recommendation API is
                connected.
              </p>

              <Link
                href="/search"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#123C73]"
              >
                <Search size={18} />

                Search Profiles
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {matches.map((match) => (
              <article
                key={match.id}
                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
              >
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B2D5C] via-blue-700 to-blue-400">
                  {match.imageUrl ? (
                    <Image
                      src={match.imageUrl}
                      alt={match.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/15 text-3xl font-black text-white backdrop-blur">
                      {getInitials(match.name)}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  <button
                    type="button"
                    aria-label={`Shortlist ${match.name}`}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-rose-500 shadow-lg transition hover:scale-105"
                  >
                    <Heart size={19} />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      {match.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                          <CheckCircle2 size={12} />

                          Verified
                        </span>
                      )}

                      {match.churchVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold text-[#071B36]">
                          <Church size={12} />

                          Church Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black text-[#0B2D5C]">
                    {match.name}, {match.age}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-[#B38B19]">
                    {match.denomination}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Briefcase
                        size={17}
                        className="shrink-0 text-blue-600"
                      />

                      <span className="truncate">
                        {match.profession}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin
                        size={17}
                        className="shrink-0 text-rose-500"
                      />

                      <span className="truncate">
                        {match.location}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/profile/${match.id}`}
                    className="mt-5 flex h-11 items-center justify-center rounded-2xl bg-[#0B2D5C] text-sm font-bold text-white transition hover:bg-[#123C73]"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}