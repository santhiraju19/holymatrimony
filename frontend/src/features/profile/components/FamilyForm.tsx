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

  function updateFamilyInfo(
    field: keyof FamilyInfo,
    value: string
  ): void {
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
  ): void {
    let nextState =
      familyLocation.state;

    let nextDistrict =
      familyLocation.district;

    let nextCity =
      familyLocation.city;

    if (
      field === "state"
    ) {
      nextState = value;
      nextDistrict = "";
      nextCity = "";

      clearError(
        "familyState"
      );

      clearError(
        "familyDistrict"
      );

      clearError(
        "familyCity"
      );
    }

    if (
      field === "district"
    ) {
      nextDistrict = value;
      nextCity = "";

      clearError(
        "familyDistrict"
      );

      clearError(
        "familyCity"
      );
    }

    if (
      field === "city"
    ) {
      nextCity = value;

      clearError(
        "familyCity"
      );
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
      {/* Compact Step Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50/70 via-white to-amber-50/55 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-rose-700 text-white shadow-sm">
            <UsersRound
              size={17}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Step 4 of 7
            </p>

            <h2 className="mt-0.5 text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
              Family Details
            </h2>

            <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Share a few details about your family background and home location.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-[11px] leading-5 text-blue-800">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 font-black text-blue-700">
            *
          </span>

          <p>
            Fields marked with a red{" "}
            <span className="font-black text-red-500">
              *
            </span>{" "}
            are required before continuing.
          </p>
        </div>

        <SectionHeading
          icon={
            <UsersRound
              size={15}
            />
          }
          title="Family Background"
          description="Basic information about your immediate family."
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
          <FormField
            label="Father's Name"
            required
            htmlFor="father-name"
            error={
              errors.fatherName
            }
          >
            <IconField
              icon={
                <UserRound
                  size={16}
                />
              }
            >
              <Input
                id="father-name"
                value={
                  familyInfo.fatherName
                }
                error={
                  errors.fatherName
                }
                placeholder="Enter father's name"
                className="pl-10"
                onChange={(event) =>
                  updateFamilyInfo(
                    "fatherName",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Mother's Name"
            required
            htmlFor="mother-name"
            error={
              errors.motherName
            }
          >
            <IconField
              icon={
                <HeartHandshake
                  size={16}
                />
              }
            >
              <Input
                id="mother-name"
                value={
                  familyInfo.motherName
                }
                error={
                  errors.motherName
                }
                placeholder="Enter mother's name"
                className="pl-10"
                onChange={(event) =>
                  updateFamilyInfo(
                    "motherName",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Number of Siblings"
            htmlFor="siblings"
            error={
              errors.siblings
            }
            helperText="Optional. Enter 0 if you have no siblings."
            className="md:col-span-2"
          >
            <div className="md:max-w-[calc(50%-0.5rem)]">
              <IconField
                icon={
                  <Baby
                    size={16}
                  />
                }
              >
                <Input
                  id="siblings"
                  type="number"
                  min="0"
                  max="20"
                  inputMode="numeric"
                  value={
                    familyInfo.siblings
                  }
                  error={
                    errors.siblings
                  }
                  placeholder="For example: 2"
                  className="pl-10"
                  onChange={(event) =>
                    updateFamilyInfo(
                      "siblings",
                      event.target.value
                    )
                  }
                />
              </IconField>
            </div>
          </FormField>
        </div>

        <SectionDivider />

        <SectionHeading
          icon={
            <MapPin
              size={15}
            />
          }
          title="Family Location"
          description="Select your family location in State → District → City order."
          variant="green"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
          <FormField
            label="Family State"
            required
            htmlFor="family-state"
            error={
              errors.familyState
            }
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
                    key={
                      state.isoCode
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
          </FormField>

          <FormField
            label="Family City"
            required
            htmlFor="family-city"
            error={
              errors.familyCity
            }
            className="md:col-span-2"
          >
            <div className="md:max-w-[calc(50%-0.5rem)]">
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

                {cities.map(
                  (city) => (
                    <option
                      key={
                        city.value
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
          </FormField>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            className="sm:w-auto"
            onClick={
              onBack
            }
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            className="sm:min-w-[150px] sm:w-auto"
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
  | "rose"
  | "green";

function SectionHeading({
  icon,
  title,
  description,
  variant = "rose",
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
    rose:
      "bg-rose-50 text-rose-700",

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
