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
  ): void {
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
      {/* Compact Step Header */}
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

            <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Tell us what matters most to you in a prospective life partner.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Flexible preference note */}
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-purple-100 bg-purple-50/65 px-3 py-2.5 text-[11px] leading-5 text-purple-800">
          <Sparkles
            size={14}
            className="mt-0.5 shrink-0"
          />

          <p>
            Choose{" "}
            <strong>
              Any
            </strong>{" "}
            when you are open to all denominations or education levels.
          </p>
        </div>

        <SectionHeading
          icon={
            <Heart
              size={15}
            />
          }
          title="Match Preferences"
          description="Set your preferred age range, denomination and education."
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
            label="Preferred Denomination"
            required
            htmlFor="preferred-denomination"
            error={
              errors.preferredDenomination
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
                id="preferred-denomination"
                value={
                  preferenceInfo.preferredDenomination
                }
                error={
                  errors.preferredDenomination
                }
                className="pl-10"
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
            </IconField>
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
                      {
                        education
                      }
                    </option>
                  )
                )}
              </Select>
            </IconField>
          </FormField>
        </div>

        {/* Recommendation explanation */}
        <div className="mt-4 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-yellow-50/50 px-3 py-2.5">
          <p className="text-[11px] leading-5 text-amber-900 sm:text-xs">
            These preferences improve recommendations, but you can still discover profiles outside your selected preferences.
          </p>
        </div>

        {/* Navigation */}
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

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
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
