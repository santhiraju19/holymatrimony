"use client";

import { useEffect, useState } from "react";

import {
  BadgeCheck,
  HeartHandshake,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import Button from "@/components/ui/button";

import AdvancedSearchUpgradeModal from "./AdvancedSearchUpgradeModal";
import BrowseEmptyState from "./BrowseEmptyState";
import BrowseErrorState from "./BrowseErrorState";
import BrowsePagination from "./BrowsePagination";
import BrowseProfileCard from "./BrowseProfileCard";
import BrowseProfileSkeleton from "./BrowseProfileSkeleton";
import BrowseSearchFilters from "./BrowseSearchFilters";

import useBrowseProfiles from "../hooks/useBrowseProfiles";

const SKELETON_COUNT = 8;

export default function BrowseProfilesPage() {
  const {
    profiles,
    filters,

    page,
    totalElements,
    totalPages,

    hasNext,
    hasPrevious,

    loading,
    error,
    isFiltering,

    updateFilter,
    applyFilters,
    resetFilters,

    nextPage,
    previousPage,
    refresh,
  } = useBrowseProfiles({
    initialPage: 0,
    pageSize: 12,
  });

  const [
    upgradeModalOpen,
    setUpgradeModalOpen,
  ] = useState(false);

  const membershipUpgradeRequired =
    Boolean(
      error &&
        (
          error
            .toLowerCase()
            .includes(
              "upgrade your membership"
            ) ||
          error
            .toLowerCase()
            .includes(
              "advanced search"
            )
        )
    );

  useEffect(() => {
    if (
      membershipUpgradeRequired
    ) {
      setUpgradeModalOpen(
        true
      );
    }
  }, [
    membershipUpgradeRequired,
  ]);

  return (
    <div className="space-y-6 pb-4">

      {/* =====================================================
          Compact Premium Search Header
          ===================================================== */}

      <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] shadow-[0_14px_38px_rgba(11,45,92,0.16)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl" />

          <div className="absolute -bottom-32 left-[28%] h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,.9) .6px, transparent .6px)",
              backgroundSize:
                "22px 22px",
            }}
          />
        </div>

        <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-extrabold tracking-wide text-amber-100 backdrop-blur-md">
                <Sparkles
                  size={12}
                  strokeWidth={2.5}
                />

                Faith • Family • Forever
              </span>

              <h1 className="mt-3 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                Discover meaningful Christian matches
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/85">
                Search by preferences, location, faith and trusted
                verification credentials.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <HeroTrustChip
                  icon={
                    <ShieldCheck
                      size={13}
                    />
                  }
                  label="Identity verified"
                />

                <HeroTrustChip
                  icon={
                    <BadgeCheck
                      size={13}
                    />
                  }
                  label="Church verified"
                />

                <HeroTrustChip
                  icon={
                    <HeartHandshake
                      size={13}
                    />
                  }
                  label="Faith-focused"
                />
              </div>
            </div>

            {!loading &&
              !error &&
              totalElements > 0 && (
                <div className="flex flex-wrap gap-3">
                  <CompactHeroMetric
                    icon={
                      <UsersRound
                        size={17}
                      />
                    }
                    value={String(
                      totalElements
                    )}
                    label="Profiles"
                  />

                  <CompactHeroMetric
                    icon={
                      <Search
                        size={17}
                      />
                    }
                    value={
                      isFiltering
                        ? "Filtered"
                        : "Explore"
                    }
                    label="Discovery"
                  />
                </div>
              )}
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent" />
      </section>

      {/* =====================================================
          Search Filters
          ===================================================== */}

      <BrowseSearchFilters
        filters={filters}
        loading={loading}
        isFiltering={isFiltering}
        onChange={updateFilter}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {/* =====================================================
          Results
          ===================================================== */}

      <section className="space-y-5">
        <div className="hm-surface flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700">
                <UsersRound
                  size={18}
                />
              </span>

              <div>
                <h2 className="text-lg font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-xl">
                  {isFiltering
                    ? "Matching Profiles"
                    : "Recommended Profiles"}
                </h2>

                {!loading &&
                  !error && (
                    <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                      {totalElements === 0
                        ? isFiltering
                          ? "No profiles matched your current filters."
                          : "No profiles are currently available."
                        : `${totalElements} ${
                            totalElements === 1
                              ? "profile"
                              : "profiles"
                          } found`}
                    </p>
                  )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            loading={loading}
            leftIcon={
              <RefreshCw
                size={15}
              />
            }
            onClick={() =>
              void refresh()
            }
          >
            Refresh
          </Button>
        </div>

        {error &&
        !membershipUpgradeRequired ? (
          <BrowseErrorState
            message={error}
            onRetry={() =>
              void refresh()
            }
          />
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: SKELETON_COUNT,
            }).map(
              (_, index) => (
                <BrowseProfileSkeleton
                  key={index}
                />
              )
            )}
          </div>
        ) : profiles.length === 0 ? (
          <BrowseEmptyState
            onRefresh={
              isFiltering
                ? resetFilters
                : () =>
                    void refresh()
            }
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profiles.map(
                (profile) => (
                  <BrowseProfileCard
                    key={
                      profile.id
                    }
                    profile={
                      profile
                    }
                  />
                )
              )}
            </div>

            <BrowsePagination
              page={page}
              totalPages={
                totalPages
              }
              hasPrevious={
                hasPrevious
              }
              hasNext={hasNext}
              loading={loading}
              onPrevious={
                previousPage
              }
              onNext={
                nextPage
              }
            />
          </>
        )}
      </section>

      <AdvancedSearchUpgradeModal
        open={
          upgradeModalOpen
        }
        onClose={() => {
          setUpgradeModalOpen(
            false
          );
        }}
      />
    </div>
  );
}

function HeroTrustChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-blue-50 backdrop-blur-md">
      {icon}

      {label}
    </span>
  );
}

function CompactHeroMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-[105px] rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-amber-200">
          {icon}
        </span>

        <span className="text-base font-black text-white">
          {value}
        </span>
      </div>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue-100/75">
        {label}
      </p>
    </div>
  );
}