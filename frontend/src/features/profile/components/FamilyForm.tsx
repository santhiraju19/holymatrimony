"use client";

import {
  useState,
} from "react";

import {
  HeartHandshake,
  Home,
  MapPin,
  Users,
  UsersRound,
} from "lucide-react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";

import {
  useProfile,
} from "@/features/profile/context/useProfile";

import {
  FAMILY_TYPE_OPTIONS,
  FAMILY_VALUES_OPTIONS,
} from "@/features/profile/data/profileOptions";

import {
  getDistrictsForState,
  isIndia,
} from "@/features/profile/data/indiaLocations";

import {
  COUNTRIES,
  getCitiesForCountryState,
  getStatesForCountry,
} from "@/features/profile/data/worldLocations";

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

type FamilyLocationField =
  | "familyCountry"
  | "familyState"
  | "familyDistrict"
  | "familyCity";

export default function FamilyForm({
  onNext,
  onBack,
}: FamilyFormProps) {
  const {
    familyInfo,
    setProfile,
  } = useProfile();

  const [
    errors,
    setErrors,
  ] =
    useState<FamilyFormErrors>(
      {}
    );

  /*
   * =========================================================
   * Structured Family Location
   * =========================================================
   */

  const states =
    familyInfo.familyCountry
      ? getStatesForCountry(
          familyInfo.familyCountry
        )
      : [];

  const cities =
    familyInfo.familyCountry &&
    familyInfo.familyState
      ? getCitiesForCountryState(
          familyInfo.familyCountry,
          familyInfo.familyState
        )
      : [];

  const indianLocation =
    isIndia(
      familyInfo.familyCountry
    );

  const districts =
    indianLocation &&
    familyInfo.familyState
      ? getDistrictsForState(
          familyInfo.familyState
        )
      : [];

  /*
   * Show a district dropdown only when our India
   * district dataset contains options for the
   * selected state.
   *
   * For Indian states not yet present in the
   * local district dataset, keep the text fallback
   * so the member is never blocked.
   */
  const hasDistrictOptions =
    indianLocation &&
    districts.length > 0;

  const selectedCountryExists =
    COUNTRIES.some(
      (country) =>
        country.value ===
        familyInfo.familyCountry
    );

  const selectedStateExists =
    states.some(
      (state) =>
        state.value ===
        familyInfo.familyState
    );

  const selectedDistrictExists =
    districts.some(
      (district) =>
        district.value ===
        familyInfo.familyDistrict
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        familyInfo.familyCity
    );

  /*
   * =========================================================
   * Error Helpers
   * =========================================================
   */

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

  /*
   * =========================================================
   * Family Information
   * =========================================================
   */

  function updateFamilyInfo(
    field: keyof FamilyInfo,
    value: string
  ): void {
    setProfile((previous) => ({
      ...previous,

      familyInfo: {
        ...previous.familyInfo,
        [field]: value,
      },
    }));

    clearError(
      field as keyof FamilyFormErrors
    );
  }

  /*
   * =========================================================
   * Compatibility Location Summary
   * =========================================================
   */

  function buildFamilyLocationSummary(
    country: string,
    state: string,
    district: string,
    city: string
  ): string {
    return [
      city,
      district,
      state,
      country,
    ]
      .map(
        (value) =>
          value.trim()
      )
      .filter(Boolean)
      .join(", ");
  }

  /*
   * =========================================================
   * Structured Location Update
   * =========================================================
   */

  function updateFamilyLocation(
    field: FamilyLocationField,
    value: string
  ): void {
    setProfile((previous) => {
      let familyCountry =
        previous.familyInfo
          .familyCountry;

      let familyState =
        previous.familyInfo
          .familyState;

      let familyDistrict =
        previous.familyInfo
          .familyDistrict;

      let familyCity =
        previous.familyInfo
          .familyCity;

      if (
        field ===
        "familyCountry"
      ) {
        familyCountry = value;
        familyState = "";
        familyDistrict = "";
        familyCity = "";
      }

      if (
        field ===
        "familyState"
      ) {
        familyState = value;
        familyDistrict = "";
        familyCity = "";
      }

      if (
        field ===
        "familyDistrict"
      ) {
        familyDistrict = value;
      }

      if (
        field ===
        "familyCity"
      ) {
        familyCity = value;
      }

      const familyLocation =
        buildFamilyLocationSummary(
          familyCountry,
          familyState,
          familyDistrict,
          familyCity
        );

      return {
        ...previous,

        familyInfo: {
          ...previous.familyInfo,

          familyCountry,
          familyState,
          familyDistrict,
          familyCity,

          /*
           * Compatibility summary.
           *
           * Structured fields are the source of truth.
           * familyLocation remains populated because
           * the existing completion model counts Family
           * Location as one field and older profile/review
           * code may still read it.
           */
          familyLocation,
        },
      };
    });

    clearError(
      field as keyof FamilyFormErrors
    );

    if (
      field ===
      "familyCountry"
    ) {
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
      field ===
      "familyState"
    ) {
      clearError(
        "familyDistrict"
      );

      clearError(
        "familyCity"
      );
    }

    if (
      field ===
      "familyDistrict"
    ) {
      clearError(
        "familyDistrict"
      );
    }

    if (
      field ===
      "familyCity"
    ) {
      clearError(
        "familyCity"
      );
    }
  }

  /*
   * =========================================================
   * Continue
   * =========================================================
   */

  function handleContinue(): void {
    const validationErrors =
      validateFamilyInfo(
        familyInfo,
        {
          state:
            familyInfo.familyState,

          district:
            familyInfo.familyDistrict,

          city:
            familyInfo.familyCity,
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

      <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50/75 via-white to-amber-50/55 px-4 py-3.5 sm:px-5">

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
              Family Information
            </h2>

            <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Share your family background, family structure and location.
            </p>

          </div>

        </div>

      </div>

      <div className="p-4 sm:p-5">

        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2.5 text-[11px] leading-5 text-rose-800">

          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-rose-100 font-black text-rose-700">
            *
          </span>

          <p>
            Parent names, family type and family location are required.
            District, siblings and family values are optional.
          </p>

        </div>

        {/* =====================================================
            Family Details
            ===================================================== */}

        <SectionHeading
          icon={
            <UsersRound
              size={15}
            />
          }
          title="Family Details"
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
            <Input
              id="father-name"
              value={
                familyInfo.fatherName
              }
              error={
                errors.fatherName
              }
              maxLength={120}
              placeholder="Enter father's name"
              onChange={(event) =>
                updateFamilyInfo(
                  "fatherName",
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Mother's Name"
            required
            htmlFor="mother-name"
            error={
              errors.motherName
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
              maxLength={120}
              placeholder="Enter mother's name"
              onChange={(event) =>
                updateFamilyInfo(
                  "motherName",
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Number of Siblings"
            htmlFor="siblings"
            error={
              errors.siblings
            }
            helperText="Optional — enter 0 if none."
          >
            <IconField
              icon={
                <Users
                  size={16}
                />
              }
            >
              <Input
                id="siblings"
                type="number"
                min={0}
                max={20}
                inputMode="numeric"
                value={
                  familyInfo.siblings
                }
                error={
                  errors.siblings
                }
                placeholder="Example: 2"
                className="pl-10"
                onChange={(event) =>
                  updateFamilyInfo(
                    "siblings",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Family Type"
            required
            htmlFor="family-type"
            error={
              errors.familyType
            }
          >
            <IconField
              icon={
                <Home
                  size={16}
                />
              }
            >
              <Select
                id="family-type"
                value={
                  familyInfo.familyType
                }
                error={
                  errors.familyType
                }
                className="pl-10"
                onChange={(event) =>
                  updateFamilyInfo(
                    "familyType",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select family type
                </option>

                {FAMILY_TYPE_OPTIONS.map(
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
            </IconField>
          </FormField>

          <FormField
            label="Family Values"
            htmlFor="family-values"
            error={
              errors.familyValues
            }
            helperText="Optional"
            className="md:col-span-2"
          >
            <div className="md:max-w-[calc(50%-0.5rem)]">

              <IconField
                icon={
                  <HeartHandshake
                    size={16}
                  />
                }
              >
                <Select
                  id="family-values"
                  value={
                    familyInfo.familyValues
                  }
                  error={
                    errors.familyValues
                  }
                  className="pl-10"
                  onChange={(event) =>
                    updateFamilyInfo(
                      "familyValues",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select family values
                  </option>

                  {FAMILY_VALUES_OPTIONS.map(
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
              </IconField>

            </div>
          </FormField>

        </div>

        {/* =====================================================
            Family Location
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <MapPin
              size={15}
            />
          }
          title="Family Location"
          description="Where your family is primarily based."
          variant="green"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2 lg:grid-cols-4">

          {/* Country */}

          <FormField
            label="Family Country"
            required
            htmlFor="family-country"
          >
            <Select
              id="family-country"
              value={
                familyInfo.familyCountry
              }
              onChange={(event) =>
                updateFamilyLocation(
                  "familyCountry",
                  event.target.value
                )
              }
            >
              <option value="">
                Select country
              </option>

              {familyInfo.familyCountry &&
                !selectedCountryExists && (
                  <option
                    value={
                      familyInfo.familyCountry
                    }
                  >
                    {
                      familyInfo.familyCountry
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
          </FormField>

          {/* State */}

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
                familyInfo.familyState
              }
              error={
                errors.familyState
              }
              disabled={
                !familyInfo.familyCountry
              }
              onChange={(event) =>
                updateFamilyLocation(
                  "familyState",
                  event.target.value
                )
              }
            >
              <option value="">
                {familyInfo.familyCountry
                  ? "Select state"
                  : "Select country first"}
              </option>

              {familyInfo.familyState &&
                !selectedStateExists && (
                  <option
                    value={
                      familyInfo.familyState
                    }
                  >
                    {
                      familyInfo.familyState
                    }
                  </option>
                )}

              {states.map(
                (state) => (
                  <option
                    key={`${familyInfo.familyCountry}-${state.isoCode}`}
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

          {/* District */}

          <FormField
            label="Family District"
            htmlFor="family-district"
            helperText={
              hasDistrictOptions
                ? undefined
                : "Optional"
            }
            error={
              errors.familyDistrict
            }
          >
            {hasDistrictOptions ? (
              <Select
                id="family-district"
                value={
                  familyInfo.familyDistrict
                }
                error={
                  errors.familyDistrict
                }
                disabled={
                  !familyInfo.familyState
                }
                onChange={(event) =>
                  updateFamilyLocation(
                    "familyDistrict",
                    event.target.value
                  )
                }
              >
                <option value="">
                  {familyInfo.familyState
                    ? "Select district"
                    : "Select state first"}
                </option>

                {familyInfo.familyDistrict &&
                  !selectedDistrictExists && (
                    <option
                      value={
                        familyInfo.familyDistrict
                      }
                    >
                      {
                        familyInfo.familyDistrict
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
                id="family-district"
                value={
                  familyInfo.familyDistrict
                }
                error={
                  errors.familyDistrict
                }
                disabled={
                  !familyInfo.familyState
                }
                maxLength={120}
                placeholder={
                  familyInfo.familyState
                    ? indianLocation
                      ? "Enter district"
                      : "Enter district (optional)"
                    : "Select state first"
                }
                onChange={(event) =>
                  updateFamilyLocation(
                    "familyDistrict",
                    event.target.value
                  )
                }
              />
            )}
          </FormField>

          {/* City */}

          <FormField
            label="Family City"
            required
            htmlFor="family-city"
            error={
              errors.familyCity
            }
          >
            <Select
              id="family-city"
              value={
                familyInfo.familyCity
              }
              error={
                errors.familyCity
              }
              disabled={
                !familyInfo.familyState
              }
              onChange={(event) =>
                updateFamilyLocation(
                  "familyCity",
                  event.target.value
                )
              }
            >
              <option value="">
                {familyInfo.familyState
                  ? "Select city"
                  : "Select state first"}
              </option>

              {familyInfo.familyCity &&
                !selectedCityExists && (
                  <option
                    value={
                      familyInfo.familyCity
                    }
                  >
                    {
                      familyInfo.familyCity
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
