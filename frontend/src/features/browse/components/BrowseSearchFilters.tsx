"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  BadgeCheck,
  ChevronDown,
  Church,
  Filter,
  Fingerprint,
  RotateCcw,
  Search,
  ShieldCheck,
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

  function handleAadhaarToggle(): void {
    const nextValue =
      filters.aadhaarVerified ===
      "true"
        ? ""
        : "true";

    onChange(
      "aadhaarVerified",
      nextValue
    );

    /*
     * Aadhaar and generic ID verification are
     * mutually exclusive because the current
     * identity model has one document per member.
     */
    if (
      nextValue ===
      "true"
    ) {
      onChange(
        "idVerified",
        ""
      );
    }
  }

  function handleIdToggle(): void {
    const nextValue =
      filters.idVerified ===
      "true"
        ? ""
        : "true";

    onChange(
      "idVerified",
      nextValue
    );

    if (
      nextValue ===
      "true"
    ) {
      onChange(
        "aadhaarVerified",
        ""
      );
    }
  }

  function handleChurchToggle(): void {
    onChange(
      "churchVerified",
      filters.churchVerified ===
        "true"
        ? ""
        : "true"
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
              Find members using profile details and trusted
              verification credentials.
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
        className="space-y-5"
        onSubmit={
          handleSubmit
        }
      >
        {/* =====================================================
            Standard Profile Filters
            ===================================================== */}

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
                  event.target.value
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
                  event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
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

        {/* =====================================================
            Premium Verification Filters
            ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-blue-50/80 shadow-sm">
          <div className="border-b border-amber-100/80 px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_6px_18px_rgba(245,158,11,0.22)]">
                <BadgeCheck
                  size={20}
                  strokeWidth={2.5}
                />
              </span>

              <div>
                <h3 className="text-sm font-black text-[#0B2D5C] sm:text-base">
                  Verified Profiles
                </h3>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                  Search members by trusted verification credentials.
                  Church verification can be combined with Aadhaar or ID
                  verification.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            <VerificationToggle
              active={
                filters.aadhaarVerified ===
                "true"
              }
              disabled={loading}
              title="Aadhaar Verified"
              description="Identity approved using an Aadhaar document."
              icon={
                <ShieldCheck
                  size={19}
                  strokeWidth={2.4}
                />
              }
              variant="aadhaar"
              onClick={
                handleAadhaarToggle
              }
            />

            <VerificationToggle
              active={
                filters.idVerified ===
                "true"
              }
              disabled={loading}
              title="ID Verified"
              description="Passport, Driving Licence or Voter ID approved."
              icon={
                <Fingerprint
                  size={19}
                  strokeWidth={2.4}
                />
              }
              variant="identity"
              onClick={
                handleIdToggle
              }
            />

            <VerificationToggle
              active={
                filters.churchVerified ===
                "true"
              }
              disabled={loading}
              title="Church Verified"
              description="Church information has been reviewed and approved."
              icon={
                <Church
                  size={19}
                  strokeWidth={2.4}
                />
              }
              variant="church"
              onClick={
                handleChurchToggle
              }
            />
          </div>

          {(filters.aadhaarVerified ===
            "true" ||
            filters.idVerified ===
              "true" ||
            filters.churchVerified ===
              "true") && (
            <div className="border-t border-amber-100/80 bg-white/60 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Active trust filters
                </span>

                {filters.aadhaarVerified ===
                  "true" && (
                  <ActiveVerificationChip
                    variant="aadhaar"
                    label="Aadhaar Verified"
                  />
                )}

                {filters.idVerified ===
                  "true" && (
                  <ActiveVerificationChip
                    variant="identity"
                    label="ID Verified"
                  />
                )}

                {filters.churchVerified ===
                  "true" && (
                  <ActiveVerificationChip
                    variant="church"
                    label="Church Verified"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Choose a country to load its states. Choose a state to load
          its cities. Leaving a field on Any does not restrict that
          field. When multiple verification filters are selected, the
          profile must satisfy all selected credentials.
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

type VerificationVariant =
  | "aadhaar"
  | "identity"
  | "church";

function VerificationToggle({
  active,
  disabled,
  title,
  description,
  icon,
  variant,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  variant: VerificationVariant;
  onClick: () => void;
}) {
  const activeStyles: Record<
    VerificationVariant,
    string
  > = {
    aadhaar:
      "border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-[0_8px_26px_rgba(245,158,11,0.15)]",

    identity:
      "border-blue-400 bg-gradient-to-br from-sky-50 via-white to-blue-100 shadow-[0_8px_26px_rgba(37,99,235,0.13)]",

    church:
      "border-indigo-400 bg-gradient-to-br from-indigo-50 via-white to-blue-100 shadow-[0_8px_26px_rgba(79,70,229,0.13)]",
  };

  const iconStyles: Record<
    VerificationVariant,
    string
  > = {
    aadhaar:
      "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950",

    identity:
      "bg-gradient-to-br from-blue-600 to-indigo-600 text-white",

    church:
      "bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "group relative flex min-h-[108px] w-full items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? activeStyles[variant]
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition",
          active
            ? iconStyles[variant]
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-black text-[#0B2D5C]">
          {title}

          {active && (
            <BadgeCheck
              size={16}
              strokeWidth={2.5}
              className="shrink-0 text-emerald-600"
            />
          )}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span
        className={[
          "absolute right-3 top-3 h-2 w-2 rounded-full transition",
          active
            ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
            : "bg-slate-200",
        ].join(" ")}
      />
    </button>
  );
}

function ActiveVerificationChip({
  variant,
  label,
}: {
  variant: VerificationVariant;
  label: string;
}) {
  const styles: Record<
    VerificationVariant,
    string
  > = {
    aadhaar:
      "border-amber-200 bg-amber-50 text-amber-800",

    identity:
      "border-blue-200 bg-blue-50 text-blue-800",

    church:
      "border-indigo-200 bg-indigo-50 text-indigo-800",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
        styles[variant],
      ].join(" ")}
    >
      <BadgeCheck
        size={12}
        strokeWidth={2.5}
      />

      {label}
    </span>
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