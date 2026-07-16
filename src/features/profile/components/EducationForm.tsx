"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

interface EducationFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function EducationForm({
  onNext,
  onBack,
}: EducationFormProps) {
  const { educationInfo } = useProfile();
  const { updateSection } = useProfileUpdater();

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0B2D5C]">
          Step 3 • Education & Career
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us about your education and profession.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <FormField
          label="Highest Education"
          required
        >
          <Select
            value={educationInfo.highestEducation}
            onChange={(e) =>
              updateSection(
                "educationInfo",
                "highestEducation",
                e.target.value
              )
            }
          >
            <option value="">Select Education</option>
            <option value="SSC">SSC</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="Doctorate">Doctorate</option>
          </Select>
        </FormField>

        <FormField
          label="Profession"
          required
        >
          <Input
            value={educationInfo.profession}
            placeholder="Software Engineer"
            onChange={(e) =>
              updateSection(
                "educationInfo",
                "profession",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField
          label="Company"
        >
          <Input
            value={educationInfo.company}
            placeholder="Company Name"
            onChange={(e) =>
              updateSection(
                "educationInfo",
                "company",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField
          label="Annual Income"
        >
          <Input
            value={educationInfo.annualIncome}
            placeholder="₹ 10,00,000"
            onChange={(e) =>
              updateSection(
                "educationInfo",
                "annualIncome",
                e.target.value
              )
            }
          />
        </FormField>

      </div>

      <div className="mt-10 flex justify-between">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </Card>
  );
}