"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Crown,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import Button from "@/components/ui/button";
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

import type {
  PhotoItem,
} from "@/features/profile/types";

interface PhotoUploadProps {
  onBack: () => void;
  onNext: () => void;
}

const MAX_PHOTOS = 6;

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

/*
 * The secured backend photo pipeline accepts JPEG and PNG.
 *
 * WebP is intentionally excluded so frontend validation
 * matches backend validation exactly.
 */
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
];

function mapApiPhoto(
  photo: ProfilePhotoResponse
): PhotoItem {
  return {
    id: photo.id,

    preview: resolvePhotoUrl(
      photo.imageUrl
    ),

    isPrimary:
      photo.primaryPhoto,

    displayOrder:
      photo.displayOrder,
  };
}

function sortPhotos(
  photos: PhotoItem[]
): PhotoItem[] {
  return [...photos].sort(
    (first, second) =>
      (first.displayOrder ?? 0) -
      (second.displayOrder ?? 0)
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string
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
  const {
    photoInfo,
    setProfile,
  } = useProfile();

  const photos =
    photoInfo.photos;

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    uploadPercentage,
    setUploadPercentage,
  ] = useState(0);

  const [
    processingPhotoId,
    setProcessingPhotoId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const primaryPhoto =
    photos.find(
      (photo) =>
        photo.isPrimary
    ) ?? null;

  const updatePhotos =
    useCallback(
      (
        nextPhotos: PhotoItem[]
      ): void => {
        const sortedPhotos =
          sortPhotos(
            nextPhotos
          );

        const primaryPhotoId =
          sortedPhotos.find(
            (photo) =>
              photo.isPrimary
          )?.id ?? "";

        setProfile(
          (
            currentProfile
          ) => ({
            ...currentProfile,

            photoInfo: {
              ...currentProfile.photoInfo,

              photos:
                sortedPhotos,

              primaryPhoto:
                primaryPhotoId,
            },
          })
        );
      },
      [setProfile]
    );

  const loadPhotos =
    useCallback(
      async (): Promise<void> => {
        try {
          setError(null);

          const response =
            await getPhotos();

          updatePhotos(
            response.map(
              mapApiPhoto
            )
          );
        } catch (
          loadError
        ) {
          setError(
            getErrorMessage(
              loadError,
              "Unable to load your profile photos."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [updatePhotos]
    );

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const progress =
    useMemo(
      () =>
        Math.min(
          (
            photos.length /
            MAX_PHOTOS
          ) *
            100,
          100
        ),
      [photos.length]
    );

  function validateFile(
    file: File
  ): string | null {
    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      return `${file.name}: only JPEG and PNG images are allowed.`;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return `${file.name}: photo size must not exceed 10 MB.`;
    }

    return null;
  }

  async function addPhotos(
    selectedFiles: File[]
  ): Promise<void> {
    if (
      uploading ||
      selectedFiles.length === 0
    ) {
      return;
    }

    const availableSlots =
      MAX_PHOTOS -
      photos.length;

    if (
      availableSlots <= 0
    ) {
      setError(
        `A maximum of ${MAX_PHOTOS} profile photos is allowed.`
      );

      return;
    }

    const filesToUpload =
      selectedFiles.slice(
        0,
        availableSlots
      );

    for (
      const file of filesToUpload
    ) {
      const fileError =
        validateFile(file);

      if (fileError) {
        setError(
          fileError
        );

        return;
      }
    }

    setUploading(true);
    setUploadPercentage(0);
    setError(null);

    try {
      const uploadedPhotos:
        PhotoItem[] = [];

      for (
        let index = 0;
        index <
        filesToUpload.length;
        index += 1
      ) {
        const file =
          filesToUpload[index];

        const uploadedPhoto =
          await uploadPhotoRequest(
            file,
            {
              onProgress: (
                fileProgress
              ) => {
                const completed =
                  index *
                  100;

                const totalProgress =
                  Math.round(
                    (
                      completed +
                      fileProgress
                    ) /
                      filesToUpload.length
                  );

                setUploadPercentage(
                  totalProgress
                );
              },
            }
          );

        uploadedPhotos.push(
          mapApiPhoto(
            uploadedPhoto
          )
        );
      }

      const combinedPhotos = [
        ...photos,
        ...uploadedPhotos,
      ];

      updatePhotos(
        combinedPhotos
      );

      setUploadPercentage(
        100
      );

      /*
       * Photos remain optional.
       *
       * If photos are uploaded and
       * no primary exists, make the
       * first photo primary.
       */
      const hasPrimary =
        combinedPhotos.some(
          (photo) =>
            photo.isPrimary
        );

      if (
        !hasPrimary &&
        combinedPhotos[0]
      ) {
        const firstPhoto =
          combinedPhotos[0];

        await setPrimaryPhotoRequest(
          firstPhoto.id
        );

        updatePhotos(
          combinedPhotos.map(
            (photo) => ({
              ...photo,

              isPrimary:
                photo.id ===
                firstPhoto.id,
            })
          )
        );
      }
    } catch (
      uploadError
    ) {
      setError(
        getErrorMessage(
          uploadError,
          "Unable to upload the selected photo."
        )
      );

      await loadPhotos();
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(
    id: string
  ): Promise<void> {
    if (
      uploading ||
      processingPhotoId !==
        null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this photo?"
      );

    if (!confirmed) {
      return;
    }

    setProcessingPhotoId(
      id
    );

    setError(null);

    try {
      await deletePhotoRequest(
        id
      );

      const response =
        await getPhotos();

      updatePhotos(
        response.map(
          mapApiPhoto
        )
      );
    } catch (
      deleteError
    ) {
      setError(
        getErrorMessage(
          deleteError,
          "Unable to delete the photo."
        )
      );
    } finally {
      setProcessingPhotoId(
        null
      );
    }
  }

  async function setPrimary(
    id: string
  ): Promise<void> {
    if (
      uploading ||
      processingPhotoId !==
        null
    ) {
      return;
    }

    setProcessingPhotoId(
      id
    );

    setError(null);

    try {
      await setPrimaryPhotoRequest(
        id
      );

      updatePhotos(
        photos.map(
          (photo) => ({
            ...photo,

            isPrimary:
              photo.id === id,
          })
        )
      );
    } catch (
      primaryError
    ) {
      setError(
        getErrorMessage(
          primaryError,
          "Unable to set the primary photo."
        )
      );
    } finally {
      setProcessingPhotoId(
        null
      );
    }
  }

  function handleContinue(): void {
    /*
     * Photos are OPTIONAL.
     *
     * Never use photo count to
     * block completion or
     * verification eligibility.
     */
    if (
      loading ||
      uploading ||
      processingPhotoId !==
        null
    ) {
      return;
    }

    onNext();
  }

  const busy =
    loading ||
    uploading ||
    processingPhotoId !==
      null;

  return (
    <div className="space-y-4">
      {/* =====================================================
          Main Card
          ===================================================== */}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50/75 via-white to-blue-50/60 px-4 py-3.5 sm:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-violet-700 text-white shadow-sm">
              <Camera
                size={17}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
                  Step 6 of 7
                </p>

                <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-blue-700">
                  Optional
                </span>
              </div>

              <h2 className="mt-0.5 text-base font-black tracking-[-0.02em] text-[#0B2D5C] sm:text-lg">
                Profile Photos
              </h2>

              <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs">
                Add clear and recent photos for better visibility, or skip this step and add them later.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <InfoTile
              icon={
                <ImagePlus
                  size={15}
                />
              }
              title="Optional"
              description="Photos do not count toward profile completion."
              variant="blue"
            />

            <InfoTile
              icon={
                <Crown
                  size={15}
                />
              }
              title="Better visibility"
              description="A clear primary photo helps your profile stand out."
              variant="gold"
            />

            <InfoTile
              icon={
                <ShieldCheck
                  size={15}
                />
              }
              title="Verification unaffected"
              description="Verification eligibility does not require photos."
              variant="green"
            />
          </div>

          <div className="mt-4">
            <UploadProgress
              current={
                photos.length
              }
              total={
                MAX_PHOTOS
              }
              progress={
                progress
              }
            />
          </div>

          {loading && (
            <StatusPanel
              tone="blue"
              icon={
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              }
            >
              Loading profile photos...
            </StatusPanel>
          )}

          {uploading && (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3">
              <div className="flex items-center justify-between gap-4 text-xs font-bold text-blue-700">
                <span className="flex items-center gap-2">
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                  Uploading photos...
                </span>

                <span>
                  {
                    uploadPercentage
                  }
                  %
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0B2D5C] to-blue-600 transition-all duration-300"
                  style={{
                    width: `${uploadPercentage}%`,
                  }}
                />
              </div>
            </div>
          )}

          {processingPhotoId && (
            <StatusPanel
              tone="violet"
              icon={
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              }
            >
              Updating photo...
            </StatusPanel>
          )}

          {error && (
            <StatusPanel
              tone="red"
              icon={
                <AlertCircle
                  size={15}
                />
              }
            >
              {error}
            </StatusPanel>
          )}

          {!loading &&
            photos.length <
              MAX_PHOTOS && (
              <div className="mt-4">
                <DropZone
                  onFilesSelected={(
                    files
                  ) => {
                    void addPhotos(
                      files
                    );
                  }}
                />
              </div>
            )}

          {photos.length >=
            MAX_PHOTOS && (
            <StatusPanel
              tone="green"
              icon={
                <CheckCircle2
                  size={15}
                />
              }
            >
              Maximum of{" "}
              {MAX_PHOTOS} photos
              uploaded.
            </StatusPanel>
          )}
        </div>
      </Card>

      {/* =====================================================
          Photos + Guidelines
          ===================================================== */}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/45 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-[#0B2D5C]">
                Your Photos
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Preview, delete or choose your primary photo.
              </p>
            </div>

            {primaryPhoto && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
                <Sparkles
                  size={10}
                />

                Primary selected
              </span>
            )}
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex min-h-[145px] flex-col items-center justify-center text-center">
                <Loader2
                  size={25}
                  className="animate-spin text-[#0B2D5C]"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Loading photos...
                </p>
              </div>
            ) : photos.length >
              0 ? (
              <PhotoGrid
                photos={
                  photos
                }
                onPrimary={(
                  id
                ) => {
                  void setPrimary(
                    id
                  );
                }}
                onRemove={(
                  id
                ) => {
                  void removePhoto(
                    id
                  );
                }}
              />
            ) : (
              <div className="flex min-h-[145px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                <Camera
                  size={30}
                  className="text-slate-300"
                />

                <h3 className="mt-2 text-sm font-black text-slate-700">
                  No photos uploaded
                </h3>

                <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500">
                  That&apos;s okay. Photos are optional and can be added later.
                </p>
              </div>
            )}
          </div>
        </Card>

        <UploadGuidelines />
      </div>

      {/* =====================================================
          Recommendation
          ===================================================== */}

      <Card className="border-amber-100 bg-gradient-to-r from-amber-50/80 via-white to-blue-50/60 p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <TrendingUp
              size={15}
            />
          </div>

          <div>
            <h3 className="text-xs font-black text-[#0B2D5C] sm:text-sm">
              Photos are recommended, not required
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-[11px]">
              Clear profile photos can improve visibility and match interest, while profile completion and verification remain independent of photo count.
            </p>
          </div>
        </div>
      </Card>

      {/* =====================================================
          Navigation
          ===================================================== */}

      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            className="sm:w-auto"
            onClick={
              onBack
            }
            disabled={
              busy
            }
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            className="sm:min-w-[150px] sm:w-auto"
            onClick={
              handleContinue
            }
            disabled={
              busy
            }
          >
            {uploading
              ? "Uploading..."
              : processingPhotoId
                ? "Updating..."
                : loading
                  ? "Loading..."
                  : photos.length ===
                      0
                    ? "Skip & Continue"
                    : "Save & Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

type InfoTileVariant =
  | "blue"
  | "gold"
  | "green";

function InfoTile({
  icon,
  title,
  description,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: InfoTileVariant;
}) {
  const styles: Record<
    InfoTileVariant,
    string
  > = {
    blue:
      "border-blue-100 bg-blue-50/60 text-blue-700",

    gold:
      "border-amber-100 bg-amber-50/60 text-amber-700",

    green:
      "border-emerald-100 bg-emerald-50/60 text-emerald-700",
  };

  return (
    <div
      className={[
        "rounded-xl border p-3",
        styles[variant],
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {icon}

        <p className="text-[11px] font-black">
          {title}
        </p>
      </div>

      <p className="mt-1.5 text-[10px] leading-4 opacity-80">
        {description}
      </p>
    </div>
  );
}

type StatusTone =
  | "blue"
  | "violet"
  | "green"
  | "red";

function StatusPanel({
  tone,
  icon,
  children,
}: {
  tone: StatusTone;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const styles: Record<
    StatusTone,
    string
  > = {
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",

    violet:
      "border-violet-100 bg-violet-50 text-violet-700",

    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    red:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div
      className={[
        "mt-3 flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold",
        styles[tone],
      ].join(" ")}
    >
      <span className="shrink-0">
        {icon}
      </span>

      {children}
    </div>
  );
}