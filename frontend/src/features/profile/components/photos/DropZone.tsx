"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import {
  ImagePlus,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (
    files: File[]
  ) => void;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
];

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
          ACCEPTED_TYPES.includes(
            file.type
          )
      );

    if (
      validFiles.length === 0
    ) {
      return;
    }

    onFilesSelected(
      validFiles
    );

    if (inputRef.current) {
      inputRef.current.value =
        "";
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
      onDrop={
        handleDrop
      }
      className={[
        "group flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center outline-none transition-all duration-300 sm:min-h-52 sm:px-5 sm:py-7",
        "focus:ring-4 focus:ring-blue-100",

        dragging
          ? "scale-[1.01] border-[#0B2D5C] bg-blue-50 shadow-lg"
          : "border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-[#0B2D5C] hover:bg-blue-50/50 hover:shadow-lg",
      ].join(" ")}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-md transition-transform duration-300 group-hover:-translate-y-1">
        <UploadCloud
          size={31}
        />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#0B2D5C] sm:text-xl">
        Drag and drop photos
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Drop your photos here or click
        to browse from your device.
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0B2D5C] shadow-sm ring-1 ring-slate-200 transition group-hover:shadow-md">
        <ImagePlus
          size={18}
        />

        Choose Photos
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span>
          JPEG or PNG
        </span>

        <span
          aria-hidden="true"
        >
          •
        </span>

        <span>
          Maximum 10 MB each
        </span>

        <span
          aria-hidden="true"
        >
          •
        </span>

        <span>
          Up to 6 photos
        </span>
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
        <ShieldCheck
          size={12}
        />

        Photos are protected with Holy Matrimony watermark
      </div>

      <input
        ref={
          inputRef
        }
        hidden
        multiple
        type="file"
        accept="image/jpeg,image/png"
        onChange={
          handleFileChange
        }
      />
    </div>
  );
}