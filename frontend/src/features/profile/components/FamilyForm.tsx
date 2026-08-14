"use client";

import {
  useState,
} from "react";

import {
  Baby,
  HeartHandshake,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

import {
  formatLocation,
  getCitiesForState,
  getDistrictsForState,
  INDIA_STATES,
  parseLocation,
} from "@/features/profile/data/indiaLocations";

import type {
  FamilyInfo,
} from "@/features/profile/types";

import {
  FamilyFormErrors,
  focusFirstInvalidField,
  hasValidationErrors,
  validateFamilyInfo,
} from "@/features/profile/validation/profileValidation";

interface FamilyFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FamilyForm({
  onNext,
  onBack,
}: FamilyFormProps) {
  const { familyInfo } =
    useProfile();

  const { updateSection } =
    useProfileUpdater();

  const [
    errors,
    setErrors,
  ] = useState<FamilyFormErrors>(
    {}
  );

  const familyLocation =
    parseLocation(
      familyInfo.familyLocation
    );

  const districts =
    getDistrictsForState(
      familyLocation.state
    );

  const cities =
    getCitiesForState(
      familyLocation.state
    );

  const selectedDistrictExists =
    districts.some(
      (district) =>
        district.value ===
        familyLocation.district
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        familyLocation.city
    );

  function clearError(
    field: keyof FamilyFormErrors
  ) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });
  }

  function updateFamilyInfo(
    field: keyof FamilyInfo,
    value: string
  ) {
    updateSection(
      "familyInfo",
      field,
      value
    );

    clearError(field);
  }

  function updateFamilyLocation(
    field:
      | "state"
      | "district"
      | "city",
    value: string
  ) {
    let nextState =
      familyLocation.state;

    let nextDistrict =
      familyLocation.district;

    let nextCity =
      familyLocation.city;

    if (field === "state") {
      nextState = value;
      nextDistrict = "";
      nextCity = "";

      clearError("familyState");
      clearError("familyDistrict");
      clearError("familyCity");
    }

    if (field === "district") {
      nextDistrict = value;
      nextCity = "";

      clearError(
        "familyDistrict"
      );

      clearError("familyCity");
    }

    if (field === "city") {
      nextCity = value;

      clearError("familyCity");
    }

    updateFamilyInfo(
      "familyLocation",
      formatLocation(
        nextCity,
        nextDistrict,
        nextState
      )
    );
  }

  function handleContinue(): void {
    const validationErrors =
      validateFamilyInfo(
        familyInfo,
        familyLocation
      );

    setErrors(
      validationErrors
    );

    if (
      hasValidationErrors(
        validationErrors
      )
    ) {
      focusFirstInvalidField();
      return;
    }

    onNext();
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-lg ">
            <UsersRound size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
              Step 4 of 7
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0B2D5C] sm:text-2xl">
              Family Details
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              Share a few details about
              your family background and
              home location.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800">
          Fields marked with a red
          <span className="mx-1 font-bold text-red-500">
            *
          </span>
          are required before continuing.
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
          <FormField
            label="Father's Name"
            required
            htmlFor="father-name"
            error={errors.fatherName}
          >
            <div className="relative">
              <UserRound
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="father-name"
                value={
                  familyInfo.fatherName
                }
                error={
                  errors.fatherName
                }
                placeholder="Enter father's name"
                className="pl-11"
                onChange={(event) =>
                  updateFamilyInfo(
                    "fatherName",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Mother's Name"
            required
            htmlFor="mother-name"
            error={errors.motherName}
          >
            <div className="relative">
              <HeartHandshake
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="mother-name"
                value={
                  familyInfo.motherName
                }
                error={
                  errors.motherName
                }
                placeholder="Enter mother's name"
                className="pl-11"
                onChange={(event) =>
                  updateFamilyInfo(
                    "motherName",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Number of Siblings"
            htmlFor="siblings"
            error={errors.siblings}
            helperText="Optional. Enter 0 if you have no siblings."
          >
            <div className="relative">
              <Baby
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="siblings"
                type="number"
                min="0"
                max="20"
                inputMode="numeric"
                value={
                  familyInfo.siblings
                }
                error={errors.siblings}
                placeholder="For example: 2"
                className="pl-11"
                onChange={(event) =>
                  updateFamilyInfo(
                    "siblings",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <div className="hidden md:block" />

          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                <MapPin size={19} />
              </div>

              <div>
                <h3 className="font-bold text-[#0B2D5C]">
                  Family Location
                </h3>

                <p className="text-sm text-slate-500">
                  Select the location in
                  State → District → City
                  order.
                </p>
              </div>
            </div>
          </div>

          <FormField
            label="Family State"
            required
            htmlFor="family-state"
            error={errors.familyState}
          >
            <Select
              id="family-state"
              value={
                familyLocation.state
              }
              error={
                errors.familyState
              }
              onChange={(event) =>
                updateFamilyLocation(
                  "state",
                  event.target.value
                )
              }
            >
              <option value="">
                Select state
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
            </Select>
          </FormField>

          <FormField
            label="Family District"
            required
            htmlFor="family-district"
            error={
              errors.familyDistrict
            }
          >
            <Select
              id="family-district"
              value={
                familyLocation.district
              }
              error={
                errors.familyDistrict
              }
              disabled={
                !familyLocation.state
              }
              onChange={(event) =>
                updateFamilyLocation(
                  "district",
                  event.target.value
                )
              }
            >
              <option value="">
                Select district
              </option>

              {familyLocation.district &&
                !selectedDistrictExists && (
                  <option
                    value={
                      familyLocation.district
                    }
                  >
                    {
                      familyLocation.district
                    }
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
            </Select>
          </FormField>

          <FormField
            label="Family City"
            required
            htmlFor="family-city"
            error={errors.familyCity}
            className="md:col-span-2 md:max-w-[calc(50%-0.75rem)]"
          >
            <Select
              id="family-city"
              value={
                familyLocation.city
              }
              error={
                errors.familyCity
              }
              disabled={
                !familyLocation.state
              }
              onChange={(event) =>
                updateFamilyLocation(
                  "city",
                  event.target.value
                )
              }
            >
              <option value="">
                Select city
              </option>

              {familyLocation.city &&
                !selectedCityExists && (
                  <option
                    value={
                      familyLocation.city
                    }
                  >
                    {
                      familyLocation.city
                    }
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
            </Select>
          </FormField>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="sm:w-auto"
            onClick={onBack}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            fullWidth
            className="sm:w-auto"
            onClick={
              handleContinue
            }
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </Card>
  );
}