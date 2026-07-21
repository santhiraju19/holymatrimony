"use client";

import { CheckCircle2, Clock3 } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  verified: boolean;
}

export default function TrustItem({
  title,
  description,
  verified,
}: Props) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">

      <div>

        <h4 className="font-semibold text-[#0B2D5C]">
          {title}
        </h4>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}

      </div>

      {verified ? (
        <CheckCircle2
          size={24}
          className="text-emerald-600"
        />
      ) : (
        <Clock3
          size={24}
          className="text-amber-500"
        />
      )}

    </div>
  );
}