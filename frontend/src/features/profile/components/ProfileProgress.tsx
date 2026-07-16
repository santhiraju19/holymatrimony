"use client";

interface ProfileProgressProps {
  percentage: number;
}

export default function ProfileProgress({
  percentage,
}: ProfileProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          Profile Completion
        </span>

        <span className="text-lg font-bold text-[#0B2D5C]">
          {percentage}%
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] to-[#2563EB] transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}