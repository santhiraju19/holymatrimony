"use client";

import {
  useState,
} from "react";

import {
  BookOpenCheck,
  CalendarRange,
  Church,
  Heart,
  Sparkles,
} from "lucide-react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

import {
  PREFERRED_EDUCATION_OPTIONS,
  PREFERRED_DENOMINATIONS,
} from "@/features/profile/data/profileOptions";

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
  const { preferenceInfo } =
    useProfile();

  const { updateSection } =
    useProfileUpdater();

  const [
    errors,
    setErrors,
  ] = useState<
    FieldErrors<PreferenceInfo>
  >({});

  function updatePreferenceInfo(
    field: keyof PreferenceInfo,
    value: string
  ) {
    updateSection(
      "preferenceInfo",
      field,
      value
    );

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
      <div className="border-b border-slate-200 bg-gradient-to-r from-pink-50 via-white to-purple-50 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-lg ">
            <Heart size={27} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
              Step 5 of 7
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0B2D5C] sm:text-2xl">
              Partner Preferences
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              Tell us what matters most
              to you in a prospective life
              partner.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50/70 px-4 py-3 text-sm text-purple-800">
          <div className="flex items-start gap-2">
            <Sparkles
              size={17}
              className="mt-0.5 shrink-0"
            />

            <p>
              Choose
              <strong className="mx-1">
                Any
              </strong>
              when you are open to all
              denominations or education
              levels.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
          <FormField
            label="Preferred Age From"
            required
            htmlFor="preferred-age-from"
            error={
              errors.preferredAgeFrom
            }
          >
            <div className="relative">
              <CalendarRange
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="preferred-age-from"
                type="number"
                min="18"
                max="100"
                inputMode="numeric"
                value={
                  preferenceInfo.preferredAgeFrom
                }
                error={
                  errors.preferredAgeFrom
                }
                placeholder="For example: 24"
                className="pl-11"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredAgeFrom",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Preferred Age To"
            required
            htmlFor="preferred-age-to"
            error={
              errors.preferredAgeTo
            }
          >
            <div className="relative">
              <CalendarRange
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="preferred-age-to"
                type="number"
                min="18"
                max="100"
                inputMode="numeric"
                value={
                  preferenceInfo.preferredAgeTo
                }
                error={
                  errors.preferredAgeTo
                }
                placeholder="For example: 30"
                className="pl-11"
                onChange={(event) =>
                  updatePreferenceInfo(
                    "preferredAgeTo",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Preferred Denomination"
            required
            htmlFor="preferred-denomination"
            error={
              errors.preferredDenomination
            }
          >
            <div className="relative">
              <Church
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Select
                id="preferred-denomination"
                value={
                  preferenceInfo.preferredDenomination
                }
                error={
                  errors.preferredDenomination
                }
                className="pl-11"
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
                      {
                        denomination
                      }
                    </option>
                  )
                )}
              </Select>
            </div>
          </FormField>

          <FormField
            label="Preferred Education"
            required
            htmlFor="preferred-education"
            error={
              errors.preferredEducation
            }
          >
            <div className="relative">
              <BookOpenCheck
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Select
                id="preferred-education"
                value={
                  preferenceInfo.preferredEducation
                }
                error={
                  errors.preferredEducation
                }
                className="pl-11"
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
                      {
                        education
                      }
                    </option>
                  )
                )}
              </Select>
            </div>
          </FormField>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <p className="text-sm leading-6 text-amber-900">
            These preferences help improve
            recommendations, but users can
            still discover profiles outside
            their selected preferences.
          </p>
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