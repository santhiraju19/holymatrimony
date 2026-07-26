"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useProfile } from "@/features/profile/context/useProfile";

interface ChurchInfoFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ChurchInfoForm({
  onNext,
  onBack,
}: ChurchInfoFormProps) {

  const { churchInfo, setProfile } = useProfile();


  const updateChurchInfo = (
    field: keyof typeof churchInfo,
    value: string
  ) => {

    setProfile((prev) => ({
      ...prev,

      churchInfo: {
        ...prev.churchInfo,

        [field]: value,
      },

    }));

  };


  return (

    <Card>

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-[#0B2D5C]">
          Step 2 • Church Information
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us about your church and spiritual background.
        </p>

      </div>


      <div className="grid gap-6 md:grid-cols-2">


        <FormField
          label="Church Name"
          required
        >

          <Input
            value={churchInfo.churchName}
            placeholder="Enter church name"
            onChange={(e) =>
              updateChurchInfo(
                "churchName",
                e.target.value
              )
            }
          />

        </FormField>



        <FormField
          label="Denomination"
          required
        >

          <Select
            value={churchInfo.denomination}
            onChange={(e) =>
              updateChurchInfo(
                "denomination",
                e.target.value
              )
            }
          >

            <option value="">
              Select denomination
            </option>

            <option value="CSI">
              CSI
            </option>

            <option value="Catholic">
              Catholic
            </option>

            <option value="Baptist">
              Baptist
            </option>

            <option value="Pentecostal">
              Pentecostal
            </option>

            <option value="Lutheran">
              Lutheran
            </option>

            <option value="Methodist">
              Methodist
            </option>

            <option value="Independent">
              Independent
            </option>

          </Select>

        </FormField>



        <FormField
          label="Pastor Name"
        >

          <Input
            value={churchInfo.pastorName}
            placeholder="Pastor name"
            onChange={(e) =>
              updateChurchInfo(
                "pastorName",
                e.target.value
              )
            }
          />

        </FormField>



        <FormField
          label="Baptized"
        >

          <Select

            value={
              churchInfo.baptized === true
                ? "true"
                : churchInfo.baptized === false
                ? "false"
                : churchInfo.baptized
            }

            onChange={(e) =>
              updateChurchInfo(
                "baptized",
                e.target.value
              )
            }

          >

            <option value="">
              Select
            </option>

            <option value="true">
              Yes
            </option>

            <option value="false">
              No
            </option>

          </Select>

        </FormField>



        <FormField
          label="Church Membership ID"
        >

          <Input
            value={churchInfo.membershipId}
            placeholder="Optional"
            onChange={(e) =>
              updateChurchInfo(
                "membershipId",
                e.target.value
              )
            }
          />

        </FormField>



        <FormField
          label="Church Address"
        >

          <Input
            value={churchInfo.churchAddress}
            placeholder="City / State"
            onChange={(e) =>
              updateChurchInfo(
                "churchAddress",
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