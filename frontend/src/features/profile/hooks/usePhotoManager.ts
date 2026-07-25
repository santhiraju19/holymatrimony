"use client";

import { useCallback, useState } from "react";

import profileService from "../services/profile.service";
import { useProfile } from "../context/useProfile";

export function usePhotoManager() {
  const { refreshProfile } = useProfile();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setError(null);

        await profileService.uploadPhoto(file);

        await refreshProfile();
      } catch (err) {
        console.error(err);
        setError("Unable to upload photo.");
      } finally {
        setUploading(false);
      }
    },
    [refreshProfile]
  );

  const deletePhoto = useCallback(
    async (id: number) => {
      try {
        setError(null);

        await profileService.deletePhoto(id);

        await refreshProfile();
      } catch (err) {
        console.error(err);
        setError("Unable to delete photo.");
      }
    },
    [refreshProfile]
  );

  const setPrimaryPhoto = useCallback(
    async (id: number) => {
      try {
        setError(null);

        await profileService.setPrimaryPhoto(id);

        await refreshProfile();
      } catch (err) {
        console.error(err);
        setError("Unable to update primary photo.");
      }
    },
    [refreshProfile]
  );

  const reorderPhotos = useCallback(
    async (photoIds: number[]) => {
      try {
        setError(null);

        await profileService.reorderPhotos(photoIds);

        await refreshProfile();
      } catch (err) {
        console.error(err);
        setError("Unable to reorder photos.");
      }
    },
    [refreshProfile]
  );

  return {
    uploading,
    error,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
    reorderPhotos,
  };
}