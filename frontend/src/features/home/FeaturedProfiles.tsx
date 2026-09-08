"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import ProfileCard from "@/components/cards/ProfileCard";
import SectionHeading from "@/components/common/SectionHeading";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import {
  getPublicFeaturedProfiles,
  type PublicFeaturedProfile,
} from "@/features/home/api/featuredProfilesApi";
import { resolveBrowsePhotoUrl } from "@/features/browse/utils/photoUrl";

const AUTO_SLIDE_INTERVAL = 5000;

function buildLocation(
  profile: PublicFeaturedProfile
): string {
  const parts = [
    profile.city,
    profile.state,
    profile.country,
  ]
    .map((value) => value?.trim())
    .filter(
      (value): value is string =>
        Boolean(value)
    );

  return parts.length > 0
    ? parts.join(", ")
    : "Location available on profile";
}

export default function FeaturedProfiles() {
  const carouselRef =
    useRef<HTMLDivElement | null>(null);

  const [profiles, setProfiles] =
    useState<PublicFeaturedProfile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadFailed, setLoadFailed] =
    useState(false);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfiles() {
      try {
        setLoading(true);
        setLoadFailed(false);

        const result =
          await getPublicFeaturedProfiles();

        if (!active) {
          return;
        }

        setProfiles(result);
      } catch (error) {
        console.error(
          "Unable to load featured profiles:",
          error
        );

        if (!active) {
          return;
        }

        setProfiles([]);
        setLoadFailed(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfiles();

    return () => {
      active = false;
    };
  }, []);

  const updateScrollButtons =
    useCallback(() => {
      const carousel =
        carouselRef.current;

      if (!carousel) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }

      const maximumScroll =
        carousel.scrollWidth -
        carousel.clientWidth;

      setCanScrollLeft(
        carousel.scrollLeft > 8
      );

      setCanScrollRight(
        maximumScroll > 8 &&
          carousel.scrollLeft <
            maximumScroll - 8
      );
    }, []);

  const getScrollDistance =
    useCallback((): number => {
      const carousel =
        carouselRef.current;

      if (!carousel) {
        return 320;
      }

      const firstCard =
        carousel.firstElementChild as
          | HTMLElement
          | null;

      if (!firstCard) {
        return carousel.clientWidth;
      }

      const styles =
        window.getComputedStyle(
          carousel
        );

      const gap =
        Number.parseFloat(
          styles.columnGap ||
            styles.gap ||
            "0"
        ) || 0;

      return firstCard.offsetWidth + gap;
    }, []);

  const scrollCarousel =
    useCallback(
      (
        direction:
          | "previous"
          | "next"
      ) => {
        const carousel =
          carouselRef.current;

        if (!carousel) {
          return;
        }

        const distance =
          getScrollDistance();

        carousel.scrollBy({
          left:
            direction === "next"
              ? distance
              : -distance,
          behavior: "smooth",
        });
      },
      [getScrollDistance]
    );

  const autoAdvance =
    useCallback(() => {
      const carousel =
        carouselRef.current;

      if (!carousel) {
        return;
      }

      const maximumScroll =
        carousel.scrollWidth -
        carousel.clientWidth;

      if (maximumScroll <= 8) {
        return;
      }

      const reachedEnd =
        carousel.scrollLeft >=
        maximumScroll - 8;

      if (reachedEnd) {
        carousel.scrollTo({
          left: 0,
          behavior: "smooth",
        });

        return;
      }

      scrollCarousel("next");
    }, [scrollCarousel]);

  useEffect(() => {
    updateScrollButtons();

    const frame =
      window.requestAnimationFrame(
        updateScrollButtons
      );

    const handleResize = () => {
      updateScrollButtons();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.cancelAnimationFrame(
        frame
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    profiles,
    loading,
    updateScrollButtons,
  ]);

  useEffect(() => {
    if (
      paused ||
      profiles.length <= 1
    ) {
      return;
    }

    const intervalId =
      window.setInterval(
        autoAdvance,
        AUTO_SLIDE_INTERVAL
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    autoAdvance,
    paused,
    profiles.length,
  ]);

  return (
    <Section className="overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <Container>
        <SectionHeading
          badge="Featured Profiles"
          title="Meet Genuine Christian Singles"
          description="Discover real members of the Holy Matrimony community looking for meaningful, faith-centered relationships."
        />

        {loading ? (
          <div className="mt-12 flex min-h-72 items-center justify-center sm:mt-16">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

              <span className="font-medium">
                Loading featured profiles...
              </span>
            </div>
          </div>
        ) : profiles.length > 0 ? (
          <>
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.6,
              }}
              className="relative mt-12 sm:mt-16"
              onMouseEnter={() =>
                setPaused(true)
              }
              onMouseLeave={() =>
                setPaused(false)
              }
              onFocus={() =>
                setPaused(true)
              }
              onBlur={() =>
                setPaused(false)
              }
            >
              <button
                type="button"
                onClick={() =>
                  scrollCarousel(
                    "previous"
                  )
                }
                disabled={!canScrollLeft}
                aria-label="View previous profiles"
                className="absolute -left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B2D5C] shadow-xl transition hover:scale-105 hover:border-blue-300 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-30 sm:flex lg:-left-5"
              >
                <ChevronLeft size={24} />
              </button>

              <div
                ref={carouselRef}
                onScroll={
                  updateScrollButtons
                }
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-7 pt-2 [scrollbar-width:none] sm:gap-6 sm:px-3 lg:gap-8 [&::-webkit-scrollbar]:hidden"
              >
                {profiles.map(
                  (profile, index) => {
                    const image =
                      resolveBrowsePhotoUrl(
                        profile.primaryPhotoUrl
                      );

                    return (
                      <motion.div
                        key={profile.id}
                        initial={{
                          opacity: 0,
                          y: 35,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.15,
                        }}
                        transition={{
                          delay:
                            Math.min(
                              index *
                                0.08,
                              0.35
                            ),
                          duration: 0.45,
                        }}
                        className="w-[86%] shrink-0 snap-center sm:w-[47%] lg:w-[31%] xl:w-[23%]"
                      >
                        <ProfileCard
                          id={profile.id}
                          name={
                            profile.firstName ||
                            "Member"
                          }
                          age={profile.age}
                          denomination={
                            profile.denomination ||
                            "Christian"
                          }
                          profession={
                            profile.profession ||
                            "Profession available on profile"
                          }
                          location={
                            buildLocation(
                              profile
                            )
                          }
                          image={image}
                          verified={
                            profile.verifiedProfile
                          }
                          churchVerified={
                            profile.churchVerified
                          }
                          completion={
                            profile.completionPercentage
                          }
                          unoptimizedImage
                          showFavourite={false}
                          onViewProfile={(
                            id
                          ) => {
                            window.location.href =
                              `/browse/${id}`;
                          }}
                        />
                      </motion.div>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  scrollCarousel("next")
                }
                disabled={!canScrollRight}
                aria-label="View next profiles"
                className="absolute -right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B2D5C] shadow-xl transition hover:scale-105 hover:border-blue-300 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-30 sm:flex lg:-right-5"
              >
                <ChevronRight
                  size={24}
                />
              </button>
            </motion.div>

            <div className="mt-3 flex justify-center gap-2 sm:hidden">
              <button
                type="button"
                onClick={() =>
                  scrollCarousel(
                    "previous"
                  )
                }
                disabled={!canScrollLeft}
                aria-label="Previous profiles"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B2D5C] shadow-md disabled:opacity-30"
              >
                <ChevronLeft size={21} />
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollCarousel("next")
                }
                disabled={!canScrollRight}
                aria-label="Next profiles"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B2D5C] shadow-md disabled:opacity-30"
              >
                <ChevronRight
                  size={21}
                />
              </button>
            </div>
          </>
        ) : (
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:mt-16">
            <h3 className="text-xl font-bold text-[#0B2D5C]">
              Genuine member profiles
              are coming soon
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              {loadFailed
                ? "Featured profiles are temporarily unavailable. You can still explore Holy Matrimony and discover members after signing in."
                : "We only feature genuine Holy Matrimony members here with appropriate profile visibility. Explore the community to discover more Christian singles."}
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{ once: true }}
          transition={{
            delay: 0.25,
          }}
          className="mt-10 text-center sm:mt-12"
        >
          <Link
            href="/browse"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            View All Profiles
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
}
