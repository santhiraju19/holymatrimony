"use client";

import { useState } from "react";

import {
  CalendarDays,
  Heart,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  User,
  Users,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";

import {
  getCitiesForState,
  INDIA_STATES,
} from "@/features/profile/data/indiaLocations";

import type {
  AboutInfo,
  BasicInfo,
  LocationInfo,
} from "@/features/profile/types";

import {
  BasicFormErrors,
  focusFirstInvalidField,
  hasValidationErrors,
  validateBasicInfo,
} from "@/features/profile/validation/profileValidation";

interface BasicInfoFormProps {
  onNext: () => void;
}

function calculateAge(
  dateOfBirth: string
): string {
  if (!dateOfBirth) {
    return "";
  }

  const parts =
    dateOfBirth.split("-");

  if (parts.length !== 3) {
    return "";
  }

  const birthYear =
    Number(parts[0]);

  const birthMonth =
    Number(parts[1]);

  const birthDay =
    Number(parts[2]);

  if (
    !Number.isInteger(
      birthYear
    ) ||
    !Number.isInteger(
      birthMonth
    ) ||
    !Number.isInteger(
      birthDay
    )
  ) {
    return "";
  }

  const birthDate =
    new Date(
      birthYear,
      birthMonth - 1,
      birthDay
    );

  const validDate =
    birthDate.getFullYear() ===
      birthYear &&
    birthDate.getMonth() ===
      birthMonth - 1 &&
    birthDate.getDate() ===
      birthDay;

  if (!validDate) {
    return "";
  }

  const today = new Date();

  if (birthDate > today) {
    return "";
  }

  let age =
    today.getFullYear() -
    birthYear;

  const monthDifference =
    today.getMonth() -
    (birthMonth - 1);

  const birthdayNotReached =
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDay
    );

  if (birthdayNotReached) {
    age -= 1;
  }

  return age >= 0
    ? age.toString()
    : "";
}

function getMaximumDateOfBirth(): string {
  const today = new Date();

  const maximumDate =
    new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

  const year =
    maximumDate.getFullYear();

  const month =
    String(
      maximumDate.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      maximumDate.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

export default function BasicInfoForm({
  onNext,
}: BasicInfoFormProps) {
  const {
    basicInfo,
    locationInfo,
    aboutInfo,
    setProfile,
  } = useProfile();

  const [
    errors,
    setErrors,
  ] =
    useState<BasicFormErrors>(
      {}
    );

  const maximumDateOfBirth =
    getMaximumDateOfBirth();

  /*
   * Current-location cities.
   *
   * Current profile location is separate
   * from the member's Family Location.
   */
  const cities =
    getCitiesForState(
      locationInfo.state
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        locationInfo.city
    );

  function clearError(
    field: keyof BasicFormErrors
  ): void {
    setErrors(
      (current) => {
        if (!current[field]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[field];

        return next;
      }
    );
  }

  /*
   * =========================================================
   * Basic information
   * =========================================================
   */

  function updateBasicInfo(
    field: keyof BasicInfo,
    value: string
  ): void {
    setProfile(
      (previous) => {
        const updatedBasicInfo = {
          ...previous.basicInfo,
          [field]: value,
        };

        if (
          field ===
          "dateOfBirth"
        ) {
          updatedBasicInfo.age =
            calculateAge(
              value
            );
        }

        return {
          ...previous,

          basicInfo:
            updatedBasicInfo,
        };
      }
    );

    clearError(field);

    if (
      field ===
      "dateOfBirth"
    ) {
      clearError("age");
    }
  }

  /*
   * =========================================================
   * Current location
   * =========================================================
   */

  function updateLocation(
    field: keyof LocationInfo,
    value: string
  ): void {
    setProfile(
      (previous) => {
        let nextLocation = {
          ...previous.locationInfo,
          [field]: value,
        };

        /*
         * Changing country resets state/city.
         */
        if (
          field === "country"
        ) {
          nextLocation = {
            country: value,
            state: "",
            city: "",
          };
        }

        /*
         * Changing state resets city.
         */
        if (
          field === "state"
        ) {
          nextLocation = {
            ...previous.locationInfo,
            state: value,
            city: "",
          };
        }

        return {
          ...previous,
          locationInfo:
            nextLocation,
        };
      }
    );

    clearError(field);

    if (
      field === "country"
    ) {
      clearError("state");
      clearError("city");
    }

    if (
      field === "state"
    ) {
      clearError("city");
    }
  }

  /*
   * =========================================================
   * About Me
   * =========================================================
   */

  function updateAboutInfo(
    field: keyof AboutInfo,
    value: string
  ): void {
    setProfile(
      (previous) => ({
        ...previous,

        aboutInfo: {
          ...previous.aboutInfo,
          [field]: value,
        },
      })
    );

    clearError(
      "aboutMe"
    );
  }

  /*
   * =========================================================
   * Continue
   * =========================================================
   */

  function handleContinue(): void {
    const validationErrors =
      validateBasicInfo(
        basicInfo,
        locationInfo,
        aboutInfo
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
      {/* Header */}

      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-lg sm:h-14 sm:w-14">
            <User
              size={25}
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
              Step 1 of 7
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2D5C] sm:text-3xl">
              Basic Information
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Introduce yourself,
              share your current
              location and tell
              potential matches a
              little about yourself.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-7 lg:p-10">
        <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800">
          All profile information
          marked with a red{" "}
          <span className="font-bold text-red-500">
            *
          </span>{" "}
          is required to reach
          100% profile completion
          and become eligible for
          profile verification.
        </div>

        {/* =====================================================
            Personal details
            ===================================================== */}

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <User size={19} />
          </div>

          <div>
            <h3 className="font-bold text-[#0B2D5C]">
              Personal Details
            </h3>

            <p className="text-sm text-slate-500">
              Your personal and
              contact information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          <FormField
            label="Full Name"
            required
            htmlFor="profile-full-name"
            error={
              errors.fullName
            }
          >
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="profile-full-name"
                autoComplete="name"
                value={
                  basicInfo.fullName
                }
                error={
                  errors.fullName
                }
                placeholder="Enter your full name"
                className="pl-11"
                onChange={(event) =>
                  updateBasicInfo(
                    "fullName",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Email Address"
            required
            htmlFor="profile-email"
            error={
              errors.email
            }
          >
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={
                  basicInfo.email
                }
                error={
                  errors.email
                }
                placeholder="name@example.com"
                className="pl-11"
                onChange={(event) =>
                  updateBasicInfo(
                    "email",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Mobile Number"
            required
            htmlFor="profile-mobile"
            error={
              errors.mobile
            }
            helperText="Include your country code, for example +91."
          >
            <div className="relative">
              <Phone
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="profile-mobile"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={
                  basicInfo.mobile
                }
                error={
                  errors.mobile
                }
                placeholder="+91 98765 43210"
                className="pl-11"
                onChange={(event) =>
                  updateBasicInfo(
                    "mobile",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Date of Birth"
            required
            htmlFor="profile-date-of-birth"
            error={
              errors.dateOfBirth
            }
            helperText="You must be at least 18 years old."
          >
            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="profile-date-of-birth"
                type="date"
                max={
                  maximumDateOfBirth
                }
                value={
                  basicInfo.dateOfBirth
                }
                error={
                  errors.dateOfBirth
                }
                className="pl-11"
                onChange={(event) =>
                  updateBasicInfo(
                    "dateOfBirth",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Age"
            htmlFor="profile-age"
            error={
              errors.age
            }
            helperText="Calculated automatically from your date of birth."
          >
            <Input
              id="profile-age"
              value={
                basicInfo.age
              }
              error={
                errors.age
              }
              placeholder="Calculated automatically"
              readOnly
              aria-readonly="true"
              className="cursor-not-allowed bg-slate-100 font-semibold text-slate-700"
            />
          </FormField>

          <FormField
            label="Gender"
            required
            htmlFor="profile-gender"
            error={
              errors.gender
            }
          >
            <Select
              id="profile-gender"
              value={
                basicInfo.gender
              }
              error={
                errors.gender
              }
              onChange={(event) =>
                updateBasicInfo(
                  "gender",
                  event.target.value
                )
              }
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>
            </Select>
          </FormField>

          <FormField
            label="Marital Status"
            required
            htmlFor="profile-marital-status"
            error={
              errors.maritalStatus
            }
            className="md:col-span-2"
          >
            <div className="relative md:max-w-[calc(50%-0.75rem)]">
              <Heart
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Select
                id="profile-marital-status"
                value={
                  basicInfo.maritalStatus
                }
                error={
                  errors.maritalStatus
                }
                className="pl-11"
                onChange={(event) =>
                  updateBasicInfo(
                    "maritalStatus",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select marital
                  status
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
              </Select>
            </div>
          </FormField>
        </div>

        {/* =====================================================
            Current Location
            ===================================================== */}

        <div className="my-8 border-t border-slate-200" />

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <MapPin size={19} />
          </div>

          <div>
            <h3 className="font-bold text-[#0B2D5C]">
              Current Location
            </h3>

            <p className="text-sm text-slate-500">
              Tell matches where
              you currently live.
              This is separate from
              your family location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3">
          <FormField
            label="Country"
            required
            htmlFor="profile-country"
            error={
              errors.country
            }
          >
            <Select
              id="profile-country"
              value={
                locationInfo.country
              }
              error={
                errors.country
              }
              onChange={(event) =>
                updateLocation(
                  "country",
                  event.target.value
                )
              }
            >
              <option value="">
                Select country
              </option>

              <option value="India">
                India
              </option>
            </Select>
          </FormField>

          <FormField
            label="State"
            required
            htmlFor="profile-state"
            error={
              errors.state
            }
          >
            <Select
              id="profile-state"
              value={
                locationInfo.state
              }
              error={
                errors.state
              }
              disabled={
                locationInfo.country !==
                "India"
              }
              onChange={(event) =>
                updateLocation(
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
            label="City"
            required
            htmlFor="profile-city"
            error={
              errors.city
            }
          >
            <Select
              id="profile-city"
              value={
                locationInfo.city
              }
              error={
                errors.city
              }
              disabled={
                !locationInfo.state
              }
              onChange={(event) =>
                updateLocation(
                  "city",
                  event.target.value
                )
              }
            >
              <option value="">
                Select city
              </option>

              {locationInfo.city &&
                !selectedCityExists && (
                  <option
                    value={
                      locationInfo.city
                    }
                  >
                    {
                      locationInfo.city
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
            About Me
            ===================================================== */}

        <div className="my-8 border-t border-slate-200" />

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#B38B19]">
            <MessageSquareText
              size={19}
            />
          </div>

          <div>
            <h3 className="font-bold text-[#0B2D5C]">
              About Me
            </h3>

            <p className="text-sm text-slate-500">
              Share a genuine
              introduction about
              your faith, values,
              personality and life.
            </p>
          </div>
        </div>

        <FormField
          label="Tell Us About Yourself"
          required
          htmlFor="profile-about-me"
          error={
            errors.aboutMe
          }
          helperText={`${aboutInfo.aboutMe.trim().length}/2000 characters`}
        >
          <textarea
            id="profile-about-me"
            value={
              aboutInfo.aboutMe
            }
            maxLength={2000}
            rows={7}
            placeholder="For example: I am a family-oriented Christian who values faith, honesty and meaningful relationships. I enjoy spending time with family, serving at church..."
            className={[
              "w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition",
              "placeholder:text-slate-400",
              "focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100",
              errors.aboutMe
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300",
            ].join(" ")}
            onChange={(event) =>
              updateAboutInfo(
                "aboutMe",
                event.target.value
              )
            }
          />
        </FormField>

        {/* Navigation */}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled
            fullWidth
            className="sm:w-auto"
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            fullWidth
            rightIcon={
              <Users
                size={18}
              />
            }
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