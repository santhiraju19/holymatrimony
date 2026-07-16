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
    <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-square w-full">
        <Image
          src={preview}
          alt="Profile Photo"
          fill
          className="object-cover"
        />
      </div>

      {isPrimary && (
        <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
          ★ Primary
        </div>
      )}

      <div className="flex items-center justify-between border-t p-3">
        <button
          type="button"
          onClick={onPrimary}
          disabled={isPrimary}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            isPrimary
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isPrimary ? "Primary Photo" : "Set as Primary"}
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          Remove
        </button>
      </div>
    </div>
  );
}