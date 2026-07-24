"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface PhotoPreviewProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PhotoPreview({
  images,
  currentIndex,
  open,
  onClose,
  onPrevious,
  onNext,
}: PhotoPreviewProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onPrevious, onNext]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center">

      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white p-2 shadow hover:scale-110 transition"
      >
        <X size={22} />
      </button>

      {images.length > 1 && (
        <button
          onClick={onPrevious}
          className="absolute left-6 rounded-full bg-white p-3 shadow hover:scale-110 transition"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div className="relative h-[80vh] w-[90vw] max-w-5xl">

        <Image
          src={images[currentIndex]}
          alt="Preview"
          fill
          priority
          className="object-contain"
        />

      </div>

      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-6 rounded-full bg-white p-3 shadow hover:scale-110 transition"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div className="absolute bottom-8 rounded-full bg-white/90 px-5 py-2 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}