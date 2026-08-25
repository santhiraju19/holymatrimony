"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  BadgeCheck,
  BriefcaseBusiness,
  Church,
  Cigarette,
  Fingerprint,
  GraduationCap,
  HeartHandshake,
  Languages,
  MapPin,
  Ruler,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  Utensils,
  Wine,
} from "lucide-react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";

import {
  DENOMINATIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  EDUCATION_OPTIONS,
  HEIGHT_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  PROFESSION_GROUPS,
  RELIGION_OPTIONS,
  SMOKING_OPTIONS,
} from "@/features/profile/data/profileOptions";

import {
  COUNTRIES,
  getCitiesForCountryState,
  getStatesForCountry,
} from "@/features/profile/data/worldLocations";

import {
  getDistrictsForState,
  isIndia,
} from "@/features/profile/data/indiaLocations";


import type {
  BrowseSearchFilters as BrowseSearchFiltersType,
  BrowseSortOption,
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

const SORT_OPTIONS: Array<{
  value: BrowseSortOption;
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    value: "RECOMMENDED",
    title: "Recommended",
    description: "Balanced discovery",
    icon: (
      <Sparkles
        size={16}
      />
    ),
  },

  {
    value: "NEWEST",
    title: "Newest",
    description: "Recently joined",
    icon: (
      <UserRound
        size={16}
      />
    ),
  },

  {
    value: "TRUST_VERIFIED",
    title: "Trust Verified",
    description: "Verified first",
    icon: (
      <ShieldCheck
        size={16}
      />
    ),
  },
];

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

  const indianLocation =
    isIndia(
      filters.country
    );

  const districts =
    indianLocation &&
    filters.state
      ? getDistrictsForState(
          filters.state
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

  const selectedDistrictExists =
    districts.some(
      (district) =>
        district.value ===
        filters.district
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
      "district",
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
      "district",
      ""
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
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_12px_38px_rgba(15,23,42,0.065)] backdrop-blur-xl">

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/30 to-amber-50/30 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-sm">
              <SlidersHorizontal
                size={17}
              />
            </span>

            <div>
              <h2 className="text-base font-black tracking-[-0.02em] text-[#0B2D5C]">
                Refine Your Search
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                Use only the preferences that matter to you.
              </p>
            </div>
          </div>

          {isFiltering && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">
              <BadgeCheck
                size={13}
              />

              Filters active
            </span>
          )}
        </div>
      </div>

      <form
        className="space-y-4 p-4 sm:p-5"
        onSubmit={
          handleSubmit
        }
      >

        {/* =====================================================
            Sort
            ===================================================== */}

        <CompactSection
          eyebrow="Profile ordering"
          title="Sort Profiles"
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {SORT_OPTIONS.map(
              (option) => {
                const active =
                  filters.sort ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    disabled={
                      loading
                    }
                    aria-pressed={
                      active
                    }
                    onClick={() =>
                      onChange(
                        "sort",
                        option.value
                      )
                    }
                    className={[
                      "group relative flex h-[60px] items-center gap-2.5 rounded-xl border px-3 text-left",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15",
                      "disabled:cursor-not-allowed disabled:opacity-50",

                      active
                        ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",

                        active
                          ? "bg-gradient-to-br from-[#0B2D5C] to-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 group-hover:text-blue-700",
                      ].join(" ")}
                    >
                      {
                        option.icon
                      }
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-xs font-black text-[#0B2D5C] sm:text-sm">
                        {
                          option.title
                        }
                      </span>

                      <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                        {
                          option.description
                        }
                      </span>
                    </span>

                    {active && (
                      <BadgeCheck
                        size={13}
                        strokeWidth={2.7}
                        className="absolute right-2 top-2 text-emerald-600"
                      />
                    )}
                  </button>
                );
              }
            )}
          </div>

          {filters.sort ===
            "TRUST_VERIFIED" && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-[10px] font-semibold text-amber-900 sm:text-[11px]">
              <ShieldCheck
                size={13}
                className="shrink-0 text-amber-700"
              />

              Verified profiles are prioritized first.
            </div>
          )}
        </CompactSection>

        {/* =====================================================
            Match Basics
            ===================================================== */}

        <CompactSection
          eyebrow="Match basics"
          title="Age, Height & Status"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            <Input
              label="Age From"
              type="number"
              min={18}
              max={100}
              inputMode="numeric"
              value={
                filters.ageFrom
              }
              placeholder="Any age"
              disabled={
                loading
              }
              onChange={(event) =>
                onChange(
                  "ageFrom",
                  event.target.value
                )
              }
            />

            <Input
              label="Age To"
              type="number"
              min={18}
              max={100}
              inputMode="numeric"
              value={
                filters.ageTo
              }
              placeholder="Any age"
              disabled={
                loading
              }
              onChange={(event) =>
                onChange(
                  "ageTo",
                  event.target.value
                )
              }
            />

            <Select
              label="Height From"
              value={
                filters.heightFrom
              }
              disabled={
                loading
              }
              leftIcon={
                <Ruler
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "heightFrom",
                  event.target.value
                )
              }
            >
              <option value="">
                Any height
              </option>

              {HEIGHT_OPTIONS.map(
                (height) => (
                  <option
                    key={
                      height.value
                    }
                    value={
                      height.value
                    }
                  >
                    {
                      height.label
                    }
                  </option>
                )
              )}
            </Select>

            <Select
              label="Height To"
              value={
                filters.heightTo
              }
              disabled={
                loading
              }
              leftIcon={
                <Ruler
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "heightTo",
                  event.target.value
                )
              }
            >
              <option value="">
                Any height
              </option>

              {HEIGHT_OPTIONS.map(
                (height) => (
                  <option
                    key={
                      height.value
                    }
                    value={
                      height.value
                    }
                  >
                    {
                      height.label
                    }
                  </option>
                )
              )}
            </Select>


            <Select
              label="Marital Status"
              value={
                filters.maritalStatus
              }
              disabled={
                loading
              }
              leftIcon={
                <HeartHandshake
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "maritalStatus",
                  event.target.value
                )
              }
            >
              <option value="">
                Any marital status
              </option>

              {MARITAL_STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {status}
                  </option>
                )
              )}
            </Select>
          </div>
        </CompactSection>

        {/* =====================================================
            Faith & Community
            ===================================================== */}

        <CompactSection
          eyebrow="Faith & background"
          title="Faith & Community"
        >
          <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2 text-[10px] leading-5 text-amber-900 sm:text-[11px]">
            Religion and community are separate filters. For example, you can search for Christianity with Reddy, Kamma or another community background.
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            <Select
              label="Religion"
              value={
                filters.religion
              }
              disabled={
                loading
              }
              leftIcon={
                <Church
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "religion",
                  event.target.value
                )
              }
            >
              <option value="">
                Any religion
              </option>

              {RELIGION_OPTIONS.map(
                (religion) => (
                  <option
                    key={
                      religion
                    }
                    value={
                      religion
                    }
                  >
                    {religion}
                  </option>
                )
              )}
            </Select>

            <Select
              label="Denomination"
              value={
                filters.denomination
              }
              disabled={
                loading
              }
              leftIcon={
                <Church
                  size={16}
                />
              }
              onChange={(event) =>
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
                (denomination) => (
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
            </Select>

            <Input
              label="Community / Caste"
              value={
                filters.community
              }
              placeholder="Example: Reddy"
              disabled={
                loading
              }
              leftIcon={
                <UsersRound
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "community",
                  event.target.value
                )
              }
            />

            <Select
              label="Mother Tongue"
              value={
                filters.motherTongue
              }
              disabled={
                loading
              }
              leftIcon={
                <Languages
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "motherTongue",
                  event.target.value
                )
              }
            >
              <option value="">
                Any mother tongue
              </option>

              {MOTHER_TONGUE_OPTIONS.map(
                (language) => (
                  <option
                    key={
                      language
                    }
                    value={
                      language
                    }
                  >
                    {language}
                  </option>
                )
              )}
            </Select>

            <Select
              label="Baptized"
              value={
                filters.baptized
              }
              disabled={
                loading
              }
              leftIcon={
                <BadgeCheck
                  size={16}
                />
              }
              onChange={(event) =>
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
            </Select>
          </div>
        </CompactSection>

        {/* =====================================================
            Education & Career
            ===================================================== */}

        <CompactSection
          eyebrow="Education & career"
          title="Education & Profession"
        >
          <div className="grid gap-3 sm:grid-cols-2">

            <Select
              label="Education"
              value={
                filters.highestEducation
              }
              disabled={
                loading
              }
              leftIcon={
                <GraduationCap
                  size={16}
                />
              }
              onChange={(event) =>
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
                (education) => (
                  <option
                    key={
                      education
                    }
                    value={
                      education
                    }
                  >
                    {education}
                  </option>
                )
              )}
            </Select>

            <Select
              label="Profession"
              value={
                filters.profession
              }
              disabled={
                loading
              }
              leftIcon={
                <BriefcaseBusiness
                  size={16}
                />
              }
              onChange={(event) =>
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
                      (profession) => (
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
            </Select>
          </div>
        </CompactSection>

        {/* =====================================================
            Location
            ===================================================== */}

        <CompactSection
          eyebrow="Location"
          title="Preferred Location"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Country */}

            <Select
              label="Country"
              value={
                filters.country
              }
              disabled={
                loading
              }
              leftIcon={
                <MapPin
                  size={16}
                />
              }
              onChange={(event) =>
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
            </Select>

            {/* State */}

            <Select
              label="State"
              value={
                filters.state
              }
              disabled={
                loading ||
                !filters.country
              }
              leftIcon={
                <MapPin
                  size={16}
                />
              }
              onChange={(event) =>
                handleStateChange(
                  event.target.value
                )
              }
            >
              <option value="">
                {filters.country
                  ? "Any state"
                  : "Select country first"}
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
            </Select>

            {/* District */}

            {indianLocation ? (
              <Select
                label="District"
                value={
                  filters.district
                }
                disabled={
                  loading ||
                  !filters.state
                }
                leftIcon={
                  <MapPin
                    size={16}
                  />
                }
                onChange={(event) =>
                  onChange(
                    "district",
                    event.target.value
                  )
                }
              >
                <option value="">
                  {filters.state
                    ? "Any district"
                    : "Select state first"}
                </option>

                {filters.district &&
                  !selectedDistrictExists && (
                    <option
                      value={
                        filters.district
                      }
                    >
                      {
                        filters.district
                      }
                    </option>
                  )}

                {districts.map(
                  (district) => (
                    <option
                      key={
                        district.value
                      }
                      value={
                        district.value
                      }
                    >
                      {
                        district.label
                      }
                    </option>
                  )
                )}
              </Select>
            ) : (
              <Input
                label="District"
                value={
                  filters.district
                }
                disabled={
                  loading ||
                  !filters.state
                }
                leftIcon={
                  <MapPin
                    size={16}
                  />
                }
                maxLength={120}
                placeholder={
                  filters.state
                    ? "Any district"
                    : "Select state first"
                }
                onChange={(event) =>
                  onChange(
                    "district",
                    event.target.value
                  )
                }
              />
            )}

            {/* City */}

            <Select
              label="City"
              value={
                filters.city
              }
              disabled={
                loading ||
                !filters.country ||
                !filters.state
              }
              leftIcon={
                <MapPin
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "city",
                  event.target.value
                )
              }
            >
              <option value="">
                {filters.state
                  ? "Any city"
                  : "Select state first"}
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
            </Select>

          </div>
        </CompactSection>

        {/* =====================================================
            Lifestyle
            ===================================================== */}

        <CompactSection
          eyebrow="Lifestyle"
          title="Lifestyle Preferences"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <Select
              label="Diet"
              value={
                filters.diet
              }
              disabled={
                loading
              }
              leftIcon={
                <Utensils
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "diet",
                  event.target.value
                )
              }
            >
              <option value="">
                Any diet
              </option>

              {DIET_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </option>
                )
              )}
            </Select>

            <Select
              label="Smoking"
              value={
                filters.smoking
              }
              disabled={
                loading
              }
              leftIcon={
                <Cigarette
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "smoking",
                  event.target.value
                )
              }
            >
              <option value="">
                Any preference
              </option>

              {SMOKING_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </option>
                )
              )}
            </Select>

            <Select
              label="Drinking"
              value={
                filters.drinking
              }
              disabled={
                loading
              }
              leftIcon={
                <Wine
                  size={16}
                />
              }
              onChange={(event) =>
                onChange(
                  "drinking",
                  event.target.value
                )
              }
            >
              <option value="">
                Any preference
              </option>

              {DRINKING_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </option>
                )
              )}
            </Select>
          </div>
        </CompactSection>

        {/* =====================================================
            Verification
            ===================================================== */}

        <div className="overflow-hidden rounded-[18px] border border-amber-200/70 bg-gradient-to-r from-amber-50/65 via-white to-blue-50/45 shadow-sm">
          <div className="px-4 py-3.5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-[#0B2D5C] shadow-sm">
                  <BadgeCheck
                    size={16}
                    strokeWidth={2.6}
                  />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-[#0B2D5C]">
                      Verification Credentials
                    </h3>

                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-amber-700">
                      Trusted Profiles
                    </span>
                  </div>

                  <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                    Filter by trusted verification.
                  </p>
                </div>
              </div>

              <div className="grid flex-1 gap-2 sm:grid-cols-3 lg:max-w-3xl">
                <CompactVerificationToggle
                  active={
                    filters.aadhaarVerified ===
                    "true"
                  }
                  disabled={
                    loading
                  }
                  title="Aadhaar Verified"
                  icon={
                    <ShieldCheck
                      size={15}
                    />
                  }
                  variant="aadhaar"
                  onClick={
                    handleAadhaarToggle
                  }
                />

                <CompactVerificationToggle
                  active={
                    filters.idVerified ===
                    "true"
                  }
                  disabled={
                    loading
                  }
                  title="ID Verified"
                  icon={
                    <Fingerprint
                      size={15}
                    />
                  }
                  variant="identity"
                  onClick={
                    handleIdToggle
                  }
                />

                <CompactVerificationToggle
                  active={
                    filters.churchVerified ===
                    "true"
                  }
                  disabled={
                    loading
                  }
                  title="Church Verified"
                  icon={
                    <Church
                      size={15}
                    />
                  }
                  variant="church"
                  onClick={
                    handleChurchToggle
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            Actions
            ===================================================== */}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[10px] leading-5 text-slate-400 sm:text-[11px]">
            Leave fields blank to keep your search broader.
            Multiple selected filters must all match.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                loading
              }
              leftIcon={
                <RotateCcw
                  size={15}
                />
              }
              onClick={
                onReset
              }
            >
              Reset
            </Button>

            <Button
              type="submit"
              size="sm"
              loading={
                loading
              }
              leftIcon={
                <Search
                  size={15}
                />
              }
              className="sm:min-w-[150px]"
            >
              Search Profiles
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function CompactSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/50 p-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] sm:p-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[8px] font-black uppercase tracking-[0.13em] text-blue-600 sm:text-[9px]">
          {eyebrow}
        </span>

        <h3 className="text-sm font-black tracking-[-0.02em] text-[#0B2D5C]">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

type VerificationVariant =
  | "aadhaar"
  | "identity"
  | "church";

function CompactVerificationToggle({
  active,
  disabled,
  title,
  icon,
  variant,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  title: string;
  icon: ReactNode;
  variant: VerificationVariant;
  onClick: () => void;
}) {
  const activeStyles: Record<
    VerificationVariant,
    string
  > = {
    aadhaar:
      "border-amber-300 bg-amber-50 text-amber-900 shadow-sm",

    identity:
      "border-blue-300 bg-blue-50 text-blue-900 shadow-sm",

    church:
      "border-indigo-300 bg-indigo-50 text-indigo-900 shadow-sm",
  };

  const iconStyles: Record<
    VerificationVariant,
    string
  > = {
    aadhaar:
      "bg-amber-400 text-[#0B2D5C]",

    identity:
      "bg-blue-600 text-white",

    church:
      "bg-[#0B2D5C] text-white",
  };

  return (
    <button
      type="button"
      disabled={
        disabled
      }
      aria-pressed={
        active
      }
      onClick={
        onClick
      }
      className={[
        "flex h-[46px] min-w-0 items-center gap-2 rounded-xl border px-2.5 text-left",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",

        active
          ? activeStyles[
              variant
            ]
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/30",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",

          active
            ? iconStyles[
                variant
              ]
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 truncate text-[11px] font-extrabold sm:text-xs">
        {title}
      </span>

      {active && (
        <BadgeCheck
          size={13}
          strokeWidth={2.7}
          className="ml-auto shrink-0 text-emerald-600"
        />
      )}
    </button>
  );
}