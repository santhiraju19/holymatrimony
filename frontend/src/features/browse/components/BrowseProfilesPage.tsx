
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
      {/* Compact Search Header */}
      <section className="border-b border-blue-100 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur">
                Discover meaningful matches
              </span>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Browse Christian Profiles
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Find someone who shares your faith, values, and
                vision for marriage.
              </p>
            </div>

            {!loading && !error && totalElements > 0 && (
              <div className="w-fit rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-200">
                  Available matches
                </p>

                <p className="mt-0.5 text-lg font-black text-white">
                  {totalElements}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
        <BrowseSearchFilters
          filters={filters}
          loading={loading}
          isFiltering={isFiltering}
          onChange={updateFilter}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        <div>
          {/* Results Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0B2D5C] sm:text-xl">
                {isFiltering
                  ? "Search Results"
                  : "Recommended Profiles"}
              </h2>

              {!loading && !error && (
                <p className="mt-1 text-sm text-slate-500">
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
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error ? (
            <BrowseErrorState
              message={error}
              onRetry={() => void refresh()}
            />
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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