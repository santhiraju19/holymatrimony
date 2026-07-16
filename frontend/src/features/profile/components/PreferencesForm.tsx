"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";
import { useProfileUpdater } from "@/features/profile/hooks/useProfileUpdater";

interface PreferencesFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PreferencesForm({
  onNext,
  onBack,
}: PreferencesFormProps) {
  const { preferenceInfo } = useProfile();
  const { updateSection } = useProfileUpdater();

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0B2D5C]">
          Step 5 • Partner Preferences
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us about your preferred life partner.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <FormField
          label="Preferred Age From"
          required
        >
          <Input
            type="number"
            value={preferenceInfo.preferredAgeFrom}
            placeholder="24"
            onChange={(e) =>
              updateSection(
                "preferenceInfo",
                "preferredAgeFrom",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField
          label="Preferred Age To"
          required
        >
          <Input
            type="number"
            value={preferenceInfo.preferredAgeTo}
            placeholder="30"
            onChange={(e) =>
              updateSection(
                "preferenceInfo",
                "preferredAgeTo",
                e.target.value
              )
            }
          />
        </FormField>

        <FormField
          label="Preferred Denomination"
        >
          <Select
            value={preferenceInfo.denomination}
            onChange={(e) =>
              updateSection(
                "preferenceInfo",
                "denomination",
                e.target.value
              )
            }
          >
            <option value="">Select Denomination</option>
            <option value="CSI">CSI</option>
            <option value="Catholic">Catholic</option>
            <option value="Baptist">Baptist</option>
            <option value="Pentecostal">Pentecostal</option>
            <option value="Methodist">Methodist</option>
            <option value="Lutheran">Lutheran</option>
            <option value="Independent">Independent</option>
          </Select>
        </FormField>

        <FormField
          label="Preferred Education"
        >
          <Select
            value={preferenceInfo.education}
            onChange={(e) =>
              updateSection(
                "preferenceInfo",
                "education",
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