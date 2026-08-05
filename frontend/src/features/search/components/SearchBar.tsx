"use client";

import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface SearchBarProps {
  query: string;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onOpenFilters: () => void;
}

export default function SearchBar({
  query,
  resultCount,
  onQueryChange,
  onOpenFilters,
}: SearchBarProps) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={21}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              onQueryChange(
                event.target.value
              )
            }
            placeholder="Search by name, profession, denomination or location..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-base"
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() =>
                onQueryChange("")
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#123C73] xl:hidden"
        >
          <Filter size={19} />
          Filters
        </button>

        <div className="hidden min-w-44 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 xl:flex">
          <SlidersHorizontal
            size={19}
            className="text-[#0B2D5C]"
          />

          <div>
            <p className="text-xs font-semibold text-slate-500">
              Matching profiles
            </p>

            <p className="text-lg font-black text-[#0B2D5C]">
              {resultCount}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}