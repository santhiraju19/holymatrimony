"use client";

import { useCallback, useState } from "react";

import {
  deletePhoto as deletePhotoRequest,
  reorderPhotos as reorderPhotosRequest,
  setPrimaryPhoto as setPrimaryPhotoRequest,
  uploadPhoto as uploadPhotoRequest,
} from "../services/photoService";

import { useProfile } from "../context/useProfile";

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallbackMessage;
}

export function usePhotoManager() {
  const { refreshProfile } = useProfile();

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const uploadPhoto = useCallback(
    async (file: File): Promise<void> => {
      try {
        setUploading(true);
        setUploadProgress(0);
        setError(null);

        await uploadPhotoRequest(file, {
          onProgress: (percentage) => {
            setUploadProgress(percentage);
          },
        });

        await refreshProfile();

        setUploadProgress(100);
      } catch (error: unknown) {
        console.error(
          "Unable to upload photo:",
          error,
        );

        setError(
          getErrorMessage(
            error,
            "Unable to upload photo.",
          ),
        );

        throw error;
      } finally {
        setUploading(false);
      }
    },
    [refreshProfile],
  );

  const deletePhoto = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        await deletePhotoRequest(id);

        await refreshProfile();
      } catch (error: unknown) {
        console.error(
          "Unable to delete photo:",
          error,
        );

        setError(
          getErrorMessage(
            error,
            "Unable to delete photo.",
          ),
        );

        throw error;
      }
    },
    [refreshProfile],
  );

  const setPrimaryPhoto = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        await setPrimaryPhotoRequest(id);

        await refreshProfile();
      } catch (error: unknown) {
        console.error(
          "Unable to update primary photo:",
          error,
        );

        setError(
          getErrorMessage(
            error,
            "Unable to update primary photo.",
          ),
        );

        throw error;
      }
    },
    [refreshProfile],
  );

  const reorderPhotos = useCallback(
    async (
      photoIds: string[],
    ): Promise<void> => {
      try {
        setError(null);

        await reorderPhotosRequest(photoIds);

        await refreshProfile();
      } catch (error: unknown) {
        console.error(
          "Unable to reorder photos:",
          error,
        );

        setError(
          getErrorMessage(
            error,
            "Unable to reorder photos.",
          ),
        );

        throw error;
      }
    },
    [refreshProfile],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
    reorderPhotos,
    clearError,
  };
}