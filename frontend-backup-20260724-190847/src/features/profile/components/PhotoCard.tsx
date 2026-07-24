"use client";

import Image from "next/image";

interface PhotoCardProps {
  preview: string;
  isPrimary: boolean;
  onPrimary: () => void;
  onRemove: () => void;
}

export default function PhotoCard({
  preview,
  isPrimary,
  onPrimary,
  onRemove,
}: PhotoCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={preview}
          alt="Profile Photo"
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        {isPrimary && (
          <div className="absolute left-3 top-3 rounded-full bg-[#0B2D5C] px-3 py-1 text-xs font-semibold text-white shadow-lg">
            ⭐ Primary
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <button
          type="button"
          onClick={onPrimary}
          disabled={isPrimary}
          className={`w-full rounded-xl py-2 text-sm font-semibold transition ${
            isPrimary
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-[#0B2D5C] text-white hover:bg-[#123f80]"
          }`}
        >
          {isPrimary ? "Primary Photo" : "Make Primary"}
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Delete Photo
        </button>
      </div>
    </div>
  );
}