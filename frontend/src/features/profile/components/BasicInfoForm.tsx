"use client";

import {
  getDistrictsForState,
  isIndia,
} from "../data/indiaLocations";

import {
  useState,
} from "react";

import {
  Accessibility,
  CalendarDays,
  Church,
  Cigarette,
  Heart,
  Languages,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Ruler,
  Scale,
  Sparkles,
  User,
  Users,
  UsersRound,
  Utensils,
  Wine,
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
  BODY_TYPE_OPTIONS,
  COMPLEXION_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  FAITH_BACKGROUND_OPTIONS,
  HEIGHT_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  SMOKING_OPTIONS,
} from "@/features/profile/data/profileOptions";

import {
  COUNTRIES,
  getCitiesForCountryState,
  getStatesForCountry,
} from "@/features/profile/data/worldLocations";

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

  const today =
    new Date();

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
  const today =
    new Date();

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

  const states =
    locationInfo.country
      ? getStatesForCountry(
          locationInfo.country
        )
      : [];

  const cities =
    locationInfo.country &&
    locationInfo.state
      ? getCitiesForCountryState(
          locationInfo.country,
          locationInfo.state
        )
      : [];

  const indianLocation =
    isIndia(
      locationInfo.country
    );

  const districts =
    indianLocation &&
    locationInfo.state
      ? getDistrictsForState(
          locationInfo.state
        )
      : [];

  const selectedDistrictExists =
    districts.some(
      (district) =>
        district.value ===
        locationInfo.district
    );

  const selectedCountryExists =
    COUNTRIES.some(
      (country) =>
        country.value ===
        locationInfo.country
    );

  const selectedStateExists =
    states.some(
      (state) =>
        state.value ===
        locationInfo.state
    );

  const selectedCityExists =
    cities.some(
      (city) =>
        city.value ===
        locationInfo.city
    );

  function clearError(
    field: keyof BasicInfo | keyof LocationInfo | keyof AboutInfo
  ) {
    setErrors((prev) => {
      const next = { ...prev };

      const errorField = field as keyof typeof next;
      delete next[errorField];

      return next;
    });
  }

  function updateBasicInfo(
    field: keyof BasicInfo,
    value: string
  ): void {
    setProfile((previous) => {
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
    });

    clearError(field);

    if (
      field ===
      "dateOfBirth"
    ) {
      clearError("age");
    }
  }

  function updateLocation(
    field: keyof LocationInfo,
    value: string
  ): void {
    setProfile((previous) => {
      let nextLocation: LocationInfo = {
        ...previous.locationInfo,
        [field]: value,
      };

      if (field === "country") {
        nextLocation = {
          country: value,
          state: "",
          district: "",
          city: "",
        };
      }

      if (field === "state") {
        nextLocation = {
          ...previous.locationInfo,
          state: value,
          district: "",
          city: "",
        };
      }

      if (field === "district") {
        nextLocation = {
          ...previous.locationInfo,
          district: value,
          city: "",
        };
      }

      return {
        ...previous,
        locationInfo: nextLocation,
      };
    });

    clearError(field);

    if (field === "country") {
      clearError("state");
      clearError("district");
      clearError("city");
    }

    if (field === "state") {
      clearError("district");
      clearError("city");
    }

    if (field === "district") {
      clearError("city");
    }
  }

  function updateAboutInfo(
    field: keyof AboutInfo,
    value: string
  ): void {
    setProfile((previous) => ({
      ...previous,

      aboutInfo: {
        ...previous.aboutInfo,
        [field]: value,
      },
    }));

    clearError(
      "aboutMe"
    );
  }

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

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/55 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-sm">
            <User
              size={17}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Step 1 of 7
            </p>

            <h2 className="mt-0.5 text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
              Personal Information
            </h2>

            <p className="mt-0.5 max-w-3xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Tell us about yourself, your faith and community background, lifestyle and current location.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">

        {/* Required reminder */}

        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-[11px] leading-5 text-blue-800">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 font-black text-blue-700">
            *
          </span>

          <p>
            Fields marked with a red{" "}
            <span className="font-black text-red-500">
              *
            </span>{" "}
            are required for profile completion. Community, appearance and lifestyle information is optional.
          </p>
        </div>

        {/* =====================================================
            Personal Details
            ===================================================== */}

        <SectionHeading
          icon={
            <User size={15} />
          }
          title="Personal Details"
          description="Your identity and basic matrimonial information."
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
          <FormField
            label="Full Name"
            required
            htmlFor="profile-full-name"
            error={
              errors.fullName
            }
          >
            <IconField
              icon={
                <User
                  size={16}
                />
              }
            >
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
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "fullName",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Email Address"
            required
            htmlFor="profile-email"
            error={
              errors.email
            }
          >
            <IconField
              icon={
                <Mail
                  size={16}
                />
              }
            >
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
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "email",
                    event.target.value
                  )
                }
              />
            </IconField>
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
            <IconField
              icon={
                <Phone
                  size={16}
                />
              }
            >
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
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "mobile",
                    event.target.value
                  )
                }
              />
            </IconField>
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
            <IconField
              icon={
                <CalendarDays
                  size={16}
                />
              }
            >
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
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "dateOfBirth",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Age"
            htmlFor="profile-age"
            error={
              errors.age
            }
            helperText="Calculated automatically from date of birth."
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
              className="cursor-not-allowed bg-slate-50 font-semibold text-slate-700"
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
          >
            <IconField
              icon={
                <Heart
                  size={16}
                />
              }
            >
              <Select
                id="profile-marital-status"
                value={
                  basicInfo.maritalStatus
                }
                error={
                  errors.maritalStatus
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "maritalStatus",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select marital status
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
            </IconField>
          </FormField>
        </div>

        {/* =====================================================
            Physical Details
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <Ruler size={15} />
          }
          title="Physical Details"
          description="Basic physical information commonly used in matrimonial profiles."
          variant="purple"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2 lg:grid-cols-3">

          <FormField
            label="Height"
            required
            htmlFor="profile-height"
            error={
              errors.heightCm
            }
          >
            <IconField
              icon={
                <Ruler
                  size={16}
                />
              }
            >
              <Select
                id="profile-height"
                value={
                  basicInfo.heightCm
                }
                error={
                  errors.heightCm
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "heightCm",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select height
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
                      {height.label}
                    </option>
                  )
                )}
              </Select>
            </IconField>
          </FormField>

          <FormField
            label="Weight"
            htmlFor="profile-weight"
            error={
              errors.weightKg
            }
            helperText="Optional"
          >
            <IconField
              icon={
                <Scale
                  size={16}
                />
              }
            >
              <Input
                id="profile-weight"
                type="number"
                inputMode="numeric"
                min={25}
                max={300}
                value={
                  basicInfo.weightKg
                }
                error={
                  errors.weightKg
                }
                placeholder="Weight in kg"
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "weightKg",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Complexion / Skin Tone"
            htmlFor="profile-complexion"
            error={
              errors.complexion
            }
            helperText="Optional"
          >
            <Select
              id="profile-complexion"
              value={
                basicInfo.complexion
              }
              error={
                errors.complexion
              }
              onChange={(event) =>
                updateBasicInfo(
                  "complexion",
                  event.target.value
                )
              }
            >
              <option value="">
                Select complexion
              </option>

              {COMPLEXION_OPTIONS.map(
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
          </FormField>

          <FormField
            label="Body Type"
            htmlFor="profile-body-type"
            error={
              errors.bodyType
            }
            helperText="Optional"
          >
            <Select
              id="profile-body-type"
              value={
                basicInfo.bodyType
              }
              error={
                errors.bodyType
              }
              onChange={(event) =>
                updateBasicInfo(
                  "bodyType",
                  event.target.value
                )
              }
            >
              <option value="">
                Select body type
              </option>

              {BODY_TYPE_OPTIONS.map(
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
          </FormField>

          <FormField
            label="Physical Status"
            htmlFor="profile-physical-status"
            error={
              errors.physicalStatus
            }
            helperText="Optional"
          >
            <IconField
              icon={
                <Accessibility
                  size={16}
                />
              }
            >
              <Select
                id="profile-physical-status"
                value={
                  basicInfo.physicalStatus
                }
                error={
                  errors.physicalStatus
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "physicalStatus",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select physical status
                </option>

                {PHYSICAL_STATUS_OPTIONS.map(
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
            label="Mother Tongue"
            required
            htmlFor="profile-mother-tongue"
            error={
              errors.motherTongue
            }
          >
            <IconField
              icon={
                <Languages
                  size={16}
                />
              }
            >
              <Select
                id="profile-mother-tongue"
                value={
                  basicInfo.motherTongue
                }
                error={
                  errors.motherTongue
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "motherTongue",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select mother tongue
                </option>

                {MOTHER_TONGUE_OPTIONS.map(
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
        </div>

        {/* =====================================================
            Faith & Community
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <Church size={15} />
          }
          title="Faith & Community"
          description="Religion and community are stored separately so members can accurately represent both their current faith and family/community background."
          variant="gold"
        />

        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-3 text-[11px] leading-5 text-amber-900">
          <span className="font-black">
            Example:
          </span>{" "}
          Religion: Christianity · Community: Reddy · Faith Background: Converted to Christianity.
          Community information is optional.
        </div>

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">

          <FormField
            label="Religion"
            required
            htmlFor="profile-religion"
            error={
              errors.religion
            }
          >
            <IconField
              icon={
                <Church
                  size={16}
                />
              }
            >
              <Select
                id="profile-religion"
                value={
                  basicInfo.religion
                }
                error={
                  errors.religion
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "religion",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select religion
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
            </IconField>
          </FormField>

          <FormField
            label="Community / Caste"
            htmlFor="profile-community"
            error={
              errors.community
            }
            helperText="Optional — for example Reddy, Kamma, Kapu."
          >
            <IconField
              icon={
                <UsersRound
                  size={16}
                />
              }
            >
              <Input
                id="profile-community"
                value={
                  basicInfo.community
                }
                error={
                  errors.community
                }
                maxLength={120}
                placeholder="Enter community / caste"
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "community",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Sub-community / Sub-caste"
            htmlFor="profile-sub-community"
            error={
              errors.subCommunity
            }
            helperText="Optional"
          >
            <Input
              id="profile-sub-community"
              value={
                basicInfo.subCommunity
              }
              error={
                errors.subCommunity
              }
              maxLength={120}
              placeholder="Enter sub-community if applicable"
              onChange={(event) =>
                updateBasicInfo(
                  "subCommunity",
                  event.target.value
                )
              }
            />
          </FormField>

          <FormField
            label="Faith Background"
            htmlFor="profile-faith-background"
            error={
              errors.faithBackground
            }
            helperText="Optional"
          >
            <IconField
              icon={
                <Sparkles
                  size={16}
                />
              }
            >
              <Select
                id="profile-faith-background"
                value={
                  basicInfo.faithBackground
                }
                error={
                  errors.faithBackground
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "faithBackground",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select faith background
                </option>

                {FAITH_BACKGROUND_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </Select>
            </IconField>
          </FormField>
        </div>

        {/* =====================================================
            Lifestyle
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <Utensils size={15} />
          }
          title="Lifestyle"
          description="Optional lifestyle information that may help members understand compatibility."
          variant="green"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-3">

          <FormField
            label="Diet"
            htmlFor="profile-diet"
            helperText="Optional"
          >
            <IconField
              icon={
                <Utensils
                  size={16}
                />
              }
            >
              <Select
                id="profile-diet"
                value={
                  basicInfo.diet
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "diet",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select diet
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
            </IconField>
          </FormField>

          <FormField
            label="Smoking"
            htmlFor="profile-smoking"
            helperText="Optional"
          >
            <IconField
              icon={
                <Cigarette
                  size={16}
                />
              }
            >
              <Select
                id="profile-smoking"
                value={
                  basicInfo.smoking
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "smoking",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select smoking preference
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
            </IconField>
          </FormField>

          <FormField
            label="Drinking"
            htmlFor="profile-drinking"
            helperText="Optional"
          >
            <IconField
              icon={
                <Wine
                  size={16}
                />
              }
            >
              <Select
                id="profile-drinking"
                value={
                  basicInfo.drinking
                }
                className="pl-10"
                onChange={(event) =>
                  updateBasicInfo(
                    "drinking",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select drinking preference
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
            </IconField>
          </FormField>
        </div>

        {/* =====================================================
            Current Location
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <MapPin
              size={15}
            />
          }
          title="Current Location"
          description="Where you currently live. Select your district for Indian locations. District does not add another profile-completion requirement."
          variant="green"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2 lg:grid-cols-4">

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

              {locationInfo.country &&
                !selectedCountryExists && (
                  <option
                    value={
                      locationInfo.country
                    }
                  >
                    {
                      locationInfo.country
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
                !locationInfo.country
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

              {locationInfo.state &&
                !selectedStateExists && (
                  <option
                    value={
                      locationInfo.state
                    }
                  >
                    {
                      locationInfo.state
                    }
                  </option>
                )}

              {states.map(
                (state) => (
                  <option
                    key={`${locationInfo.country}-${state.isoCode}`}
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
            label="District"
            htmlFor="profile-district"
          >
            {indianLocation ? (
              <Select
                id="profile-district"
                value={
                  locationInfo.district
                }
                disabled={
                  !locationInfo.state
                }
                onChange={(event) =>
                  updateLocation(
                    "district",
                    event.target.value
                  )
                }
              >
                <option value="">
                  {locationInfo.state
                    ? "Select district"
                    : "Select state first"}
                </option>

                {locationInfo.district &&
                  !selectedDistrictExists && (
                    <option
                      value={
                        locationInfo.district
                      }
                    >
                      {
                        locationInfo.district
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
                id="profile-district"
                value={
                  locationInfo.district
                }
                disabled={
                  !locationInfo.state
                }
                maxLength={120}
                placeholder={
                  locationInfo.state
                    ? "District (optional)"
                    : "Select state first"
                }
                onChange={(event) =>
                  updateLocation(
                    "district",
                    event.target.value
                  )
                }
              />
            )}
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

        <SectionDivider />

        <SectionHeading
          icon={
            <MessageSquareText
              size={15}
            />
          }
          title="About Me"
          description="Share a genuine introduction about your faith, values, personality and life."
          variant="gold"
        />

        <div className="mt-3">
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
              rows={5}
              placeholder="For example: I am family-oriented, value faith, honesty and meaningful relationships, and enjoy spending time with family..."
              className={[
                "w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition",
                "placeholder:text-slate-400",
                "focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100/80",

                errors.aboutMe
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200",
              ].join(" ")}
              onChange={(event) =>
                updateAboutInfo(
                  "aboutMe",
                  event.target.value
                )
              }
            />
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
            disabled
            fullWidth
            className="sm:w-auto"
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            rightIcon={
              <Users
                size={15}
              />
            }
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
  | "green"
  | "gold"
  | "purple";

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

    gold:
      "bg-amber-50 text-[#B38B19]",

    purple:
      "bg-purple-50 text-purple-700",
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