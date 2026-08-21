"use client";

import {
  useState,
} from "react";

import {
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarRange,
  Church,
  Cigarette,
  Heart,
  Languages,
  MapPin,
  Ruler,
  Sparkles,
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
  FAITH_COMMITMENT_OPTIONS,
  HEIGHT_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  PREFERRED_DENOMINATIONS,
  PREFERRED_DIET_OPTIONS,
  PREFERRED_DRINKING_OPTIONS,
  PREFERRED_EDUCATION_OPTIONS,
  PREFERRED_MARITAL_STATUS_OPTIONS,
  PREFERRED_RELIGION_OPTIONS,
  PREFERRED_SMOKING_OPTIONS,
} from "@/features/profile/data/profileOptions";

import {
  COUNTRIES,
  getCitiesForCountryState,
  getStatesForCountry,
} from "@/features/profile/data/worldLocations";

import type {
  PreferenceInfo,
} from "@/features/profile/types";

import {
  FieldErrors,
  focusFirstInvalidField,
  hasValidationErrors,
  validatePreferenceInfo,
} from "@/features/profile/validation/profileValidation";

interface PreferencesFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PreferencesForm({
  onNext,
  onBack,
}: PreferencesFormProps) {
  const {
    preferenceInfo,
    setProfile,
  } = useProfile();

  const [
    errors,
    setErrors,
  ] =
    useState<
      FieldErrors<PreferenceInfo>
    >({});

  const preferredStates =
    preferenceInfo.preferredCountry &&
    preferenceInfo.preferredCountry !==
      "Any"
      ? getStatesForCountry(
          preferenceInfo.preferredCountry
        )
      : [];

  const preferredCities =
    preferenceInfo.preferredCountry &&
    preferenceInfo.preferredCountry !==
      "Any" &&
    preferenceInfo.preferredState
      ? getCitiesForCountryState(
          preferenceInfo.preferredCountry,
          preferenceInfo.preferredState
        )
      : [];

  const selectedCountryExists =
    COUNTRIES.some(
      (country) =>
        country.value ===
        preferenceInfo.preferredCountry
    );

  const selectedStateExists =
    preferredStates.some(
      (state) =>
        state.value ===
        preferenceInfo.preferredState
    );

  const selectedCityExists =
    preferredCities.some(
      (city) =>
        city.value ===
        preferenceInfo.preferredCity
    );

  function clearError(
    field: keyof PreferenceInfo
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

  function updatePreferenceInfo(
    field: keyof PreferenceInfo,
    value: string | boolean
  ): void {
    setProfile((previous) => {
      let nextPreferenceInfo = {
        ...previous.preferenceInfo,
        [field]: value,
      } as PreferenceInfo;

      /*
       * Changing preferred country resets dependent
       * State and City selections.
       */
      if (
        field ===
        "preferredCountry"
      ) {
        nextPreferenceInfo = {
          ...nextPreferenceInfo,
          preferredCountry:
            String(value),
          preferredState: "",
          preferredCity: "",
        };
      }

      /*
       * Changing preferred state resets City.
       */
      if (
        field ===
        "preferredState"
      ) {
        nextPreferenceInfo = {
          ...nextPreferenceInfo,
          preferredState:
            String(value),
          preferredCity: "",
        };
      }

      /*
       * Community No Bar means community should
       * not restrict matching.
       *
       * Clear the stored preference to keep the
       * meaning unambiguous.
       */
      if (
        field ===
          "communityNoBar" &&
        value === true
      ) {
        nextPreferenceInfo = {
          ...nextPreferenceInfo,
          communityNoBar: true,
          preferredCommunity: "",
        };
      }

      return {
        ...previous,
        preferenceInfo:
          nextPreferenceInfo,
      };
    });

    clearError(field);

    if (
      field ===
      "communityNoBar"
    ) {
      clearError(
        "preferredCommunity"
      );
    }

    if (
      field ===
      "preferredCountry"
    ) {
      clearError(
        "preferredState"
      );

      clearError(
        "preferredCity"
      );
    }

    if (
      field ===
      "preferredState"
    ) {
      clearError(
        "preferredCity"
      );
    }
  }

  function handleContinue(): void {
    const validationErrors =
      validatePreferenceInfo(
        preferenceInfo
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

      <div className="border-b border-slate-100 bg-gradient-to-r from-pink-50/75 via-white to-purple-50/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-fuchsia-700 text-white shadow-sm">
            <Heart
              size={17}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Step 5 of 7
            </p>

            <h2 className="mt-0.5 text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
              Partner Preferences
            </h2>

            <p className="mt-0.5 max-w-3xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Tell us what matters to you in a life partner. Flexible preferences help you discover more compatible matches.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">

        <div className="mb-4 rounded-xl border border-pink-100 bg-pink-50/60 px-3 py-2.5 text-[11px] leading-5 text-pink-800">
          Age range, height range, religion and education are required for profile completion. Other preferences can be kept flexible.
        </div>

        {/* =====================================================
            Age & Height
            ===================================================== */}

        <SectionHeading
          icon={
            <CalendarRange
              size={15}
            />
          }
          title="Age & Height"
          description="Choose the age and height ranges you are comfortable with."
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">

          <FormField
            label="Preferred Age From"
            required
            htmlFor="preferred-age-from"
            error={
              errors.preferredAgeFrom
            }
          >
            <IconField
              icon={
                <CalendarRange
                  size={16}
                />
              }
            >
              <Input
                id="preferred-age-from"
                type="number"
                min={18}
                max={100}
                inputMode="numeric"
                value={
                  preferenceInfo.preferredAgeFrom
                }
                error={
                  errors.preferredAgeFrom
                }
                placeholder="Example: 24"
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredAgeFrom",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Preferred Age To"
            required
            htmlFor="preferred-age-to"
            error={
              errors.preferredAgeTo
            }
          >
            <IconField
              icon={
                <CalendarRange
                  size={16}
                />
              }
            >
              <Input
                id="preferred-age-to"
                type="number"
                min={18}
                max={100}
                inputMode="numeric"
                value={
                  preferenceInfo.preferredAgeTo
                }
                error={
                  errors.preferredAgeTo
                }
                placeholder="Example: 30"
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredAgeTo",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Preferred Height From"
            required
            htmlFor="preferred-height-from"
            error={
              errors.preferredHeightFromCm
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
                id="preferred-height-from"
                value={
                  preferenceInfo.preferredHeightFromCm
                }
                error={
                  errors.preferredHeightFromCm
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredHeightFromCm",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select minimum height
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
            label="Preferred Height To"
            required
            htmlFor="preferred-height-to"
            error={
              errors.preferredHeightToCm
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
                id="preferred-height-to"
                value={
                  preferenceInfo.preferredHeightToCm
                }
                error={
                  errors.preferredHeightToCm
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredHeightToCm",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select maximum height
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
        </div>

        {/* =====================================================
            Faith & Community
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <Church
              size={15}
            />
          }
          title="Faith & Community"
          description="Religion, denomination and community are independent preferences."
          variant="gold"
        />

        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-3 text-[11px] leading-5 text-amber-900">
          Example: you may prefer <strong>Religion: Christianity</strong> and <strong>Community: Reddy</strong>, while another member may choose <strong>Community No Bar</strong>.
        </div>

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">

          <FormField
            label="Preferred Religion"
            required
            htmlFor="preferred-religion"
            error={
              errors.preferredReligion
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
                id="preferred-religion"
                value={
                  preferenceInfo.preferredReligion
                }
                error={
                  errors.preferredReligion
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredReligion",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select preferred religion
                </option>

                {PREFERRED_RELIGION_OPTIONS.map(
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
            label="Preferred Denomination"
            htmlFor="preferred-denomination"
            error={
              errors.preferredDenomination
            }
            helperText="Optional — choose Any if denomination does not matter."
          >
            <Select
              id="preferred-denomination"
              value={
                preferenceInfo.preferredDenomination
              }
              error={
                errors.preferredDenomination
              }
              onChange={(event) =>
                updatePreferenceInfo(
                  "preferredDenomination",
                  event.target.value
                )
              }
            >
              <option value="">
                Select denomination
              </option>

              {PREFERRED_DENOMINATIONS.map(
                (denomination) => (
                  <option
                    key={
                      denomination
                    }
                    value={
                      denomination
                    }
                  >
                    {denomination}
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField
            label="Preferred Community / Caste"
            htmlFor="preferred-community"
            error={
              errors.preferredCommunity
            }
            helperText={
              preferenceInfo.communityNoBar
                ? "Community No Bar is enabled."
                : "Enter a community such as Reddy, Kamma or Kapu."
            }
          >
            <IconField
              icon={
                <UsersRound
                  size={16}
                />
              }
            >
              <Input
                id="preferred-community"
                value={
                  preferenceInfo.preferredCommunity
                }
                error={
                  errors.preferredCommunity
                }
                disabled={
                  preferenceInfo.communityNoBar
                }
                maxLength={120}
                placeholder={
                  preferenceInfo.communityNoBar
                    ? "Any community"
                    : "Enter preferred community"
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredCommunity",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Community Preference"
            htmlFor="community-no-bar"
          >
            <label
              htmlFor="community-no-bar"
              className={[
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition",
                preferenceInfo.communityNoBar
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300",
              ].join(" ")}
            >
              <input
                id="community-no-bar"
                type="checkbox"
                checked={
                  preferenceInfo.communityNoBar
                }
                className="h-4 w-4 rounded border-slate-300"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "communityNoBar",
                    event.target.checked
                  )
                }
              />

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Community No Bar
                </p>

                <p className="text-[11px] leading-4 text-slate-500">
                  Show compatible matches from any community.
                </p>
              </div>
            </label>
          </FormField>

          <FormField
            label="Preferred Mother Tongue"
            htmlFor="preferred-mother-tongue"
            helperText="Optional"
          >
            <IconField
              icon={
                <Languages
                  size={16}
                />
              }
            >
              <Select
                id="preferred-mother-tongue"
                value={
                  preferenceInfo.preferredMotherTongue
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredMotherTongue",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Any mother tongue
                </option>

                <option value="Any">
                  Any
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
            </IconField>
          </FormField>

          <FormField
            label="Preferred Faith Commitment"
            htmlFor="preferred-faith-commitment"
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
                id="preferred-faith-commitment"
                value={
                  preferenceInfo.preferredFaithCommitment
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredFaithCommitment",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select preference
                </option>

                {FAITH_COMMITMENT_OPTIONS.map(
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
            Marriage, Education & Career
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <BookOpenCheck
              size={15}
            />
          }
          title="Marriage, Education & Career"
          description="Choose preferences for marital status, education and profession."
          variant="blue"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">

          <FormField
            label="Preferred Marital Status"
            htmlFor="preferred-marital-status"
            helperText="Optional"
          >
            <Select
              id="preferred-marital-status"
              value={
                preferenceInfo.preferredMaritalStatus
              }
              onChange={(event) =>
                updatePreferenceInfo(
                  "preferredMaritalStatus",
                  event.target.value
                )
              }
            >
              <option value="">
                Select marital status
              </option>

              {PREFERRED_MARITAL_STATUS_OPTIONS.map(
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
          </FormField>

          <FormField
            label="Preferred Education"
            required
            htmlFor="preferred-education"
            error={
              errors.preferredEducation
            }
          >
            <IconField
              icon={
                <BookOpenCheck
                  size={16}
                />
              }
            >
              <Select
                id="preferred-education"
                value={
                  preferenceInfo.preferredEducation
                }
                error={
                  errors.preferredEducation
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredEducation",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select education
                </option>

                {PREFERRED_EDUCATION_OPTIONS.map(
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
            </IconField>
          </FormField>

          <FormField
            label="Preferred Profession"
            htmlFor="preferred-profession"
            error={
              errors.preferredProfession
            }
            helperText="Optional — leave blank for any profession."
            className="md:col-span-2"
          >
            <div className="md:max-w-[calc(50%-0.5rem)]">
              <IconField
                icon={
                  <BriefcaseBusiness
                    size={16}
                  />
                }
              >
                <Input
                  id="preferred-profession"
                  value={
                    preferenceInfo.preferredProfession
                  }
                  error={
                    errors.preferredProfession
                  }
                  maxLength={120}
                  placeholder="Example: Doctor, Engineer, Any"
                  className="pl-10"
                  onChange={(event) =>
                    updatePreferenceInfo(
                      "preferredProfession",
                      event.target.value
                    )
                  }
                />
              </IconField>
            </div>
          </FormField>
        </div>

        {/* =====================================================
            Preferred Location
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <MapPin
              size={15}
            />
          }
          title="Preferred Location"
          description="Optional. Leave these fields blank if location does not matter."
          variant="green"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-3">

          <FormField
            label="Preferred Country"
            htmlFor="preferred-country"
            error={
              errors.preferredCountry
            }
          >
            <Select
              id="preferred-country"
              value={
                preferenceInfo.preferredCountry
              }
              error={
                errors.preferredCountry
              }
              onChange={(event) =>
                updatePreferenceInfo(
                  "preferredCountry",
                  event.target.value
                )
              }
            >
              <option value="">
                Any country
              </option>

              {preferenceInfo.preferredCountry &&
                preferenceInfo.preferredCountry !==
                  "Any" &&
                !selectedCountryExists && (
                  <option
                    value={
                      preferenceInfo.preferredCountry
                    }
                  >
                    {
                      preferenceInfo.preferredCountry
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
                    {country.label}
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField
            label="Preferred State"
            htmlFor="preferred-state"
            error={
              errors.preferredState
            }
          >
            <Select
              id="preferred-state"
              value={
                preferenceInfo.preferredState
              }
              error={
                errors.preferredState
              }
              disabled={
                !preferenceInfo.preferredCountry ||
                preferenceInfo.preferredCountry ===
                  "Any"
              }
              onChange={(event) =>
                updatePreferenceInfo(
                  "preferredState",
                  event.target.value
                )
              }
            >
              <option value="">
                Any state
              </option>

              {preferenceInfo.preferredState &&
                !selectedStateExists && (
                  <option
                    value={
                      preferenceInfo.preferredState
                    }
                  >
                    {
                      preferenceInfo.preferredState
                    }
                  </option>
                )}

              {preferredStates.map(
                (state) => (
                  <option
                    key={`${preferenceInfo.preferredCountry}-${state.isoCode}`}
                    value={
                      state.value
                    }
                  >
                    {state.label}
                  </option>
                )
              )}
            </Select>
          </FormField>

          <FormField
            label="Preferred City"
            htmlFor="preferred-city"
            error={
              errors.preferredCity
            }
          >
            <Select
              id="preferred-city"
              value={
                preferenceInfo.preferredCity
              }
              error={
                errors.preferredCity
              }
              disabled={
                !preferenceInfo.preferredState
              }
              onChange={(event) =>
                updatePreferenceInfo(
                  "preferredCity",
                  event.target.value
                )
              }
            >
              <option value="">
                Any city
              </option>

              {preferenceInfo.preferredCity &&
                !selectedCityExists && (
                  <option
                    value={
                      preferenceInfo.preferredCity
                    }
                  >
                    {
                      preferenceInfo.preferredCity
                    }
                  </option>
                )}

              {preferredCities.map(
                (city) => (
                  <option
                    key={
                      city.value
                    }
                    value={
                      city.value
                    }
                  >
                    {city.label}
                  </option>
                )
              )}
            </Select>
          </FormField>
        </div>

        {/* =====================================================
            Lifestyle
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <Utensils
              size={15}
            />
          }
          title="Lifestyle Preferences"
          description="Optional compatibility preferences."
          variant="purple"
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-3">

          <FormField
            label="Preferred Diet"
            htmlFor="preferred-diet"
          >
            <IconField
              icon={
                <Utensils
                  size={16}
                />
              }
            >
              <Select
                id="preferred-diet"
                value={
                  preferenceInfo.preferredDiet
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredDiet",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Any
                </option>

                {PREFERRED_DIET_OPTIONS.map(
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
            label="Preferred Smoking"
            htmlFor="preferred-smoking"
          >
            <IconField
              icon={
                <Cigarette
                  size={16}
                />
              }
            >
              <Select
                id="preferred-smoking"
                value={
                  preferenceInfo.preferredSmoking
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredSmoking",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Any
                </option>

                {PREFERRED_SMOKING_OPTIONS.map(
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
            label="Preferred Drinking"
            htmlFor="preferred-drinking"
          >
            <IconField
              icon={
                <Wine
                  size={16}
                />
              }
            >
              <Select
                id="preferred-drinking"
                value={
                  preferenceInfo.preferredDrinking
                }
                className="pl-10"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredDrinking",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Any
                </option>

                {PREFERRED_DRINKING_OPTIONS.map(
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

        {/* Recommendation explanation */}

        <div className="mt-5 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-yellow-50/50 px-3.5 py-3">
          <div className="flex items-start gap-2">
            <Sparkles
              size={15}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <p className="text-[11px] leading-5 text-amber-900 sm:text-xs">
              Preferences help Holy Matrimony rank compatible profiles. They should guide recommendations rather than unnecessarily hide potentially suitable matches.
            </p>
          </div>
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