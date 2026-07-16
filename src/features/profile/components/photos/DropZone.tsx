"use client";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function DropZone({
  onFilesSelected,
}: DropZoneProps) {
  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    onFilesSelected(Array.from(files));
  };

  return (
    <label className="flex h-48 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#0B2D5C] hover:bg-slate-100">
      <div className="text-center">
        <p className="text-lg font-semibold text-[#0B2D5C]">
          Upload Profile Photos
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Drag & Drop or Click to Browse
        </p>

        <p className="mt-1 text-xs text-slate-400">
          JPG • PNG • WEBP (Maximum 6)
        </p>
      </div>

      <input
        hidden
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}