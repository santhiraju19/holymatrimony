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
  Plus,
  Ruler,
  Trash2,
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
  PreferredLocation,
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
       * Community No Bar means community should not
       * restrict matching.
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
  }

  function syncLegacyPreferredLocation(
    preferenceInfo: PreferenceInfo,
    preferredLocations: PreferredLocation[]
  ): PreferenceInfo {
    const first =
      preferredLocations[0];

    return {
      ...preferenceInfo,

      preferredLocations,

      /*
       * Keep the legacy scalar fields synchronized with
       * the first preferred location while older search /
       * matching code still reads those columns.
       */
      preferredCountry:
        first?.country ?? "",

      preferredState:
        first?.state ?? "",

      preferredDistrict:
        first?.district ?? "",

      preferredCity:
        first?.city ?? "",
    };
  }

  function addPreferredLocation(): void {
    setProfile((previous) => {
      const preferredLocations = [
        ...previous.preferenceInfo
          .preferredLocations,

        {
          country: "",
          state: "",
          district: "",
          city: "",
        },
      ];

      return {
        ...previous,

        preferenceInfo:
          syncLegacyPreferredLocation(
            previous.preferenceInfo,
            preferredLocations
          ),
      };
    });
  }

  function removePreferredLocation(
    index: number
  ): void {
    setProfile((previous) => {
      const preferredLocations =
        previous.preferenceInfo
          .preferredLocations
          .filter(
            (_, locationIndex) =>
              locationIndex !== index
          );

      return {
        ...previous,

        preferenceInfo:
          syncLegacyPreferredLocation(
            previous.preferenceInfo,
            preferredLocations
          ),
      };
    });
  }

  function updatePreferredLocation(
    index: number,
    field: keyof PreferredLocation,
    value: string
  ): void {
    setProfile((previous) => {
      const preferredLocations =
        previous.preferenceInfo
          .preferredLocations
          .map(
            (
              location,
              locationIndex
            ) => {
              if (
                locationIndex !== index
              ) {
                return location;
              }

              if (
                field === "country"
              ) {
                return {
                  country: value,
                  state: "",
                  district: "",
                  city: "",
                };
              }

              if (
                field === "state"
              ) {
                return {
                  ...location,
                  state: value,
                  district: "",
                  city: "",
                };
              }

              return {
                ...location,
                [field]: value,
              };
            }
          );

      return {
        ...previous,

        preferenceInfo:
          syncLegacyPreferredLocation(
            previous.preferenceInfo,
            preferredLocations
          ),
      };
    });
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
          Partner preferences are optional. Add the details that matter to you to improve personalized recommendations, or keep them flexible to discover more suitable matches.
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
            Preferred Locations
            ===================================================== */}

        <SectionDivider />

        <SectionHeading
          icon={
            <MapPin
              size={15}
            />
          }
          title="Preferred Locations"
          description="Add one or more places where you would prefer your life partner to be based."
          variant="green"
        />

        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/45 px-3.5 py-3 text-[10px] leading-5 text-emerald-800 sm:text-[11px]">
          You can choose multiple countries, states, districts and
          cities by adding multiple preferred locations. Leave this
          section empty when location does not matter. Preferred
          locations do not affect profile completion or verification.
        </div>

        <div className="mt-4 space-y-4">

          {preferenceInfo.preferredLocations.map(
            (
              location,
              index
            ) => {
              const states =
                location.country
                  ? getStatesForCountry(
                      location.country
                    )
                  : [];

              const cities =
                location.country &&
                location.state
                  ? getCitiesForCountryState(
                      location.country,
                      location.state
                    )
                  : [];

              const selectedCountryExists =
                COUNTRIES.some(
                  (country) =>
                    country.value ===
                    location.country
                );

              const selectedStateExists =
                states.some(
                  (state) =>
                    state.value ===
                    location.state
                );

              const selectedCityExists =
                cities.some(
                  (city) =>
                    city.value ===
                    location.city
                );

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/55 p-3.5 sm:p-4"
                >

                  <div className="mb-3 flex items-center justify-between gap-3">

                    <div>
                      <p className="text-xs font-black text-[#0B2D5C]">
                        Preferred Location {index + 1}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Choose as much geographic detail as you want.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removePreferredLocation(
                          index
                        )
                      }
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-[10px] font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2
                        size={13}
                      />
                      Remove
                    </button>

                  </div>

                  <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2 lg:grid-cols-4">

                    {/* Country */}

                    <FormField
                      label="Country"
                      htmlFor={`preferred-country-${index}`}
                    >
                      <Select
                        id={`preferred-country-${index}`}
                        value={
                          location.country
                        }
                        onChange={(event) =>
                          updatePreferredLocation(
                            index,
                            "country",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Any country
                        </option>

                        {location.country &&
                          !selectedCountryExists && (
                            <option
                              value={
                                location.country
                              }
                            >
                              {
                                location.country
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
                      label="State"
                      htmlFor={`preferred-state-${index}`}
                    >
                      <Select
                        id={`preferred-state-${index}`}
                        value={
                          location.state
                        }
                        disabled={
                          !location.country
                        }
                        onChange={(event) =>
                          updatePreferredLocation(
                            index,
                            "state",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Any state
                        </option>

                        {location.state &&
                          !selectedStateExists && (
                            <option
                              value={
                                location.state
                              }
                            >
                              {
                                location.state
                              }
                            </option>
                          )}

                        {states.map(
                          (state) => (
                            <option
                              key={`${location.country}-${state.isoCode}`}
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
                      label="District"
                      htmlFor={`preferred-district-${index}`}
                    >
                      <Input
                        id={`preferred-district-${index}`}
                        value={
                          location.district
                        }
                        disabled={
                          !location.state
                        }
                        maxLength={120}
                        placeholder={
                          location.state
                            ? "Any district"
                            : "Select state first"
                        }
                        onChange={(event) =>
                          updatePreferredLocation(
                            index,
                            "district",
                            event.target.value
                          )
                        }
                      />
                    </FormField>

                    {/* City */}

                    <FormField
                      label="City"
                      htmlFor={`preferred-city-${index}`}
                    >
                      <Select
                        id={`preferred-city-${index}`}
                        value={
                          location.city
                        }
                        disabled={
                          !location.state
                        }
                        onChange={(event) =>
                          updatePreferredLocation(
                            index,
                            "city",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Any city
                        </option>

                        {location.city &&
                          !selectedCityExists && (
                            <option
                              value={
                                location.city
                              }
                            >
                              {
                                location.city
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
                </div>
              );
            }
          )}

          {preferenceInfo.preferredLocations.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">

              <MapPin
                size={22}
                className="mx-auto text-slate-400"
              />

              <p className="mt-2 text-xs font-black text-slate-700">
                No preferred locations selected
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Your recommendations can currently include members
                from any location.
              </p>

            </div>
          )}

          <button
            type="button"
            onClick={
              addPreferredLocation
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-black text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            <Plus
              size={15}
            />
            Add Another Preferred Location
          </button>

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