"use client";

import { InputHTMLAttributes } from "react";

interface Props
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Checkbox({
  label,
  ...props
}: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-3">

      <input
        type="checkbox"
        {...props}
        className="h-5 w-5 rounded border-slate-300 text-[#0B2D5C] focus:ring-[#D4AF37]"
      />

      <span className="text-sm text-slate-700">
        {label}
      </span>

    </label>
  );
}