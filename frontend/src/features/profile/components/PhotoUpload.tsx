"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import {
  DropZone,
  PhotoGrid,
  UploadGuidelines,
  UploadProgress,
} from "./photos";

import {
  deletePhoto as deletePhotoRequest,
  getPhotos,
  ProfilePhotoResponse,
  resolvePhotoUrl,
  setPrimaryPhoto as setPrimaryPhotoRequest,
  uploadPhoto as uploadPhotoRequest,
} from "@/features/profile/services/photoService";

import { useProfile } from "@/features/profile/context/useProfile";
import { PhotoItem } from "@/features/profile/types";

interface PhotoUploadProps {
  onBack: () => void;
  onNext: () => void;
}

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function mapApiPhoto(
  photo: ProfilePhotoResponse,
): PhotoItem {
  return {
    id: photo.id,
    preview: resolvePhotoUrl(photo.imageUrl),
    isPrimary: photo.primaryPhoto,
    displayOrder: photo.displayOrder,
  };
}

function sortPhotos(
  photos: PhotoItem[],
): PhotoItem[] {
  return [...photos].sort(
    (first, second) =>
      (first.displayOrder ?? 0) -
      (second.displayOrder ?? 0),
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export default function PhotoUpload({
  onBack,
  onNext,
}: PhotoUploadProps) {
  const { photoInfo, setProfile } = useProfile();

  const photos = photoInfo.photos;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] =
    useState(false);

  const [uploadPercentage, setUploadPercentage] =
    useState(0);

  const [processingPhotoId, setProcessingPhotoId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const updatePhotos = useCallback(
    (nextPhotos: PhotoItem[]): void => {
      const sortedPhotos = sortPhotos(nextPhotos);

      const primaryPhoto =
        sortedPhotos.find(
          (photo) => photo.isPrimary,
        )?.id ?? "";

      setProfile((currentProfile) => ({
        ...currentProfile,
        photoInfo: {
          ...currentProfile.photoInfo,
          photos: sortedPhotos,
          primaryPhoto,
        },
      }));
    },
    [setProfile],
  );

  const loadPhotos =
    useCallback(async (): Promise<void> => {
      try {
        setError(null);

        const response = await getPhotos();

        updatePhotos(
          response.map(mapApiPhoto),
        );
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            "Unable to load your profile photos.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [updatePhotos]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const progress = useMemo(
    () =>
      Math.min(
        (photos.length / MAX_PHOTOS) * 100,
        100,
      ),
    [photos.length],
  );

  const validateFile = (
    file: File,
  ): string | null => {
    if (
      !ALLOWED_FILE_TYPES.includes(file.type)
    ) {
      return `${file.name}: only JPEG, PNG and WebP images are allowed.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: photo size must not exceed 10 MB.`;
    }

    return null;
  };

  const addPhotos = async (
    selectedFiles: File[],
  ): Promise<void> => {
    if (
      uploading ||
      selectedFiles.length === 0
    ) {
      return;
    }

    const availableSlots =
      MAX_PHOTOS - photos.length;

    if (availableSlots <= 0) {
      setError(
        `A maximum of ${MAX_PHOTOS} profile photos is allowed.`,
      );

      return;
    }

    const filesToUpload = selectedFiles.slice(
      0,
      availableSlots,
    );

    for (const file of filesToUpload) {
      const validationError =
        validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setUploading(true);
    setUploadPercentage(0);
    setError(null);

    try {
      const uploadedPhotos: PhotoItem[] = [];

      for (
        let index = 0;
        index < filesToUpload.length;
        index += 1
      ) {
        const file = filesToUpload[index];

        const uploadedPhoto =
          await uploadPhotoRequest(file, {
            onProgress: (fileProgress) => {
              const completedProgress =
                index * 100;

              const totalProgress =
                Math.round(
                  (
                    completedProgress +
                    fileProgress
                  ) / filesToUpload.length,
                );

              setUploadPercentage(
                totalProgress,
              );
            },
          });

        uploadedPhotos.push(
          mapApiPhoto(uploadedPhoto),
        );
      }

      updatePhotos([
        ...photos,
        ...uploadedPhotos,
      ]);

      setUploadPercentage(100);
    } catch (uploadError) {
      setError(
        getErrorMessage(
          uploadError,
          "Unable to upload the selected photo.",
        ),
      );

      await loadPhotos();
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (
    id: string,
  ): Promise<void> => {
    if (
      uploading ||
      processingPhotoId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?",
    );

    if (!confirmed) {
      return;
    }

    setProcessingPhotoId(id);
    setError(null);

    try {
      await deletePhotoRequest(id);

      const response = await getPhotos();

      updatePhotos(
        response.map(mapApiPhoto),
      );
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          "Unable to delete the photo.",
        ),
      );
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const setPrimary = async (
    id: string,
  ): Promise<void> => {
    if (
      uploading ||
      processingPhotoId !== null
    ) {
      return;
    }

    setProcessingPhotoId(id);
    setError(null);

    try {
      await setPrimaryPhotoRequest(id);

      updatePhotos(
        photos.map((photo) => ({
          ...photo,
          isPrimary: photo.id === id,
        })),
      );
    } catch (primaryError) {
      setError(
        getErrorMessage(
          primaryError,
          "Unable to set the primary photo.",
        ),
      );
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const handleContinue = (): void => {
    if (
      loading ||
      uploading ||
      processingPhotoId !== null
    ) {
      return;
    }

    onNext();
  };

  const busy =
    loading ||
    uploading ||
    processingPhotoId !== null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#0B2D5C]">
            Step 6 • Profile Photos
          </h2>

          <p className="mt-2 text-slate-500">
            Upload high-quality photos to increase
            your chances of finding the right life
            partner.
          </p>
        </div>

        <UploadProgress
          current={photos.length}
          total={MAX_PHOTOS}
          progress={progress}
        />

        {loading && (
          <p
            className="mt-4 text-sm text-blue-600"
            role="status"
          >
            Loading profile photos...
          </p>
        )}

        {uploading && (
          <div
            className="mt-4"
            role="status"
          >
            <div className="mb-2 flex justify-between text-sm text-blue-600">
              <span>Uploading photos...</span>

              <span>
                {uploadPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${uploadPercentage}%`,
                }}
              />
            </div>
          </div>
        )}

        {processingPhotoId && (
          <p
            className="mt-4 text-sm text-blue-600"
            role="status"
          >
            Updating photo...
          </p>
        )}

        {error && (
          <p
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading &&
          photos.length < MAX_PHOTOS && (
            <div className="mt-8">
              <DropZone
                onFilesSelected={(files) => {
                  void addPhotos(files);
                }}
              />
            </div>
          )}

        {photos.length >= MAX_PHOTOS && (
          <p className="mt-6 text-sm font-medium text-slate-600">
            You have uploaded the maximum of{" "}
            {MAX_PHOTOS} photos.
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <Card>
              <div className="py-16 text-center text-slate-500">
                Loading photos...
              </div>
            </Card>
          ) : photos.length > 0 ? (
            <PhotoGrid
              photos={photos}
              onPrimary={(id) => {
                void setPrimary(id);
              }}
              onRemove={(id) => {
                void removePhoto(id);
              }}
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
          disabled={busy}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={busy}
        >
          {uploading
            ? "Uploading..."
            : processingPhotoId
              ? "Updating..."
              : loading
                ? "Loading..."
                : "Continue"}
        </Button>
      </div>
    </div>
  );
}
