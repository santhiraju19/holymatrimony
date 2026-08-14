"use client";

import { Eye, Star, Trash2 } from "lucide-react";

interface PhotoCardProps {
  preview: string;
  isPrimary: boolean;
  onPrimary: () => void;
  onRemove: () => void;
  onPreview: () => void;
}

export default function PhotoCard({
  preview,
  isPrimary,
  onPrimary,
  onRemove,
  onPreview,
}: PhotoCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={preview}
          alt="Profile Photo"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            console.error("Failed to load profile photo:", preview);
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

        <button
          type="button"
          onClick={onPreview}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100"
          aria-label="Preview photo"
        >
          <Eye size={18} />
        </button>

        {isPrimary && (
          <div className="absolute left-3 top-3 rounded-full bg-[#0B2D5C] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            ★ Primary
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={onPrimary}
          disabled={isPrimary}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            isPrimary
              ? "cursor-not-allowed bg-slate-100 text-slate-500"
              : "bg-[#0B2D5C] text-white hover:bg-[#17407a]"
          }`}
        >
          <Star size={16} className="mr-1 inline" />
          {isPrimary ? "Primary" : "Make Primary"}
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
          aria-label="Delete photo"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}