"use client";

import {
  useState,
} from "react";

import {
  Church,
  Droplets,
  MapPin,
  User,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";

import {
  DENOMINATIONS,
} from "@/features/profile/data/profileOptions";

import {
  formatLocation,
  getCitiesForState,
  getDistrictsForState,
  INDIA_STATES,
  parseLocation,
} from "@/features/profile/data/indiaLocations";

import type {
  ChurchInfo,
} from "@/features/profile/types";

import {
  ChurchFormErrors,
  focusFirstInvalidField,
  hasValidationErrors,
  validateChurchInfo,
} from "@/features/profile/validation/profileValidation";

interface ChurchInfoFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ChurchInfoForm({
  onNext,
  onBack,
}: ChurchInfoFormProps) {
  const {
    churchInfo,
    setProfile,
  } = useProfile();

  const [
    errors,
    setErrors,
  ] = useState<ChurchFormErrors>(
    {}
  );

  const churchLocation =
    parseLocation(
      churchInfo.churchAddress
    );

  const districts =
    getDistrictsForState(
      churchLocation.state
    );

  const cities =
    getCitiesForState(
      churchLocation.state
    );

  const selectedDistrictExists =
    districts.some(
      (district) =>
        district.value ===
        churchLocation.district
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        churchLocation.city
    );

  function clearError(
    field: keyof ChurchFormErrors
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

  function updateChurchInfo(
    field: keyof ChurchInfo,
    value: string
  ) {
    setProfile((previous) => ({
      ...previous,

      churchInfo: {
        ...previous.churchInfo,
        [field]: value,
      },
    }));

    clearError(field);
  }

  function updateChurchLocation(
    field:
      | "state"
      | "district"
      | "city",
    value: string
  ) {
    let nextState =
      churchLocation.state;

    let nextDistrict =
      churchLocation.district;

    let nextCity =
      churchLocation.city;

    if (field === "state") {
      nextState = value;
      nextDistrict = "";
      nextCity = "";

      clearError("churchState");
      clearError("churchDistrict");
      clearError("churchCity");
    }

    if (field === "district") {
      nextDistrict = value;
      nextCity = "";

      clearError(
        "churchDistrict"
      );

      clearError("churchCity");
    }

    if (field === "city") {
      nextCity = value;

      clearError("churchCity");
    }

    updateChurchInfo(
      "churchAddress",
      formatLocation(
        nextCity,
        nextDistrict,
        nextState
      )
    );
  }

  function handleContinue(): void {
    const validationErrors =
      validateChurchInfo(
        churchInfo,
        churchLocation
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
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-amber-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-lg sm:h-14 sm:w-14">
            <Church size={26} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
              Step 2 of 7
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2D5C] sm:text-3xl">
              Church Information
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Share your church,
              denomination and spiritual
              background with prospective
              matches.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-7 lg:p-10">
        <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800">
          Fields marked with a red
          <span className="mx-1 font-bold text-red-500">
            *
          </span>
          are required before continuing.
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          <FormField
            label="Church Name"
            required
            htmlFor="church-name"
            error={errors.churchName}
          >
            <div className="relative">
              <Church
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="church-name"
                value={
                  churchInfo.churchName
                }
                error={
                  errors.churchName
                }
                placeholder="Enter church name"
                className="pl-11"
                onChange={(event) =>
                  updateChurchInfo(
                    "churchName",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Denomination"
            required
            htmlFor="church-denomination"
            error={
              errors.denomination
            }
          >
            <Select
              id="church-denomination"
              value={
                churchInfo.denomination
              }
              error={
                errors.denomination
              }
              onChange={(event) =>
                updateChurchInfo(
                  "denomination",
                  event.target.value
                )
              }
            >
              <option value="">
                Select denomination
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
            </Select>
          </FormField>

          <FormField
            label="Pastor Name"
            htmlFor="pastor-name"
            helperText="Optional"
          >
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="pastor-name"
                value={
                  churchInfo.pastorName
                }
                placeholder="Enter pastor name"
                className="pl-11"
                onChange={(event) =>
                  updateChurchInfo(
                    "pastorName",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Baptized"
            htmlFor="church-baptized"
          >
            <div className="relative">
              <Droplets
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Select
                id="church-baptized"
                value={
                  churchInfo.baptized
                }
                className="pl-11"
                onChange={(event) =>
                  updateChurchInfo(
                    "baptized",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select
                </option>

                <option value="true">
                  Yes
                </option>

                <option value="false">
                  No
                </option>

                <option value="rather-not-say">
                  Rather not say
                </option>
              </Select>
            </div>
          </FormField>

          <FormField
            label="Church Membership ID"
            htmlFor="church-membership-id"
            helperText="Optional"
          >
            <Input
              id="church-membership-id"
              value={
                churchInfo.membershipId
              }
              placeholder="Enter membership ID"
              onChange={(event) =>
                updateChurchInfo(
                  "membershipId",
                  event.target.value
                )
              }
            />
          </FormField>

          <div className="hidden md:block" />

          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                <MapPin size={19} />
              </div>

              <div>
                <h3 className="font-bold text-[#0B2D5C]">
                  Church Location
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
            label="Church State"
            required
            htmlFor="church-state"
            error={errors.churchState}
          >
            <Select
              id="church-state"
              value={
                churchLocation.state
              }
              error={
                errors.churchState
              }
              onChange={(event) =>
                updateChurchLocation(
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
            label="Church District"
            required
            htmlFor="church-district"
            error={
              errors.churchDistrict
            }
          >
            <Select
              id="church-district"
              value={
                churchLocation.district
              }
              error={
                errors.churchDistrict
              }
              disabled={
                !churchLocation.state
              }
              onChange={(event) =>
                updateChurchLocation(
                  "district",
                  event.target.value
                )
              }
            >
              <option value="">
                Select district
              </option>

              {churchLocation.district &&
                !selectedDistrictExists && (
                  <option
                    value={
                      churchLocation.district
                    }
                  >
                    {
                      churchLocation.district
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
            label="Church City"
            required
            htmlFor="church-city"
            error={errors.churchCity}
            className="md:col-span-2 md:max-w-[calc(50%-0.75rem)]"
          >
            <Select
              id="church-city"
              value={
                churchLocation.city
              }
              error={
                errors.churchCity
              }
              disabled={
                !churchLocation.state
              }
              onChange={(event) =>
                updateChurchLocation(
                  "city",
                  event.target.value
                )
              }
            >
              <option value="">
                Select city
              </option>

              {churchLocation.city &&
                !selectedCityExists && (
                  <option
                    value={
                      churchLocation.city
                    }
                  >
                    {
                      churchLocation.city
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