"use client";

import {
  Loader2,
  Star,
  StarOff,
} from "lucide-react";

interface Props {
  featured: boolean;
  disabled?: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export default function HomepageFeatureControl({
  featured,
  disabled = false,
  loading = false,
  onToggle,
}: Props) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span
        className={
          featured
            ? "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200"
            : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200"
        }
      >
        {featured ? (
          <Star
            size={14}
            className="fill-current"
          />
        ) : (
          <StarOff size={14} />
        )}

        {featured
          ? "Featured"
          : "Not Featured"}
      </span>

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled || loading}
        className={
          featured
            ? "inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            : "inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg border border-[#0B2D5C]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#0B2D5C] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading && (
          <Loader2
            size={13}
            className="animate-spin"
          />
        )}

        {loading
          ? "Updating..."
          : featured
            ? "Remove"
            : "Feature"}
      </button>

      {!featured && disabled && (
        <span className="max-w-[150px] text-[11px] leading-4 text-slate-400">
          Complete profile and primary photo required.
        </span>
      )}
    </div>
  );
}
