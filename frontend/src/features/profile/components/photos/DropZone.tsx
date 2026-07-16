"use client";

import { useState } from "react";
import { UploadCloud, ImagePlus } from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function DropZone({
  onFilesSelected,
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (validFiles.length === 0) return;

    onFilesSelected(validFiles);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        processFiles(e.dataTransfer.files);
      }}
      className={`flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
        dragging
          ? "border-[#0B2D5C] bg-blue-50"
          : "border-slate-300 bg-slate-50 hover:border-[#0B2D5C] hover:bg-slate-100"
      }`}
    >
      <UploadCloud
        size={54}
        className="mb-4 text-[#0B2D5C]"
      />

      <h3 className="text-xl font-bold text-[#0B2D5C]">
        Drag & Drop Photos
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        or click to browse from your computer
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium shadow">
        <ImagePlus size={18} />
        Choose Photos
      </div>

      <p className="mt-5 text-xs text-slate-400">
        JPG • PNG • WEBP • Maximum 6 Photos
      </p>

      <input
        hidden
        multiple
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => processFiles(e.target.files)}
      />
    </label>
  );
}