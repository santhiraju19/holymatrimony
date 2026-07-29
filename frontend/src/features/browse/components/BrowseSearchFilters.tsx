"use client";

import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import type {
  BrowseSearchFilters as BrowseSearchFiltersType,
} from "../types";

interface BrowseSearchFiltersProps {
  filters: BrowseSearchFiltersType;
  loading: boolean;
  isFiltering: boolean;

  onChange: (
    name: keyof BrowseSearchFiltersType,
    value: string
  ) => void;

  onApply: () => void;
  onReset: () => void;
}

const inputClassName =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const selectClassName =
  "h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function BrowseSearchFilters({
  filters,
  loading,
  isFiltering,
  onChange,
  onApply,
  onReset,
}: BrowseSearchFiltersProps) {
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    onApply();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Filter size={20} />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Search filters
              </h2>

              <p className="text-sm text-slate-500">
                Refine profiles by your preferred criteria.
              </p>
            </div>
          </div>
        </div>

        {isFiltering && (
          <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Filters applied
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Age from">
            <input
              type="number"
              min={18}
              max={100}
              inputMode="numeric"
              value={filters.ageFrom}
              onChange={(event) =>
                onChange(
                  "ageFrom",
                  event.target.value
                )
              }
              placeholder="Example: 24"
              disabled={loading}
              className={inputClassName}
            />
          </FilterField>

          <FilterField label="Age to">
            <input
              type="number"
              min={18}
              max={100}
              inputMode="numeric"
              value={filters.ageTo}
              onChange={(event) =>
                onChange(
                  "ageTo",
                  event.target.value
                )
              }
              placeholder="Example: 32"
              disabled={loading}
              className={inputClassName}
            />
          </FilterField>

          <FilterField label="Gender">
            <SelectWrapper>
              <select
                value={filters.gender}
                onChange={(event) =>
                  onChange(
                    "gender",
                    event.target.value
                  )
                }
                disabled={loading}
                className={selectClassName}
              >
                <option value="">Any gender</option>
                <option value="Male">Male</option>
                <option value="Female">
                  Female
                </option>
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField label="Marital status">
            <SelectWrapper>
              <select
                value={filters.maritalStatus}
                onChange={(event) =>
                  onChange(
                    "maritalStatus",
                    event.target.value
                  )
                }
                disabled={loading}
                className={selectClassName}
              >
                <option value="">
                  Any marital status
                </option>
                <option value="Never Married">
                  Never married
                </option>
                <option value="Divorced">
                  Divorced
                </option>
                <option value="Widowed">
                  Widowed
                </option>
                <option value="Separated">
                  Separated
                </option>
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField label="Denomination">
            <SelectWrapper>
              <select
                value={filters.denomination}
                onChange={(event) =>
                  onChange(
                    "denomination",
                    event.target.value
                  )
                }
                disabled={loading}
                className={selectClassName}
              >
                <option value="">
                  Any denomination
                </option>
                <option value="CSI">CSI</option>
                <option value="CBCNC">
                  CBCNC
                </option>
                <option value="Baptist">
                  Baptist
                </option>
                <option value="Methodist">
                  Methodist
                </option>
                <option value="Pentecostal">
                  Pentecostal
                </option>
                <option value="Catholic">
                  Catholic
                </option>
                <option value="Independent">
                  Independent
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField label="Education">
            <input
              type="text"
              value={filters.highestEducation}
              onChange={(event) =>
                onChange(
                  "highestEducation",
                  event.target.value
                )
              }
              placeholder="Example: B.Tech"
              disabled={loading}
              className={inputClassName}
            />
          </FilterField>

          <FilterField label="Profession">
            <input
              type="text"
              value={filters.profession}
              onChange={(event) =>
                onChange(
                  "profession",
                  event.target.value
                )
              }
              placeholder="Example: Engineer"
              disabled={loading}
              className={inputClassName}
            />
          </FilterField>

          <FilterField label="Baptized">
            <SelectWrapper>
              <select
                value={filters.baptized}
                onChange={(event) =>
                  onChange(
                    "baptized",
                    event.target.value
                  )
                }
                disabled={loading}
                className={selectClassName}
              >
                <option value="">
                  Any status
                </option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField label="State">
            <input
              type="text"
              value={filters.state}
              onChange={(event) =>
                onChange(
                  "state",
                  event.target.value
                )
              }
              placeholder="Example: Andhra Pradesh"
              disabled={loading}
              className={inputClassName}
            />
          </FilterField>

          <FilterField label="City">
            <input
              type="text"
              value={filters.city}
              onChange={(event) =>
                onChange(
                  "city",
                  event.target.value
                )
              }
              placeholder="Example: Guntur"
              disabled={loading}
              className={inputClassName}
            />
          </FilterField>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={17} />
            Reset filters
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={17} />
            {loading
              ? "Searching..."
              : "Search profiles"}
          </button>
        </div>
      </form>
    </section>
  );
}

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

function FilterField({
  label,
  children,
}: FilterFieldProps) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

interface SelectWrapperProps {
  children: React.ReactNode;
}

function SelectWrapper({
  children,
}: SelectWrapperProps) {
  return (
    <div className="relative">
      {children}

      <ChevronDown
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}