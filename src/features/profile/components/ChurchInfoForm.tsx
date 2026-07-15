"use client";

interface ChurchInfoFormProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ChurchInfoForm({
  onNext,
  onBack,
}: ChurchInfoFormProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold text-[#0B2D5C]">
        Step 2 • Church Information
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block font-medium">
            Church Name
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-3"
            placeholder="Enter church name"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Denomination
          </label>

          <select className="w-full rounded-xl border border-slate-300 p-3">
            <option>Select denomination</option>
            <option>CSI</option>
            <option>Catholic</option>
            <option>Baptist</option>
            <option>Pentecostal</option>
            <option>Lutheran</option>
            <option>Methodist</option>
            <option>Independent</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Pastor Name
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-3"
            placeholder="Pastor name"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Baptized
          </label>

          <select className="w-full rounded-xl border border-slate-300 p-3">
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Church Membership ID
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-3"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Church Address
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-3"
            placeholder="City / State"
          />
        </div>

      </div>

      <div className="mt-10 flex justify-between">

        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-slate-300 px-8 py-3 text-white"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-[#0B2D5C] px-8 py-3 font-semibold text-white hover:bg-[#123C73]"
        >
          Continue
        </button>

      </div>

    </div>
  );
}