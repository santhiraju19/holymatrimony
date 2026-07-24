"use client";

interface Props {
  score: number;
  level: string;
}

export default function TrustScore({
  score,
  level,
}: Props) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#0B2D5C] to-[#174A88] p-8 text-white shadow-lg">

      <div className="text-sm uppercase tracking-[0.25em] text-slate-200">
        Trust Score
      </div>

      <div className="mt-3 flex items-end gap-3">

        <span className="text-6xl font-bold">
          {score}
        </span>

        <span className="mb-2 text-2xl">
          %
        </span>

      </div>

      <div className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
        {level}
      </div>

    </div>
  );
}