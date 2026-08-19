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

import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/select";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

import {
  EDUCATION_OPTIONS,
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
  ): void {
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
      {/* Compact Step Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/75 via-white to-blue-50/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-emerald-700 text-white shadow-sm">
            <GraduationCap
              size={17}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
              Step 3 of 7
            </p>

            <h2 className="mt-0.5 text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
              Education & Career
            </h2>

            <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">
              Add your education and professional information to improve match recommendations.
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
            <GraduationCap
              size={15}
            />
          }
          title="Education & Profession"
          description="Share your academic background and current career."
        />

        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
          <FormField
            label="Highest Education"
            required
            htmlFor="highest-education"
            error={
              errors.highestEducation
            }
          >
            <IconField
              icon={
                <GraduationCap
                  size={16}
                />
              }
            >
              <Select
                id="highest-education"
                value={
                  educationInfo.highestEducation
                }
                error={
                  errors.highestEducation
                }
                className="pl-10"
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

                {EDUCATION_OPTIONS.map(
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

          <FormField
            label="Profession"
            required
            htmlFor="profession"
            error={
              errors.profession
            }
          >
            <IconField
              icon={
                <Briefcase
                  size={16}
                />
              }
            >
              <Select
                id="profession"
                value={
                  educationInfo.profession
                }
                error={
                  errors.profession
                }
                className="pl-10"
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
            </IconField>
          </FormField>

          <FormField
            label="Company / Organization"
            htmlFor="company"
            error={
              errors.company
            }
            helperText="Optional"
          >
            <IconField
              icon={
                <Building2
                  size={16}
                />
              }
            >
              <Input
                id="company"
                value={
                  educationInfo.company
                }
                error={
                  errors.company
                }
                placeholder="Company or organization name"
                className="pl-10"
                onChange={(event) =>
                  updateEducationInfo(
                    "company",
                    event.target.value
                  )
                }
              />
            </IconField>
          </FormField>

          <FormField
            label="Annual Income"
            htmlFor="annual-income"
            error={
              errors.annualIncome
            }
            helperText="Optional"
          >
            <IconField
              icon={
                <IndianRupee
                  size={16}
                />
              }
            >
              <Input
                id="annual-income"
                value={
                  educationInfo.annualIncome
                }
                error={
                  errors.annualIncome
                }
                placeholder="For example: ₹10,00,000"
                className="pl-10"
                onChange={(event) =>
                  updateEducationInfo(
                    "annualIncome",
                    event.target.value
                  )
                }
              />
            </IconField>
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
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
