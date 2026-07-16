"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

interface FamilyFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FamilyForm({
  onNext,
  onBack,
}: FamilyFormProps) {
  const { familyInfo } = useProfile();
  const { updateSection } = useProfileUpdater();

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0B2D5C]">
          Step 4 • Family Details
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us about your family background.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Father's Name" required>
          <Input
            value={familyInfo.fatherName}
            placeholder="Enter father's name"
            onChange={(e) =>
              updateSection(
                "familyInfo",
                "fatherName",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField label="Mother's Name" required>
          <Input
            value={familyInfo.motherName}
            placeholder="Enter mother's name"
            onChange={(e) =>
              updateSection(
                "familyInfo",
                "motherName",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField label="Number of Siblings">
          <Input
            value={familyInfo.siblings}
            placeholder="e.g. 2"
            onChange={(e) =>
              updateSection(
                "familyInfo",
                "siblings",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField label="Family Location">
          <Input
            value={familyInfo.familyLocation}
            placeholder="City, State"
            onChange={(e) =>
              updateSection(
                "familyInfo",
                "familyLocation",
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