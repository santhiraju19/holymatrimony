"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Briefcase,
  CheckCircle2,
  Church,
  Heart,
  MapPin,
  SearchX,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  SearchFilterValues,
} from "./SearchFilters";

interface MatchGridProps {
  query: string;
  filters: SearchFilterValues;
  onResultCountChange: (
    count: number
  ) => void;
  onClearFilters: () => void;
}

interface SearchProfile {
  id: string;
  name: string;
  age: number;
  profession: string;
  location: string;
  state: string;
  district: string;
  city: string;
  denomination: string;
  maritalStatus: string;
  verified: boolean;
  churchVerified: boolean;
  completion: number;
}

const profiles: SearchProfile[] = [
  {
    id: "1",
    name: "John David",
    age: 28,
    profession: "Software Engineer",
    location:
      "Hyderabad, Hyderabad, Telangana",
    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    denomination: "CSI",
    maritalStatus: "Never Married",
    verified: true,
    churchVerified: true,
    completion: 92,
  },
  {
    id: "2",
    name: "Samuel Raj",
    age: 30,
    profession: "Doctor",
    location:
      "Vijayawada, NTR, Andhra Pradesh",
    state: "Andhra Pradesh",
    district: "NTR",
    city: "Vijayawada",
    denomination: "Baptist",
    maritalStatus: "Never Married",
    verified: true,
    churchVerified: false,
    completion: 88,
  },
  {
    id: "3",
    name: "Daniel Paul",
    age: 27,
    profession: "Data Analyst",
    location:
      "Guntur, Guntur, Andhra Pradesh",
    state: "Andhra Pradesh",
    district: "Guntur",
    city: "Guntur",
    denomination: "Pentecostal",
    maritalStatus: "Never Married",
    verified: true,
    churchVerified: true,
    completion: 95,
  },
  {
    id: "4",
    name: "Joshua Peter",
    age: 29,
    profession: "Business Owner",
    location:
      "Visakhapatnam, Visakhapatnam, Andhra Pradesh",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    city: "Visakhapatnam",
    denomination: "CSI",
    maritalStatus: "Never Married",
    verified: false,
    churchVerified: false,
    completion: 76,
  },
  {
    id: "5",
    name: "Andrew Joseph",
    age: 31,
    profession: "Architect",
    location:
      "Bengaluru, Bengaluru Urban, Karnataka",
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    denomination: "Methodist",
    maritalStatus: "Never Married",
    verified: true,
    churchVerified: true,
    completion: 90,
  },
  {
    id: "6",
    name: "Joel Mathew",
    age: 26,
    profession: "Teacher",
    location:
      "Chennai, Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    denomination: "Independent",
    maritalStatus: "Never Married",
    verified: true,
    churchVerified: false,
    completion: 84,
  },
];

function getInitials(
  name: string
): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MatchGrid({
  query,
  filters,
  onResultCountChange,
  onClearFilters,
}: MatchGridProps) {
  const [
    favourites,
    setFavourites,
  ] = useState<string[]>([]);

  const matches = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return profiles.filter(
      (profile) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            profile.name,
            profile.profession,
            profile.location,
            profile.state,
            profile.district,
            profile.city,
            profile.denomination,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(
                normalizedQuery
              )
          );

        const matchesAgeFrom =
          !filters.ageFrom ||
          profile.age >=
            Number(
              filters.ageFrom
            );

        const matchesAgeTo =
          !filters.ageTo ||
          profile.age <=
            Number(
              filters.ageTo
            );

        const matchesDenomination =
          !filters.denomination ||
          profile.denomination ===
            filters.denomination;

        const matchesProfession =
          !filters.profession ||
          profile.profession ===
            filters.profession;

        const matchesState =
          !filters.state ||
          profile.state ===
            filters.state;

        const matchesDistrict =
          !filters.district ||
          profile.district ===
            filters.district;

        const matchesCity =
          !filters.city ||
          profile.city === filters.city;

        const matchesMaritalStatus =
          !filters.maritalStatus ||
          profile.maritalStatus ===
            filters.maritalStatus;

        const matchesVerification =
          !filters.verifiedOnly ||
          profile.verified;

        return (
          matchesQuery &&
          matchesAgeFrom &&
          matchesAgeTo &&
          matchesDenomination &&
          matchesProfession &&
          matchesState &&
          matchesDistrict &&
          matchesCity &&
          matchesMaritalStatus &&
          matchesVerification
        );
      }
    );
  }, [query, filters]);

  useEffect(() => {
    onResultCountChange(
      matches.length
    );
  }, [
    matches.length,
    onResultCountChange,
  ]);

  function toggleFavourite(
    id: string
  ): void {
    setFavourites((current) =>
      current.includes(id)
        ? current.filter(
            (item) =>
              item !== id
          )
        : [...current, id]
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-white px-6 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <SearchX size={36} />
        </div>

        <h2 className="mt-5 text-2xl font-black text-[#0B2D5C]">
          No matching profiles
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
          Try broadening your age,
          denomination, profession,
          state, district, or city
          preferences.
        </p>

        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 rounded-2xl bg-[#0B2D5C] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#123C73]"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B38B19]">
            Recommended profiles
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#0B2D5C]">
            {matches.length}{" "}
            {matches.length === 1
              ? "match"
              : "matches"}{" "}
            found
          </h2>
        </div>

        <select className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="best-match">
            Best match
          </option>

          <option value="newest">
            Newest profiles
          </option>

          <option value="age-ascending">
            Age: low to high
          </option>

          <option value="completion">
            Profile completion
          </option>
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {matches.map((profile) => {
          const favourite =
            favourites.includes(
              profile.id
            );

          return (
            <article
              key={profile.id}
              className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.13)]"
            >
              <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B2D5C] via-[#174A87] to-blue-400">
                <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/25 bg-white/15 text-3xl font-black text-white shadow-2xl backdrop-blur">
                  {getInitials(
                    profile.name
                  )}
                </div>

                <button
                  type="button"
                  aria-label={
                    favourite
                      ? "Remove from favourites"
                      : "Add to favourites"
                  }
                  onClick={() =>
                    toggleFavourite(
                      profile.id
                    )
                  }
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-lg backdrop-blur transition hover:scale-105"
                >
                  <Heart
                    size={20}
                    className={
                      favourite
                        ? "fill-rose-500 text-rose-500"
                        : "text-slate-500"
                    }
                  />
                </button>

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                      <CheckCircle2
                        size={12}
                      />

                      Verified
                    </span>
                  )}

                  {profile.churchVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold text-[#071B36] shadow">
                      <Church size={12} />

                      Church verified
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black text-[#0B2D5C]">
                      {profile.name},{" "}
                      {profile.age}
                    </h3>

                    <p className="mt-1 truncate text-sm font-semibold text-[#B38B19]">
                      {
                        profile.denomination
                      }
                    </p>
                  </div>

                  <ShieldCheck
                    size={21}
                    className="shrink-0 text-blue-600"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Briefcase
                        size={17}
                      />
                    </span>

                    <span className="truncate font-medium">
                      {
                        profile.profession
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <MapPin size={17} />
                    </span>

                    <span className="truncate font-medium">
                      {profile.location}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>
                      Profile completion
                    </span>

                    <span>
                      {
                        profile.completion
                      }
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] to-blue-500 transition-all duration-500"
                      style={{
                        width: `${profile.completion}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                  <Link
                    href={`/profile/${profile.id}`}
                    className="flex h-12 items-center justify-center rounded-2xl bg-[#0B2D5C] text-sm font-bold text-white shadow-lg transition hover:bg-[#123C73]"
                  >
                    View Profile
                  </Link>

                  <button
                    type="button"
                    aria-label="Express interest"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100"
                  >
                    <Sparkles size={19} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}