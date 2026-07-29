"use client";

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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              Discover meaningful matches
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Browse Christian profiles
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              Explore verified profiles and find
              someone who shares your faith, values,
              and vision for marriage.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <BrowseSearchFilters
          filters={filters}
          loading={loading}
          isFiltering={isFiltering}
          onChange={updateFilter}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        <div>
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isFiltering
                  ? "Search results"
                  : "Recommended profiles"}
              </h2>

              {!loading && !error && (
                <p className="mt-1 text-sm text-slate-600">
                  {totalElements === 0
                    ? isFiltering
                      ? "No profiles matched your filters"
                      : "No profiles available"
                    : `${totalElements} ${
                        totalElements === 1
                          ? "profile"
                          : "profiles"
                      } found`}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {error ? (
            <BrowseErrorState
              message={error}
              onRetry={() => void refresh()}
            />
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({
                length: SKELETON_COUNT,
              }).map((_, index) => (
                <BrowseProfileSkeleton
                  key={index}
                />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <BrowseEmptyState
              onRefresh={
                isFiltering
                  ? resetFilters
                  : () => void refresh()
              }
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {profiles.map((profile) => (
                  <BrowseProfileCard
                    key={profile.id}
                    profile={profile}
                  />
                ))}
              </div>

              <BrowsePagination
                page={page}
                totalPages={totalPages}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                loading={loading}
                onPrevious={previousPage}
                onNext={nextPage}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}