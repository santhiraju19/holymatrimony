"use client";

import { useState } from "react";

import SearchHeader from "@/features/search/components/SearchHeader";
import SearchBar from "@/features/search/components/SearchBar";
import SearchFilters, {
  SearchFilterValues,
  initialSearchFilters,
} from "@/features/search/components/SearchFilters";
import MatchGrid from "@/features/search/components/MatchGrid";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const [filters, setFilters] =
    useState<SearchFilterValues>(
      initialSearchFilters
    );

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  const [
    resultCount,
    setResultCount,
  ] = useState(0);

  function clearFilters(): void {
    setFilters(initialSearchFilters);
    setQuery("");
  }

  return (
    <div className="space-y-6 pb-10">
      <SearchHeader />

      <SearchBar
        query={query}
        resultCount={resultCount}
        onQueryChange={setQuery}
        onOpenFilters={() =>
          setMobileFiltersOpen(true)
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <div className="hidden xl:block">
          <div className="sticky top-[106px]">
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />
          </div>
        </div>

        <div className="min-w-0">
          <MatchGrid
            query={query}
            filters={filters}
            onResultCountChange={
              setResultCount
            }
            onClearFilters={
              clearFilters
            }
          />
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-[120] xl:hidden",
          mobileFiltersOpen
            ? "pointer-events-auto"
            : "pointer-events-none",
        ].join(" ")}
        aria-hidden={
          !mobileFiltersOpen
        }
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={() =>
            setMobileFiltersOpen(false)
          }
          className={[
            "absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity",
            mobileFiltersOpen
              ? "opacity-100"
              : "opacity-0",
          ].join(" ")}
        />

        <div
          className={[
            "absolute inset-y-0 right-0 w-[92%] max-w-sm overflow-y-auto bg-[#F5F7FB] p-4 shadow-2xl transition-transform duration-300",
            mobileFiltersOpen
              ? "translate-x-0"
              : "translate-x-full",
          ].join(" ")}
        >
          <SearchFilters
            mobile
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            onClose={() =>
              setMobileFiltersOpen(false)
            }
          />
        </div>
      </div>
    </div>
  );
}