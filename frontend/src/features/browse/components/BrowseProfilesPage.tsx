"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  BadgeCheck,
  BookmarkPlus,
  HeartHandshake,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import Button from "@/components/ui/button";

import SaveSearchModal from "@/features/saved-searches/components/SaveSearchModal";

import profileService from "@/features/profile/services/profile.service";

import AdvancedSearchUpgradeModal from "./AdvancedSearchUpgradeModal";
import BrowseEmptyState from "./BrowseEmptyState";
import BrowseErrorState from "./BrowseErrorState";
import BrowsePagination from "./BrowsePagination";
import BrowseProfileCard from "./BrowseProfileCard";
import BrowseProfileSkeleton from "./BrowseProfileSkeleton";
import BrowseSearchFilters from "./BrowseSearchFilters";

import useBrowseProfiles from "../hooks/useBrowseProfiles";

import type {
  BrowseLocationMode,
} from "../hooks/useBrowseProfiles";

import type {
  BrowseSearchFilters as BrowseSearchFiltersType,
  BrowseSearchLocation,
} from "../types";

import type {
  SavedSearch,
} from "@/features/saved-searches/types";

const SKELETON_COUNT = 8;

interface BrowseProfilesPageProps {
  initialFilters?:
    Partial<BrowseSearchFiltersType>;
}

function hasInitialLocation(
  initialFilters:
    | Partial<BrowseSearchFiltersType>
    | undefined
): boolean {
  return Boolean(
    initialFilters?.country?.trim() ||
    initialFilters?.state?.trim() ||
    initialFilters?.district?.trim() ||
    initialFilters?.city?.trim()
  );
}

function locationLabel(
  location:
    BrowseSearchLocation
): string {
  return [
    location.city,
    location.district,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default function BrowseProfilesPage({
  initialFilters,
}: BrowseProfilesPageProps) {
  const explicitInitialLocation =
    hasInitialLocation(
      initialFilters
    );

  const [
    locationMode,
    setLocationMode,
  ] =
    useState<
      BrowseLocationMode
    >(
      explicitInitialLocation
        ? "CUSTOM"
        : "ANYWHERE"
    );

  const [
    preferredLocations,
    setPreferredLocations,
  ] =
    useState<
      BrowseSearchLocation[]
    >([]);

  const [
    preferencesLoading,
    setPreferencesLoading,
  ] =
    useState(true);

  /*
   * ============================================================
   * Load Partner Preference locations
   * ============================================================
   */

  useEffect(
    () => {
      let cancelled =
        false;

      async function loadPreferences():
      Promise<void> {
        try {
          setPreferencesLoading(
            true
          );

          const profile =
            await profileService
              .getProfile();

          if (cancelled) {
            return;
          }

          const locations:
            BrowseSearchLocation[] =
            (
              profile
                ?.preferredLocations ??
              []
            )
              .map(
                (
                  location
                ) => ({
                  country:
                    location.country
                      ?.trim() ??
                    "",

                  state:
                    location.state
                      ?.trim() ??
                    "",

                  district:
                    location.district
                      ?.trim() ??
                    "",

                  city:
                    location.city
                      ?.trim() ??
                    "",
                })
              )
              .filter(
                (
                  location
                ) =>
                  Boolean(
                    location.country ||
                    location.state ||
                    location.district ||
                    location.city
                  )
              );

          setPreferredLocations(
            locations
          );

          /*
           * Homepage Quick Search / URL location
           * must remain CUSTOM.
           *
           * Otherwise use saved Partner Preference
           * locations automatically when available.
           */

          if (
            !explicitInitialLocation &&
            locations.length > 0
          ) {
            setLocationMode(
              "PARTNER_PREFERENCES"
            );
          }
        } catch {
          if (!cancelled) {
            setPreferredLocations(
              []
            );

            if (
              !explicitInitialLocation
            ) {
              setLocationMode(
                "ANYWHERE"
              );
            }
          }
        } finally {
          if (!cancelled) {
            setPreferencesLoading(
              false
            );
          }
        }
      }

      void loadPreferences();

      return () => {
        cancelled =
          true;
      };
    },
    [
      explicitInitialLocation,
    ]
  );

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
    initialFilters,
    locationMode,
    preferredLocations,
  });

  const [
    upgradeModalOpen,
    setUpgradeModalOpen,
  ] = useState(false);

  const [
    saveSearchModalOpen,
    setSaveSearchModalOpen,
  ] = useState(false);

  const [
    lastSavedSearch,
    setLastSavedSearch,
  ] =
    useState<
      SavedSearch | null
    >(null);

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

  useEffect(
    () => {
      if (
        membershipUpgradeRequired
      ) {
        setUpgradeModalOpen(
          true
        );
      }
    },
    [
      membershipUpgradeRequired,
    ]
  );

  function handleSavedSearch(
    savedSearch:
      SavedSearch
  ): void {
    setLastSavedSearch(
      savedSearch
    );
  }

  return (
    <div className="space-y-6 pb-4">

      {/* Premium Search Header */}

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
                Discover meaningful matches
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/85">
                Search by preferences, location,
                faith and trusted verification
                credentials.
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

      {/* Location Search Mode */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/30 to-amber-50/30 px-5 py-4 sm:px-6">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">
            Location Preferences
          </p>

          <h2 className="mt-1 text-lg font-black text-[#0B2D5C]">
            Where should we search?
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Use your saved Partner Preferences,
            choose a custom location, or search anywhere.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">

            <LocationModeCard
              active={
                locationMode ===
                "PARTNER_PREFERENCES"
              }
              disabled={
                loading ||
                preferencesLoading ||
                preferredLocations.length ===
                  0
              }
              title="My Partner Preferences"
              description="Use all locations saved in your profile"
              count={
                preferredLocations.length
              }
              onClick={() =>
                setLocationMode(
                  "PARTNER_PREFERENCES"
                )
              }
            />

            <LocationModeCard
              active={
                locationMode ===
                "CUSTOM"
              }
              disabled={loading}
              title="Custom Location"
              description="Use the location fields in Refine Search"
              onClick={() =>
                setLocationMode(
                  "CUSTOM"
                )
              }
            />

            <LocationModeCard
              active={
                locationMode ===
                "ANYWHERE"
              }
              disabled={loading}
              title="Anywhere"
              description="Do not restrict matches by location"
              onClick={() =>
                setLocationMode(
                  "ANYWHERE"
                )
              }
            />
          </div>

          {locationMode ===
            "PARTNER_PREFERENCES" &&
            preferredLocations.length >
              0 && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center gap-2">
                  <MapPin
                    size={15}
                    className="text-blue-700"
                  />

                  <p className="text-xs font-black uppercase tracking-[0.1em] text-blue-700">
                    Your saved locations
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {preferredLocations.map(
                    (
                      location,
                      index
                    ) => (
                      <span
                        key={`${locationLabel(
                          location
                        )}-${index}`}
                        className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0B2D5C]"
                      >
                        {locationLabel(
                          location
                        )}
                      </span>
                    )
                  )}
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Matching any one of these locations
                  satisfies your location preference.
                </p>
              </div>
            )}

          {!preferencesLoading &&
            preferredLocations.length ===
              0 && (
              <p className="mt-3 text-xs font-medium text-amber-700">
                No Partner Preference locations are saved yet.
                Add locations in Profile → Partner Preferences
                or use Custom Location.
              </p>
            )}

          {locationMode !==
            "CUSTOM" && (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The manual location fields below are ignored
              unless Custom Location is selected.
            </p>
          )}
        </div>
      </section>

      {/* Advanced Search Filters */}

      <BrowseSearchFilters
        filters={filters}
        loading={loading}
        isFiltering={isFiltering}
        onChange={updateFilter}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {/* Results */}

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
                      {totalElements ===
                      0
                        ? isFiltering
                          ? "No profiles matched your current filters."
                          : "No profiles are currently available."
                        : `${totalElements} ${
                            totalElements ===
                            1
                              ? "profile"
                              : "profiles"
                          } found`}
                    </p>
                  )}

                {lastSavedSearch && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <BookmarkPlus
                      size={12}
                    />

                    Saved as{" "}
                    {
                      lastSavedSearch.name
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                <BookmarkPlus
                  size={15}
                />
              }
              disabled={loading}
              onClick={() =>
                setSaveSearchModalOpen(
                  true
                )
              }
            >
              Save Search
            </Button>

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
              length:
                SKELETON_COUNT,
            }).map(
              (_, index) => (
                <BrowseProfileSkeleton
                  key={index}
                />
              )
            )}
          </div>
        ) : profiles.length ===
          0 ? (
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
              hasNext={
                hasNext
              }
              loading={
                loading
              }
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

      <SaveSearchModal
        open={
          saveSearchModalOpen
        }
        filters={filters}
        onClose={() => {
          setSaveSearchModalOpen(
            false
          );
        }}
        onSaved={
          handleSavedSearch
        }
      />

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

function LocationModeCard({
  active,
  disabled,
  title,
  description,
  count,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  title: string;
  description: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",

        active
          ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-[#0B2D5C]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        {typeof count ===
          "number" && (
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">
            {count}
          </span>
        )}
      </div>

      {active && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-emerald-600">
          <BadgeCheck
            size={14}
          />
          Selected
        </div>
      )}
    </button>
  );
}

function HeroTrustChip({
  icon,
  label,
}: {
  icon:
    React.ReactNode;
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
  icon:
    React.ReactNode;
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
