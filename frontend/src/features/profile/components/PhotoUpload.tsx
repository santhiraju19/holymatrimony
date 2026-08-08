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
  photo: ProfilePhotoResponse
): PhotoItem {
  return {
    id: photo.id,
    preview: resolvePhotoUrl(photo.imageUrl),
    isPrimary: photo.primaryPhoto,
    displayOrder: photo.displayOrder,
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

  const photos = photoInfo.photos;

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
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const primaryPhoto =
    photos.find(
      (photo) => photo.isPrimary
    ) ?? null;

  const updatePhotos = useCallback(
    (
      nextPhotos: PhotoItem[]
    ): void => {
      const sortedPhotos =
        sortPhotos(nextPhotos);

      const primaryPhotoId =
        sortedPhotos.find(
          (photo) =>
            photo.isPrimary
        )?.id ?? "";

      setProfile(
        (currentProfile) => ({
          ...currentProfile,

          photoInfo: {
            ...currentProfile.photoInfo,
            photos: sortedPhotos,
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
            response.map(mapApiPhoto)
          );
        } catch (loadError) {
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

  const progress = useMemo(
    () =>
      Math.min(
        (photos.length /
          MAX_PHOTOS) *
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
      return `${file.name}: only JPEG, PNG and WebP images are allowed.`;
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
        setError(fileError);
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
                  index * 100;

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

      setUploadPercentage(100);

      /*
       * Photos are optional.
       *
       * If a user chooses to upload photos,
       * automatically make the first photo
       * primary when no primary photo exists.
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
    } catch (uploadError) {
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
      processingPhotoId !== null
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

    setProcessingPhotoId(id);
    setError(null);

    try {
      await deletePhotoRequest(id);

      const response =
        await getPhotos();

      updatePhotos(
        response.map(mapApiPhoto)
      );
    } catch (deleteError) {
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
      processingPhotoId !== null
    ) {
      return;
    }

    setProcessingPhotoId(id);
    setError(null);

    try {
      await setPrimaryPhotoRequest(
        id
      );

      updatePhotos(
        photos.map((photo) => ({
          ...photo,
          isPrimary:
            photo.id === id,
        }))
      );
    } catch (primaryError) {
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

  /*
   * FINAL RULE:
   *
   * Photos are OPTIONAL.
   *
   * A user can continue to Review without
   * uploading any photos.
   *
   * Photo count must never be used here
   * to block profile completion or
   * verification eligibility.
   */
  function handleContinue(): void {
    if (
      loading ||
      uploading ||
      processingPhotoId !== null
    ) {
      return;
    }

    onNext();
  }

  const busy =
    loading ||
    uploading ||
    processingPhotoId !== null;

  return (
    <div className="space-y-6">
      {/* =====================================================
          Header
          ===================================================== */}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-lg sm:h-14 sm:w-14">
              <Camera size={27} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B38B19]">
                  Step 6 of 7
                </p>

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Optional
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2D5C] sm:text-3xl">
                Profile Photos
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Photos are optional and do not
                affect your profile completion
                or eligibility for profile
                verification. You can upload
                them now or add them later.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-7 lg:p-10">
          {/* =================================================
              Main recommendation
              ================================================= */}

          <div className="mb-7 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-blue-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <TrendingUp size={22} />
              </div>

              <div>
                <h3 className="font-bold text-[#0B2D5C]">
                  Add photos for better profile
                  visibility
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  While photos are not required,
                  adding clear and recent photos
                  can help your profile attract
                  more attention and relevant
                  match interest. A complete
                  profile with good photos also
                  helps other members get to
                  know you better.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              Information cards
              ================================================= */}

          <div className="mb-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <ImagePlus
                size={22}
                className="text-blue-700"
              />

              <p className="mt-3 text-sm font-bold text-blue-950">
                Completely optional
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Skip this step if you prefer.
                Photos are not counted toward
                your profile completion
                percentage.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <Crown
                size={22}
                className="text-amber-700"
              />

              <p className="mt-3 text-sm font-bold text-amber-950">
                Better visibility
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Adding a clear primary photo can
                make your profile more
                noticeable to potential matches.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <ShieldCheck
                size={22}
                className="text-emerald-700"
              />

              <p className="mt-3 text-sm font-bold text-emerald-950">
                Verification unaffected
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                You can complete your profile
                and become eligible for
                verification without uploading
                photos.
              </p>
            </div>
          </div>

          <UploadProgress
            current={photos.length}
            total={MAX_PHOTOS}
            progress={progress}
          />

          {/* =================================================
              No-photo recommendation
              ================================================= */}

          {photos.length === 0 &&
            !loading && (
              <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={20}
                    className="mt-0.5 shrink-0 text-violet-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-violet-900">
                      You can skip photos for now
                    </p>

                    <p className="mt-1 text-sm leading-6 text-violet-700">
                      Your profile can still
                      reach 100% completion and
                      become eligible for
                      verification. We recommend
                      adding photos later for
                      better visibility and
                      stronger match interest.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* =================================================
              Status
              ================================================= */}

          {loading && (
            <div
              role="status"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"
            >
              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading profile photos...
            </div>
          )}

          {uploading && (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-4 text-sm font-medium text-blue-700">
                <span className="flex items-center gap-2">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Uploading photos...
                </span>

                <span>
                  {uploadPercentage}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
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
            <div
              role="status"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700"
            >
              <Loader2
                size={18}
                className="animate-spin"
              />

              Updating photo...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              Upload area
              ================================================= */}

          {!loading &&
            photos.length <
              MAX_PHOTOS && (
              <div className="mt-8">
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
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2
                size={19}
                className="shrink-0"
              />

              You have uploaded the
              maximum of {MAX_PHOTOS}{" "}
              photos.
            </div>
          )}
        </div>
      </Card>

      {/* =====================================================
          Photo grid / guidelines
          ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {loading ? (
            <Card className="p-6">
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <Loader2
                  size={32}
                  className="animate-spin text-[#0B2D5C]"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Loading photos...
                </p>
              </div>
            </Card>
          ) : photos.length > 0 ? (
            <Card className="p-4 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2D5C]">
                    Your Photos
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Preview, delete or select
                    your primary photo.
                  </p>
                </div>

                {primaryPhoto && (
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                    <Sparkles
                      size={14}
                    />

                    Primary selected
                  </div>
                )}
              </div>

              <PhotoGrid
                photos={photos}
                onPrimary={(id) => {
                  void setPrimary(id);
                }}
                onRemove={(id) => {
                  void removePhoto(id);
                }}
              />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <Camera
                  size={42}
                  className="text-slate-300"
                />

                <h3 className="mt-4 text-lg font-bold text-slate-700">
                  No photos uploaded
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  That's okay. Photos are
                  optional and do not prevent
                  profile completion or
                  verification. You can add
                  photos later to improve your
                  profile visibility.
                </p>
              </div>
            </Card>
          )}
        </div>

        <UploadGuidelines />
      </div>

      {/* =====================================================
          Final reminder
          ===================================================== */}

      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 via-white to-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h3 className="font-bold text-[#0B2D5C]">
              Photos do not affect verification
              eligibility
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Complete all required information
              in your profile to reach 100% and
              become eligible for profile
              verification. Photos are optional,
              but adding clear photos is strongly
              recommended for better visibility
              and match interest.
            </p>
          </div>
        </div>
      </Card>

      {/* =====================================================
          Navigation
          ===================================================== */}

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="sm:w-auto"
            onClick={onBack}
            disabled={busy}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            fullWidth
            className="sm:w-auto"
            onClick={
              handleContinue
            }
            disabled={busy}
          >
            {uploading
              ? "Uploading..."
              : processingPhotoId
                ? "Updating..."
                : loading
                  ? "Loading..."
                  : photos.length === 0
                    ? "Skip & Continue"
                    : "Save & Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}