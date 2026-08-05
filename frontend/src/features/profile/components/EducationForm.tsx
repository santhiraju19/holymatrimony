"use client";

import {
  useState,
} from "react";

import {
  Briefcase,
  Building2,
  GraduationCap,
  IndianRupee,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

import {
  PROFESSION_GROUPS,
} from "@/features/profile/data/profileOptions";

import type {
  EducationInfo,
} from "@/features/profile/types";

import {
  FieldErrors,
  focusFirstInvalidField,
  hasValidationErrors,
  validateEducationInfo,
} from "@/features/profile/validation/profileValidation";

interface EducationFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function EducationForm({
  onNext,
  onBack,
}: EducationFormProps) {
  const { educationInfo } =
    useProfile();

  const { updateSection } =
    useProfileUpdater();

  const [
    errors,
    setErrors,
  ] = useState<
    FieldErrors<EducationInfo>
  >({});

  function updateEducationInfo(
    field: keyof EducationInfo,
    value: string
  ) {
    updateSection(
      "educationInfo",
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
      validateEducationInfo(
        educationInfo
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
      <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-lg sm:h-14 sm:w-14">
            <GraduationCap
              size={27}
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
              Step 3 of 7
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2D5C] sm:text-3xl">
              Education & Career
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Add your educational and
              professional information to
              help create meaningful match
              recommendations.
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
            label="Highest Education"
            required
            htmlFor="highest-education"
            error={
              errors.highestEducation
            }
          >
            <div className="relative">
              <GraduationCap
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Select
                id="highest-education"
                value={
                  educationInfo.highestEducation
                }
                error={
                  errors.highestEducation
                }
                className="pl-11"
                onChange={(event) =>
                  updateEducationInfo(
                    "highestEducation",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select education
                </option>

                <option value="No Formal Education">
                  No Formal Education
                </option>

                <option value="SSC">
                  SSC
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="ITI">
                  ITI
                </option>

                <option value="Diploma">
                  Diploma
                </option>

                <option value="Bachelor's Degree">
                  Bachelor&apos;s Degree
                </option>

                <option value="Master's Degree">
                  Master&apos;s Degree
                </option>

                <option value="Doctorate">
                  Doctorate
                </option>

                <option value="Other">
                  Other
                </option>

                <option value="Rather not say">
                  Rather not say
                </option>
              </Select>
            </div>
          </FormField>

          <FormField
            label="Profession"
            required
            htmlFor="profession"
            error={errors.profession}
          >
            <div className="relative">
              <Briefcase
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Select
                id="profession"
                value={
                  educationInfo.profession
                }
                error={
                  errors.profession
                }
                className="pl-11"
                onChange={(event) =>
                  updateEducationInfo(
                    "profession",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select profession
                </option>

                {PROFESSION_GROUPS.map(
                  (group) => (
                    <optgroup
                      key={
                        group.label
                      }
                      label={
                        group.label
                      }
                    >
                      {group.professions.map(
                        (
                          profession
                        ) => (
                          <option
                            key={
                              profession
                            }
                            value={
                              profession
                            }
                          >
                            {
                              profession
                            }
                          </option>
                        )
                      )}
                    </optgroup>
                  )
                )}
              </Select>
            </div>
          </FormField>

          <FormField
            label="Company / Organization"
            htmlFor="company"
            error={errors.company}
            helperText="Optional"
          >
            <div className="relative">
              <Building2
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="company"
                value={
                  educationInfo.company
                }
                error={
                  errors.company
                }
                placeholder="Company or organization name"
                className="pl-11"
                onChange={(event) =>
                  updateEducationInfo(
                    "company",
                    event.target.value
                  )
                }
              />
            </div>
          </FormField>

          <FormField
            label="Annual Income"
            htmlFor="annual-income"
            error={
              errors.annualIncome
            }
            helperText="Optional"
          >
            <div className="relative">
              <IndianRupee
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />

              <Input
                id="annual-income"
                value={
                  educationInfo.annualIncome
                }
                error={
                  errors.annualIncome
                }
                placeholder="For example: ₹10,00,000"
                className="pl-11"
                onChange={(event) =>
                  updateEducationInfo(
                    "annualIncome",
                    event.target.value
                  )
                }
              />
            </div>
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