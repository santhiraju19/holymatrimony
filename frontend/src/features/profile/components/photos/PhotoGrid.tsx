"use client";

import { useState } from "react";

import PhotoCard from "./PhotoCard";
import PhotoPreview from "./PhotoPreview";

import { PhotoItem } from "@/features/profile/types";

interface PhotoGridProps {
  photos: PhotoItem[];
  onPrimary: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function PhotoGrid({
  photos,
  onPrimary,
  onRemove,
}: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const previews = photos.map((photo) => photo.preview);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            preview={photo.preview}
            isPrimary={photo.isPrimary}
            onPrimary={() => onPrimary(photo.id)}
            onRemove={() => onRemove(photo.id)}
            onPreview={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {selectedIndex !== null && (
        <PhotoPreview
          open
          images={previews}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrevious={() =>
            setSelectedIndex((prev) => {
              if (prev === null) return 0;
              return prev === 0 ? previews.length - 1 : prev - 1;
            })
          }
          onNext={() =>
            setSelectedIndex((prev) => {
              if (prev === null) return 0;
              return prev === previews.length - 1 ? 0 : prev + 1;
            })
          }
        />
      )}
    </>
  );
}