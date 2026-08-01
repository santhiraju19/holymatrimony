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
} from "lucide-react";
import { motion } from "framer-motion";

import ProfileCard from "@/components/cards/ProfileCard";
import SectionHeading from "@/components/common/SectionHeading";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

import { featuredProfiles } from "@/data/home";

const AUTO_SLIDE_INTERVAL = 5000;

export default function FeaturedProfiles() {
  const carouselRef =
    useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(true);

  const [paused, setPaused] =
    useState(false);

  const updateScrollButtons =
    useCallback(() => {
      const carousel =
        carouselRef.current;

      if (!carousel) {
        return;
      }

      const maximumScroll =
        carousel.scrollWidth -
        carousel.clientWidth;

      setCanScrollLeft(
        carousel.scrollLeft > 8
      );

      setCanScrollRight(
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

      return (
        firstCard.offsetWidth +
        gap
      );
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

    const handleResize = () => {
      updateScrollButtons();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [updateScrollButtons]);

  useEffect(() => {
    if (
      paused ||
      featuredProfiles.length <= 1
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
  }, [autoAdvance, paused]);

  return (
    <Section className="overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <Container>
        <SectionHeading
          badge="Featured Profiles"
          title="Meet Verified Christian Singles"
          description="Discover genuine, church-verified Christian brides and grooms looking for a God-centered lifelong relationship."
        />

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
            {featuredProfiles.map(
              (profile, index) => (
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
                        index * 0.08,
                        0.35
                      ),
                    duration: 0.45,
                  }}
                  className="w-[86%] shrink-0 snap-center sm:w-[47%] lg:w-[31%] xl:w-[23%]"
                >
                  <ProfileCard
                    {...profile}
                    onViewProfile={(
                      id
                    ) => {
                      window.location.href =
                        `/profile/${id}`;
                    }}
                    onFavourite={(
                      id
                    ) => {
                      console.log(
                        "Favourite profile:",
                        id
                      );
                    }}
                  />
                </motion.div>
              )
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
            href="/search"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            View All Profiles
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
}