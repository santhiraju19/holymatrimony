"use client";

interface UploadProgressProps {
  current: number;
  total: number;
  progress: number;
}

export default function UploadProgress({
  current,
  total,
  progress,
}: UploadProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-slate-600">
        <span>
          {current} of {total} uploaded
        </span>

        <span>{Math.round(progress)}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#0B2D5C] transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}