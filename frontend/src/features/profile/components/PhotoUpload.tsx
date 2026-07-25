"use client";

import { useMemo } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import {
  DropZone,
  PhotoGrid,
  UploadProgress,
  UploadGuidelines,
} from "./photos";

import { useProfile } from "@/features/profile/context/useProfile";
import { usePhotoManager } from "@/features/profile/hooks/usePhotoManager";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const MAX_PHOTOS = 6;

export default function PhotoUpload({
  onBack,
  onNext,
}: Props) {
  const { photoInfo } = useProfile();

  const {
    uploading,
    error,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
  } = usePhotoManager();

  const photos = photoInfo.photos;

  const progress = useMemo(
    () => (photos.length / MAX_PHOTOS) * 100,
    [photos]
  );

  const addPhotos = async (files: File[]) => {
    const available = MAX_PHOTOS - photos.length;

    if (available <= 0) return;

    for (const file of files.slice(0, available)) {
      await uploadPhoto(file);
    }
  };

  const removePhoto = async (id: string) => {
    await deletePhoto(Number(id));
  };

  const setPrimary = async (id: string) => {
    await setPrimaryPhoto(Number(id));
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

        {uploading && (
          <p className="mt-4 text-sm text-blue-600">
            Uploading photo...
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

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
          disabled={uploading}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}