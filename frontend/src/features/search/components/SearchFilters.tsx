"use client";

import {
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";

import {
  DENOMINATIONS,
  PROFESSION_GROUPS,
} from "@/features/profile/data/profileOptions";

import {
  getCitiesForState,
  getDistrictsForState,
  INDIA_STATES,
} from "@/features/profile/data/indiaLocations";

export interface SearchFilterValues {
  ageFrom: string;
  ageTo: string;
  denomination: string;
  profession: string;
  state: string;
  district: string;
  city: string;
  maritalStatus: string;
  verifiedOnly: boolean;
}

export const initialSearchFilters: SearchFilterValues = {
  ageFrom: "",
  ageTo: "",
  denomination: "",
  profession: "",
  state: "",
  district: "",
  city: "",
  maritalStatus: "",
  verifiedOnly: false,
};

interface SearchFiltersProps {
  filters: SearchFilterValues;
  mobile?: boolean;
  onChange: (
    filters: SearchFilterValues
  ) => void;
  onClear: () => void;
  onClose?: () => void;
}

const controlClassName =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export default function SearchFilters({
  filters,
  mobile = false,
  onChange,
  onClear,
  onClose,
}: SearchFiltersProps) {
  const districts =
    getDistrictsForState(
      filters.state
    );

  const cities =
    getCitiesForState(
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

  function updateFilter<
    K extends keyof SearchFilterValues,
  >(
    field: K,
    value: SearchFilterValues[K]
  ): void {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  function updateState(
    state: string
  ): void {
    onChange({
      ...filters,
      state,
      district: "",
      city: "",
    });
  }

  function updateDistrict(
    district: string
  ): void {
    onChange({
      ...filters,
      district,
      city: "",
    });
  }

  return (
    <Card className="overflow-hidden p-0 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-md">
              <SlidersHorizontal
                size={20}
              />
            </div>

            <div>
              <h2 className="font-black text-[#0B2D5C]">
                Search Filters
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Refine your matches
              </p>
            </div>
          </div>

          {mobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label className="text-sm font-bold text-slate-700">
            Preferred Age
          </label>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <input
              type="number"
              min="18"
              max="100"
              value={filters.ageFrom}
              placeholder="From"
              className={controlClassName}
              onChange={(event) =>
                updateFilter(
                  "ageFrom",
                  event.target.value
                )
              }
            />

            <input
              type="number"
              min="18"
              max="100"
              value={filters.ageTo}
              placeholder="To"
              className={controlClassName}
              onChange={(event) =>
                updateFilter(
                  "ageTo",
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="search-denomination"
            className="text-sm font-bold text-slate-700"
          >
            Denomination
          </label>

          <select
            id="search-denomination"
            value={
              filters.denomination
            }
            className={`${controlClassName} mt-2`}
            onChange={(event) =>
              updateFilter(
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
                  key={denomination}
                  value={denomination}
                >
                  {denomination}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="search-profession"
            className="text-sm font-bold text-slate-700"
          >
            Profession
          </label>

          <select
            id="search-profession"
            value={filters.profession}
            className={`${controlClassName} mt-2`}
            onChange={(event) =>
              updateFilter(
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
                  key={group.label}
                  label={group.label}
                >
                  {group.professions.map(
                    (profession) => (
                      <option
                        key={profession}
                        value={profession}
                      >
                        {profession}
                      </option>
                    )
                  )}
                </optgroup>
              )
            )}
          </select>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="mb-4 flex items-center gap-2">
            <MapPin
              size={18}
              className="text-[#0B2D5C]"
            />

            <div>
              <p className="text-sm font-bold text-[#0B2D5C]">
                Location
              </p>

              <p className="text-xs text-slate-500">
                State → District → City
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="search-state"
                className="text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                State
              </label>

              <select
                id="search-state"
                value={filters.state}
                className={`${controlClassName} mt-1.5 bg-white`}
                onChange={(event) =>
                  updateState(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Any state
                </option>

                {INDIA_STATES.map(
                  (state) => (
                    <option
                      key={state.isoCode}
                      value={state.value}
                    >
                      {state.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="search-district"
                className="text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                District
              </label>

              <select
                id="search-district"
                value={filters.district}
                disabled={!filters.state}
                className={`${controlClassName} mt-1.5 bg-white`}
                onChange={(event) =>
                  updateDistrict(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Any district
                </option>

                {filters.district &&
                  !selectedDistrictExists && (
                    <option
                      value={
                        filters.district
                      }
                    >
                      {filters.district}
                    </option>
                  )}

                {districts.map(
                  (district) => (
                    <option
                      key={district.value}
                      value={district.value}
                    >
                      {district.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="search-city"
                className="text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                City
              </label>

              <select
                id="search-city"
                value={filters.city}
                disabled={!filters.state}
                className={`${controlClassName} mt-1.5 bg-white`}
                onChange={(event) =>
                  updateFilter(
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
                      {filters.city}
                    </option>
                  )}

                {cities.map((city) => (
                  <option
                    key={city.value}
                    value={city.value}
                  >
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="search-marital-status"
            className="text-sm font-bold text-slate-700"
          >
            Marital Status
          </label>

          <select
            id="search-marital-status"
            value={
              filters.maritalStatus
            }
            className={`${controlClassName} mt-2`}
            onChange={(event) =>
              updateFilter(
                "maritalStatus",
                event.target.value
              )
            }
          >
            <option value="">
              Any status
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
          </select>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50">
          <div>
            <p className="text-sm font-bold text-slate-700">
              Verified profiles only
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Show verified members
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              filters.verifiedOnly
            }
            onChange={(event) =>
              updateFilter(
                "verifiedOnly",
                event.target.checked
              )
            }
            className="h-5 w-5 rounded border-slate-300 accent-[#0B2D5C]"
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <RotateCcw size={17} />

          Clear all filters
        </button>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-2xl bg-[#0B2D5C] text-sm font-bold text-white shadow-lg transition hover:bg-[#123C73]"
          >
            View matching profiles
          </button>
        )}
      </div>
    </Card>
  );
}