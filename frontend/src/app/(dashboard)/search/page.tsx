"use client";

import SearchHeader from "@/features/search/components/SearchHeader";
import SearchBar from "@/features/search/components/SearchBar";
import SearchFilters from "@/features/search/components/SearchFilters";
import MatchGrid from "@/features/search/components/MatchGrid";

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <SearchHeader />

      <SearchBar />

      <SearchFilters />

      <MatchGrid />
    </div>
  );
}