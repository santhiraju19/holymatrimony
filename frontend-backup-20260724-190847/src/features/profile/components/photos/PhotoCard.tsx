"use client";

import Image from "next/image";
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
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={preview}
          alt="Profile Photo"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

        <button
          type="button"
          onClick={onPreview}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 transition group-hover:opacity-100"
        >
          <Eye size={18} />
        </button>

        {isPrimary && (
          <div className="absolute left-3 top-3 rounded-full bg-[#0B2D5C] px-3 py-1 text-xs font-semibold text-white">
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
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}