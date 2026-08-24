"use client";

import { useState } from "react";

import {
  Church,
  Droplets,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";

import { useProfile } from "@/features/profile/context/useProfile";

import {
  DENOMINATIONS,
} from "@/features/profile/data/profileOptions";

import {
  COUNTRIES,
  getCitiesForCountryState,
  getStatesForCountry,
} from "@/features/profile/data/worldLocations";

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

  const [errors, setErrors] =
    useState<ChurchFormErrors>({});

  const states =
    churchInfo.churchCountry
      ? getStatesForCountry(
          churchInfo.churchCountry
        )
      : [];

  const cities =
    churchInfo.churchCountry &&
    churchInfo.churchState
      ? getCitiesForCountryState(
          churchInfo.churchCountry,
          churchInfo.churchState
        )
      : [];

  const selectedCountryExists =
    COUNTRIES.some(
      (country) =>
        country.value ===
        churchInfo.churchCountry
    );

  const selectedStateExists =
    states.some(
      (state) =>
        state.value ===
        churchInfo.churchState
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        churchInfo.churchCity
    );

  function clearError(
    field: keyof ChurchFormErrors
  ): void {
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
  ): void {
    setProfile((previous) => ({
      ...previous,

      churchInfo: {
        ...previous.churchInfo,
        [field]: value,
      },
    }));

    clearError(
      field as keyof ChurchFormErrors
    );
  }

  function updateChurchLocation(
    field:
      | "churchCountry"
      | "churchState"
      | "churchDistrict"
      | "churchCity",
    value: string
  ): void {
    setProfile((previous) => {
      let nextChurchInfo: ChurchInfo = {
        ...previous.churchInfo,
        [field]: value,
      };

      if (field === "churchCountry") {
        nextChurchInfo = {
          ...previous.churchInfo,
          churchCountry: value,
          churchState: "",
          churchDistrict: "",
          churchCity: "",
        };
      }

      if (field === "churchState") {
        nextChurchInfo = {
          ...previous.churchInfo,
          churchState: value,
          churchDistrict: "",
          churchCity: "",
        };
      }

      if (field === "churchDistrict") {
        nextChurchInfo = {
          ...previous.churchInfo,
          churchDistrict: value,
          churchCity: "",
        };
      }

      return {
        ...previous,
        churchInfo: nextChurchInfo,
      };
    });

    clearError(
      field as keyof ChurchFormErrors
    );

    if (field === "churchCountry") {
      clearError("churchState");
      clearError("churchDistrict");
      clearError("churchCity");
    }

    if (field === "churchState") {
      clearError("churchDistrict");
      clearError("churchCity");
    }

    if (field === "churchDistrict") {
      clearError("churchCity");
    }
  }

  function handleContinue(): void {
    const validationErrors =
      validateChurchInfo(
        churchInfo,
        {
          state: churchInfo.churchState,
          district: churchInfo.churchDistrict,
          city: churchInfo.churchCity,
        }
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

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/75 via-white to-amber-50/55 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-indigo-700 text-white shadow-sm">
            <Church size={17} />
          </div>

          <div className="min-w-0">

            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Step 2 of 7
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-2">

              <h2 className="text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
                Church Information
              </h2>

              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Optional
              </span>

            </div>

            <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Share your church background if you wish. All
              information on this page is optional.
            </p>

          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">

        {/* =====================================================
            Optional notice
            ===================================================== */}

        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-3">

          <div className="flex items-start gap-2.5">

            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck size={15} />
            </div>

            <div>

              <p className="text-[11px] font-black text-emerald-900 sm:text-xs">
                Church information is completely optional
              </p>

              <p className="mt-0.5 text-[10px] leading-5 text-emerald-800 sm:text-[11px]">
                You may continue without entering a denomination,
                church name, pastor, baptism status, membership ID
                or church location. These fields do not block
                profile completion or verification submission.
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            Church Details
            ===================================================== */}

        <SectionHeading
          icon={
            <Church size={15} />
          }
          title="Church Details"
          description="Optional church and ministry information."
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">

          <FormField
            label="Denomination"
            htmlFor="church-denomination"
            helperText="Optional"
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
            label="Church Name"
            htmlFor="church-name"
            helperText="Optional"
            error={
              errors.churchName
            }
          >
            <IconField
              icon={
                <Church size={16} />
              }
            >
              <Input
                id="church-name"
                value={
                  churchInfo.churchName
                }
                error={
                  errors.churchName
                }
                placeholder="Enter church name"
                className="pl-10"
                onChange={(event) =>
                  updateChurchInfo(
                    "churchName",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Pastor Name"
            htmlFor="pastor-name"
            helperText="Optional"
            error={
              errors.pastorName
            }
          >
            <IconField
              icon={
                <User size={16} />
              }
            >
              <Input
                id="pastor-name"
                value={
                  churchInfo.pastorName
                }
                error={
                  errors.pastorName
                }
                placeholder="Enter pastor name"
                className="pl-10"
                onChange={(event) =>
                  updateChurchInfo(
                    "pastorName",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Baptized"
            htmlFor="church-baptized"
            helperText="Optional"
          >
            <IconField
              icon={
                <Droplets size={16} />
              }
            >
              <Select
                id="church-baptized"
                value={
                  churchInfo.baptized
                }
                className="pl-10"
                onChange={(event) =>
                  updateChurchInfo(
                    "baptized",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Prefer not to answer
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
            </IconField>
          </FormField>

          <FormField
            label="Church Membership ID"
            htmlFor="church-membership-id"
            helperText="Optional"
            error={
              errors.membershipId
            }
            className="md:col-span-2"
          >
            <div className="md:max-w-[calc(50%-0.5rem)]">
              <Input
                id="church-membership-id"
                value={
                  churchInfo.membershipId
                }
                error={
                  errors.membershipId
                }
                placeholder="Enter membership ID"
                onChange={(event) =>
                  updateChurchInfo(
                    "membershipId",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

        </div>

        {/* =====================================================
            Church Location
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <MapPin size={15} />
          }
          title="Church Location"
          description="Optional structured location for your church."
          variant="green"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2 lg:grid-cols-4">

          <FormField
            label="Church Country"
            htmlFor="church-country"
            helperText="Optional"
          >
            <Select
              id="church-country"
              value={
                churchInfo.churchCountry
              }
              onChange={(event) =>
                updateChurchLocation(
                  "churchCountry",
                  event.target.value
                )
              }
            >
              <option value="">
                Select country
              </option>

              {churchInfo.churchCountry &&
                !selectedCountryExists && (
                  <option
                    value={
                      churchInfo.churchCountry
                    }
                  >
                    {churchInfo.churchCountry}
                  </option>
                )}

              {COUNTRIES.map(
                (country) => (
                  <option
                    key={country.isoCode}
                    value={country.value}
                  >
                    {country.label}
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField
            label="Church State"
            htmlFor="church-state"
            helperText="Optional"
            error={
              errors.churchState
            }
          >
            <Select
              id="church-state"
              value={
                churchInfo.churchState
              }
              error={
                errors.churchState
              }
              disabled={
                !churchInfo.churchCountry
              }
              onChange={(event) =>
                updateChurchLocation(
                  "churchState",
                  event.target.value
                )
              }
            >
              <option value="">
                Select state
              </option>

              {churchInfo.churchState &&
                !selectedStateExists && (
                  <option
                    value={
                      churchInfo.churchState
                    }
                  >
                    {churchInfo.churchState}
                  </option>
                )}

              {states.map(
                (state) => (
                  <option
                    key={`${churchInfo.churchCountry}-${state.isoCode}`}
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
            htmlFor="church-district"
            helperText="Optional"
            error={
              errors.churchDistrict
            }
          >
            <Input
              id="church-district"
              value={
                churchInfo.churchDistrict
              }
              error={
                errors.churchDistrict
              }
              disabled={
                !churchInfo.churchState
              }
              maxLength={120}
              placeholder={
                churchInfo.churchState
                  ? "Enter district"
                  : "Select state first"
              }
              onChange={(event) =>
                updateChurchLocation(
                  "churchDistrict",
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Church City"
            htmlFor="church-city"
            helperText="Optional"
            error={
              errors.churchCity
            }
          >
            <Select
              id="church-city"
              value={
                churchInfo.churchCity
              }
              error={
                errors.churchCity
              }
              disabled={
                !churchInfo.churchState
              }
              onChange={(event) =>
                updateChurchLocation(
                  "churchCity",
                  event.target.value
                )
              }
            >
              <option value="">
                Select city
              </option>

              {churchInfo.churchCity &&
                !selectedCityExists && (
                  <option
                    value={
                      churchInfo.churchCity
                    }
                  >
                    {churchInfo.churchCity}
                  </option>
                )}

              {cities.map(
                (city) => (
                  <option
                    key={city.value}
                    value={city.value}
                  >
                    {city.label}
                  </option>
                )
              )}
            </Select>
          </FormField>

        </div>

        {/* =====================================================
            Navigation
            ===================================================== */}

        <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            className="sm:w-auto"
            onClick={onBack}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            className="sm:min-w-[150px] sm:w-auto"
            onClick={handleContinue}
          >
            Save & Continue
          </Button>

        </div>

      </div>

    </Card>
  );
}

function IconField({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">

      <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
        {icon}
      </span>

      {children}

    </div>
  );
}

type SectionHeadingVariant =
  | "blue"
  | "green";

function SectionHeading({
  icon,
  title,
  description,
  variant = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: SectionHeadingVariant;
}) {
  const styles: Record<
    SectionHeadingVariant,
    string
  > = {
    blue:
      "bg-blue-50 text-[#0B2D5C]",

    green:
      "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="flex items-start gap-2.5">

      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          styles[variant],
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <h3 className="text-sm font-black text-[#0B2D5C]">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

function SectionDivider() {
  return (
    <div className="my-5 border-t border-slate-100" />
  );
}
