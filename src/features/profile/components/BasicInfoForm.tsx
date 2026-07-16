"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";

interface BasicInfoFormProps {
  onNext: () => void;
}

export default function BasicInfoForm({
  onNext,
}: BasicInfoFormProps) {
  const { basicInfo, setProfile } = useProfile();

  const updateBasicInfo = (
    field: keyof typeof basicInfo,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value,
      },
    }));
  };

  return (
    <Card>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0B2D5C]">
          Step 1 • Basic Information
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us about yourself.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          label="Full Name"
          required
        >
          <Input
            value={basicInfo.fullName}
            placeholder="Enter your full name"
            onChange={(e) =>
              updateBasicInfo("fullName", e.target.value)
            }
          />
        </FormField>

        <FormField
          label="Mobile Number"
          required
        >
          <Input
            value={basicInfo.mobile}
            placeholder="+91 9876543210"
            onChange={(e) =>
              updateBasicInfo("mobile", e.target.value)
            }
          />
        </FormField>

        <FormField
          label="Date of Birth"
          required
        >
          <Input
            type="date"
            value={basicInfo.dateOfBirth}
            onChange={(e) =>
              updateBasicInfo("dateOfBirth", e.target.value)
            }
          />
        </FormField>

        <FormField
          label="Gender"
          required
        >
          <Select
            value={basicInfo.gender}
            onChange={(e) =>
              updateBasicInfo("gender", e.target.value)
            }
          >
            <option value="">Select Gender</option>
            <option value="Bride">Male</option>
            <option value="Groom">Female</option>
          </Select>
        </FormField>
      </div>

      <div className="mt-10 flex justify-between">
        <Button
          variant="secondary"
          disabled
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