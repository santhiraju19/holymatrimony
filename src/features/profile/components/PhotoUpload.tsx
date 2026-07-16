"use client";

import { useMemo } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import DropZone from "./DropZone";
import PhotoGrid from "./PhotoGrid";
import UploadProgress from "./UploadProgress";
import UploadGuidelines from "./UploadGuidelines";

import { useProfile } from "@/features/profile/context/useProfile";
import { PhotoItem } from "../types";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const MAX_PHOTOS = 6;

export default function PhotoUpload({
  onBack,
  onNext,
}: Props) {
  const { photoInfo, setProfile } = useProfile();

  const photos = photoInfo.photos;

  const progress = useMemo(
    () => (photos.length / MAX_PHOTOS) * 100,
    [photos]
  );

  const addPhotos = (files: File[]) => {
    const available = MAX_PHOTOS - photos.length;

    if (available <= 0) return;

    const newPhotos: PhotoItem[] = files
      .slice(0, available)
      .map((file, index) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        isPrimary: photos.length === 0 && index === 0,
      }));

    setProfile((prev) => ({
      ...prev,
      photoInfo: {
        photos: [...prev.photoInfo.photos, ...newPhotos],
        primaryPhoto:
          prev.photoInfo.primaryPhoto ||
          newPhotos[0]?.id ||
          "",
      },
    }));
  };

  const removePhoto = (id: string) => {
    setProfile((prev) => {
      const updated = prev.photoInfo.photos.filter(
        (photo) => photo.id !== id
      );

      if (
        updated.length &&
        !updated.some((photo) => photo.isPrimary)
      ) {
        updated[0] = {
          ...updated[0],
          isPrimary: true,
        };
      }

      return {
        ...prev,
        photoInfo: {
          photos: updated,
          primaryPhoto:
            updated.find((photo) => photo.isPrimary)?.id ?? "",
        },
      };
    });
  };

  const setPrimary = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      photoInfo: {
        photos: prev.photoInfo.photos.map((photo) => ({
          ...photo,
          isPrimary: photo.id === id,
        })),
        primaryPhoto: id,
      },
    }));
  };

  return (
    <div className="space-y-6">

      <Card>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#0B2D5C]">
            Step 6 • Profile Photos
          </h2>

          <p className="mt-2 text-slate-500">
            Upload high-quality photos to increase your chances of finding the right life partner.
          </p>
        </div>

        <UploadProgress
          current={photos.length}
          total={MAX_PHOTOS}
          progress={progress}
        />

        {photos.length < MAX_PHOTOS && (
          <div className="mt-8">
            <DropZone onFilesSelected={addPhotos} />
          </div>
        )}

      </Card>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          {photos.length > 0 ? (
            <PhotoGrid
              photos={photos}
              onPrimary={setPrimary}
              onRemove={removePhoto}
            />
          ) : (
            <Card>
              <div className="py-16 text-center text-slate-500">
                No photos uploaded yet.
              </div>
            </Card>
          )}
        </div>

        <UploadGuidelines />

      </div>

      <div className="flex justify-between">

        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={onNext}
        >
          Continue
        </Button>

      </div>

    </div>
  );
}