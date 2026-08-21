"use client";

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  BrowseProfilePhoto,
} from "../../types";

import {
  resolveBrowsePhotoUrl,
} from "../../utils/photoUrl";

interface ProfilePhotoGalleryProps {
  photos: BrowseProfilePhoto[];
  primaryPhotoUrl?: string | null;
  displayName: string;
}

export default function ProfilePhotoGallery({
  photos,
  primaryPhotoUrl,
  displayName,
}: ProfilePhotoGalleryProps) {
  const normalizedPhotos =
    useMemo(() => {
      const resolved =
        photos
          .map((photo) => ({
            ...photo,

            resolvedUrl:
              resolveBrowsePhotoUrl(
                photo.imageUrl
              ),
          }))
          .filter(
            (
              photo
            ): photo is BrowseProfilePhoto & {
              resolvedUrl: string;
            } =>
              Boolean(
                photo.resolvedUrl
              )
          )
          .sort((a, b) => {
            if (
              a.primaryPhoto !==
              b.primaryPhoto
            ) {
              return a.primaryPhoto
                ? -1
                : 1;
            }

            return (
              (a.displayOrder ?? 0) -
              (b.displayOrder ?? 0)
            );
          });

      if (
        resolved.length >
        0
      ) {
        return resolved;
      }

      const fallback =
        resolveBrowsePhotoUrl(
          primaryPhotoUrl
        );

      if (!fallback) {
        return [];
      }

      return [
        {
          id: "primary",

          imageUrl:
            primaryPhotoUrl ?? "",

          primaryPhoto: true,

          displayOrder: 0,

          resolvedUrl:
            fallback,
        },
      ];
    }, [
      photos,
      primaryPhotoUrl,
    ]);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const [
    lightboxOpen,
    setLightboxOpen,
  ] = useState(false);

  useEffect(() => {
    if (
      activeIndex >=
      normalizedPhotos.length
    ) {
      setActiveIndex(0);
    }
  }, [
    activeIndex,
    normalizedPhotos.length,
  ]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setLightboxOpen(
          false
        );
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        previous();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        next();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    lightboxOpen,
    normalizedPhotos.length,
  ]);

  function previous() {
    if (
      normalizedPhotos.length <=
      1
    ) {
      return;
    }

    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          normalizedPhotos.length
        ) %
        normalizedPhotos.length
    );
  }

  function next() {
    if (
      normalizedPhotos.length <=
      1
    ) {
      return;
    }

    setActiveIndex(
      (current) =>
        (
          current +
          1
        ) %
        normalizedPhotos.length
    );
  }

  function preventImageAction(
    event:
      | React.MouseEvent
      | React.DragEvent
  ) {
    event.preventDefault();
  }

  if (
    normalizedPhotos.length ===
    0
  ) {
    return (
      <div className="flex h-full min-h-[310px] items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white bg-white/90 text-2xl font-black text-blue-700 shadow-xl">
          {displayName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
              part
                .charAt(0)
                .toUpperCase()
            )
            .join("")}
        </div>
      </div>
    );
  }

  const activePhoto =
    normalizedPhotos[
      activeIndex
    ];

  return (
    <>
      {/* =====================================================
          Main profile photo
          ===================================================== */}

      <div
        className="relative h-full min-h-[310px] overflow-hidden bg-slate-100"
        onContextMenu={
          preventImageAction
        }
      >
        <img
          src={
            activePhoto.resolvedUrl
          }
          alt={`${displayName} profile photo ${activeIndex + 1}`}
          draggable={false}
          onDragStart={
            preventImageAction
          }
          onContextMenu={
            preventImageAction
          }
          className="absolute inset-0 h-full w-full select-none object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        {normalizedPhotos.length >
          1 && (
          <>
            <button
              type="button"
              onClick={
                previous
              }
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
            >
              <ChevronLeft
                size={21}
              />
            </button>

            <button
              type="button"
              onClick={
                next
              }
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
            >
              <ChevronRight
                size={21}
              />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() =>
            setLightboxOpen(
              true
            )
          }
          aria-label="View photo full screen"
          className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
        >
          <Expand
            size={16}
          />
        </button>

        {normalizedPhotos.length >
          1 && (
          <div className="absolute bottom-4 left-4 z-20 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur">
            {activeIndex +
              1}{" "}
            /{" "}
            {
              normalizedPhotos.length
            }
          </div>
        )}
      </div>

      {/* =====================================================
          Thumbnail gallery
          ===================================================== */}

      {normalizedPhotos.length >
        1 && (
        <div
          className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white p-2"
          onContextMenu={
            preventImageAction
          }
        >
          {normalizedPhotos.map(
            (
              photo,
              index
            ) => (
              <button
                key={
                  photo.id
                }
                type="button"
                onClick={() =>
                  setActiveIndex(
                    index
                  )
                }
                className={[
                  "relative h-14 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-14",

                  index ===
                  activeIndex
                    ? "border-[#D4AF37] shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100",
                ].join(" ")}
              >
                <img
                  src={
                    photo.resolvedUrl
                  }
                  alt=""
                  draggable={
                    false
                  }
                  onDragStart={
                    preventImageAction
                  }
                  onContextMenu={
                    preventImageAction
                  }
                  className="h-full w-full select-none object-cover"
                />

                {photo.primaryPhoto && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#0B2D5C]/85 py-0.5 text-[7px] font-black uppercase tracking-wide text-white">
                    Primary
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}

      {/* =====================================================
          Protected lightbox
          ===================================================== */}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 p-4"
          onContextMenu={
            preventImageAction
          }
        >
          <button
            type="button"
            onClick={() =>
              setLightboxOpen(
                false
              )
            }
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {normalizedPhotos.length >
            1 && (
            <>
              <button
                type="button"
                onClick={
                  previous
                }
                aria-label="Previous photo"
                className="absolute left-3 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft
                  size={27}
                />
              </button>

              <button
                type="button"
                onClick={
                  next
                }
                aria-label="Next photo"
                className="absolute right-3 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight
                  size={27}
                />
              </button>
            </>
          )}

          <img
            src={
              activePhoto.resolvedUrl
            }
            alt={`${displayName} profile photo ${activeIndex + 1}`}
            draggable={false}
            onDragStart={
              preventImageAction
            }
            onContextMenu={
              preventImageAction
            }
            className="max-h-[90vh] max-w-[92vw] select-none object-contain shadow-2xl"
          />

          <div className="absolute bottom-5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {activeIndex +
              1}{" "}
            of{" "}
            {
              normalizedPhotos.length
            }
          </div>
        </div>
      )}
    </>
  );
}