"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  DENOMINATIONS,
  EDUCATION_OPTIONS,
  PROFESSION_GROUPS,
} from "@/features/profile/data/profileOptions";

import {
  COUNTRIES,
  getCitiesForCountryState,
  getStatesForCountry,
} from "@/features/profile/data/worldLocations";

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
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const selectClassName =
  "h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export default function BrowseSearchFilters({
  filters,
  loading,
  isFiltering,
  onChange,
  onApply,
  onReset,
}: BrowseSearchFiltersProps) {
  const states =
    filters.country
      ? getStatesForCountry(
          filters.country
        )
      : [];

  const cities =
    filters.country &&
    filters.state
      ? getCitiesForCountryState(
          filters.country,
          filters.state
        )
      : [];

  const selectedCountryExists =
    COUNTRIES.some(
      (country) =>
        country.value ===
        filters.country
    );

  const selectedStateExists =
    states.some(
      (state) =>
        state.value ===
        filters.state
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        filters.city
    );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();
    onApply();
  }

  function handleCountryChange(
    country: string
  ): void {
    onChange(
      "country",
      country
    );

    onChange(
      "state",
      ""
    );

    onChange(
      "city",
      ""
    );
  }

  function handleStateChange(
    state: string
  ): void {
    onChange(
      "state",
      state
    );

    onChange(
      "city",
      ""
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Filter
              size={18}
            />
          </span>

          <div>
            <h2 className="text-base font-black text-[#0B2D5C] sm:text-lg">
              Search Filters
            </h2>

            <p className="text-xs text-slate-500 sm:text-sm">
              Search using the same profile values members use when creating
              their profiles.
            </p>
          </div>
        </div>

        {isFiltering && (
          <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Filters applied
          </span>
        )}
      </div>

      <form
        className="space-y-4"
        onSubmit={
          handleSubmit
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <FilterField
            label="Age From"
          >
            <input
              type="number"
              min={18}
              max={100}
              inputMode="numeric"
              value={
                filters.ageFrom
              }
              placeholder="Any age"
              disabled={loading}
              className={
                inputClassName
              }
              onChange={(
                event
              ) =>
                onChange(
                  "ageFrom",
                  event.target
                    .value
                )
              }
            />
          </FilterField>

          <FilterField
            label="Age To"
          >
            <input
              type="number"
              min={18}
              max={100}
              inputMode="numeric"
              value={
                filters.ageTo
              }
              placeholder="Any age"
              disabled={loading}
              className={
                inputClassName
              }
              onChange={(
                event
              ) =>
                onChange(
                  "ageTo",
                  event.target
                    .value
                )
              }
            />
          </FilterField>

          <FilterField
            label="Gender"
          >
            <SelectWrapper>
              <select
                value={
                  filters.gender
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "gender",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="Marital Status"
          >
            <SelectWrapper>
              <select
                value={
                  filters.maritalStatus
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "maritalStatus",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any marital status
                </option>

                <option value="Never Married">
                  Never Married
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

          <FilterField
            label="Denomination"
          >
            <SelectWrapper>
              <select
                value={
                  filters.denomination
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "denomination",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any denomination
                </option>

                {DENOMINATIONS.map(
                  (
                    denomination
                  ) => (
                    <option
                      key={
                        denomination
                      }
                      value={
                        denomination
                      }
                    >
                      {
                        denomination
                      }
                    </option>
                  )
                )}
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="Education"
          >
            <SelectWrapper>
              <select
                value={
                  filters.highestEducation
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "highestEducation",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any education
                </option>

                {EDUCATION_OPTIONS.map(
                  (
                    education
                  ) => (
                    <option
                      key={
                        education
                      }
                      value={
                        education
                      }
                    >
                      {
                        education
                      }
                    </option>
                  )
                )}
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="Profession"
          >
            <SelectWrapper>
              <select
                value={
                  filters.profession
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "profession",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any profession
                </option>

                {PROFESSION_GROUPS.map(
                  (group) => (
                    <optgroup
                      key={
                        group.label
                      }
                      label={
                        group.label
                      }
                    >
                      {group.professions.map(
                        (
                          profession
                        ) => (
                          <option
                            key={
                              profession
                            }
                            value={
                              profession
                            }
                          >
                            {
                              profession
                            }
                          </option>
                        )
                      )}
                    </optgroup>
                  )
                )}
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="Baptized"
          >
            <SelectWrapper>
              <select
                value={
                  filters.baptized
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "baptized",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any status
                </option>

                <option value="true">
                  Yes
                </option>

                <option value="false">
                  No
                </option>
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="Country"
          >
            <SelectWrapper>
              <select
                value={
                  filters.country
                }
                disabled={loading}
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  handleCountryChange(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any country
                </option>

                {filters.country &&
                  !selectedCountryExists && (
                    <option
                      value={
                        filters.country
                      }
                    >
                      {
                        filters.country
                      }
                    </option>
                  )}

                {COUNTRIES.map(
                  (country) => (
                    <option
                      key={
                        country.isoCode
                      }
                      value={
                        country.value
                      }
                    >
                      {
                        country.label
                      }
                    </option>
                  )
                )}
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="State"
          >
            <SelectWrapper>
              <select
                value={
                  filters.state
                }
                disabled={
                  loading ||
                  !filters.country
                }
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  handleStateChange(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any state
                </option>

                {filters.state &&
                  !selectedStateExists && (
                    <option
                      value={
                        filters.state
                      }
                    >
                      {
                        filters.state
                      }
                    </option>
                  )}

                {states.map(
                  (state) => (
                    <option
                      key={
                        `${filters.country}-${state.isoCode}`
                      }
                      value={
                        state.value
                      }
                    >
                      {
                        state.label
                      }
                    </option>
                  )
                )}
              </select>
            </SelectWrapper>
          </FilterField>

          <FilterField
            label="City"
          >
            <SelectWrapper>
              <select
                value={
                  filters.city
                }
                disabled={
                  loading ||
                  !filters.country ||
                  !filters.state
                }
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "city",
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Any city
                </option>

                {filters.city &&
                  !selectedCityExists && (
                    <option
                      value={
                        filters.city
                      }
                    >
                      {
                        filters.city
                      }
                    </option>
                  )}

                {cities.map(
                  (city) => (
                    <option
                      key={
                        `${filters.country}-${filters.state}-${city.value}`
                      }
                      value={
                        city.value
                      }
                    >
                      {
                        city.label
                      }
                    </option>
                  )
                )}
              </select>
            </SelectWrapper>
          </FilterField>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Choose a country to load its states. Choose a state to load its
          cities. Leaving a field on Any does not restrict that field.
        </p>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={
              onReset
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw
              size={16}
            />
            Reset Filters
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search
              size={16}
            />

            {loading
              ? "Searching..."
              : "Search Profiles"}
          </button>
        </div>
      </form>
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-bold text-slate-600 sm:text-sm">
        {label}
      </span>

      {children}
    </label>
  );
}

function SelectWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {children}

      <ChevronDown
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
