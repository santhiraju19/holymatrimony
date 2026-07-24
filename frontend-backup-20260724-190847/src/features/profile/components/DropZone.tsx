"use client";

import { useRef } from "react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

const MAX_FILES = 6;

export default function DropZone({
  onFilesSelected,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) return;

    onFilesSelected(validFiles.slice(0, MAX_FILES));
  };

  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          processFiles(e.dataTransfer.files);
        }}
        className="
          border-2 border-dashed
          rounded-xl
          p-10
          text-center
          cursor-pointer
          hover:border-blue-500
          transition
          bg-gray-50
        "
      >
        <div className="text-5xl mb-3">
            📸
        </div>

        <h3 className="font-semibold text-lg">
            Upload Profile Photos
        </h3>

        <p className="text-sm text-gray-500 mt-2">
            Drag & Drop your photos here
        </p>

        <p className="text-sm text-gray-500">
            or click to browse
        </p>

        <p className="text-xs text-gray-400 mt-4">
            JPG • PNG • WEBP
        </p>

        <p className="text-xs text-gray-400">
            Maximum 6 Photos
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => processFiles(e.target.files)}
      />
    </>
  );
}