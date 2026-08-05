"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import {
  ImagePlus,
  UploadCloud,
} from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (
    files: File[]
  ) => void;
}

export default function DropZone({
  onFilesSelected,
}: DropZoneProps) {
  const [
    dragging,
    setDragging,
  ] = useState(false);

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  function processFiles(
    files: FileList | null
  ): void {
    if (!files) {
      return;
    }

    const validFiles =
      Array.from(files).filter(
        (file) =>
          [
            "image/jpeg",
            "image/png",
            "image/webp",
          ].includes(file.type)
      );

    if (
      validFiles.length === 0
    ) {
      return;
    }

    onFilesSelected(validFiles);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ): void {
    event.preventDefault();
    setDragging(false);

    processFiles(
      event.dataTransfer.files
    );
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    processFiles(
      event.target.files
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload profile photos"
      onClick={() =>
        inputRef.current?.click()
      }
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() =>
        setDragging(false)
      }
      onDrop={handleDrop}
      className={[
        "group flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-10 text-center outline-none transition-all duration-300",
        "focus:ring-4 focus:ring-blue-100",
        dragging
          ? "scale-[1.01] border-[#0B2D5C] bg-blue-50 shadow-lg"
          : "border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-[#0B2D5C] hover:bg-blue-50/50 hover:shadow-lg",
      ].join(" ")}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0B2D5C] text-white shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
        <UploadCloud size={31} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#0B2D5C] sm:text-2xl">
        Drag and drop photos
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Drop your photos here or click
        to browse from your device.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2D5C] shadow-md ring-1 ring-slate-200 transition group-hover:shadow-lg">
        <ImagePlus size={18} />

        Choose Photos
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">
        JPEG, PNG or WebP • Maximum
        10 MB each • Up to 6 photos
      </p>

      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
}