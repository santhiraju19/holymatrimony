"use client";

interface BasicInfoFormProps {
  onNext: () => void;
}

export default function BasicInfoForm({
  onNext,
}: BasicInfoFormProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-[#0B2D5C]">
        Step 1 • Basic Information
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">
            Full Name
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-3"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Mobile Number
          </label>

          <input
            className="w-full rounded-xl border border-slate-300 p-3"
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Date of Birth
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-slate-300 p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Gender
          </label>

          <select className="w-full rounded-xl border border-slate-300 p-3">
            <option>Select Gender</option>
            <option>Bride</option>
            <option>Groom</option>
          </select>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          disabled
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