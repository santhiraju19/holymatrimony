"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
  Star,
} from "lucide-react";

import { motion } from "framer-motion";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/common/SectionHeading";
import TestimonialCard from "@/components/cards/TestimonialCard";

import { testimonials } from "@/data/testimonials";

const AUTO_SLIDE_INTERVAL = 6000;

export default function Testimonials() {
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
    useCallback(() => {
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
      testimonials.length <= 1
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
    <Section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#0B2D5C]/10 blur-3xl"
      />

      <Container>
        <SectionHeading
          badge="Success Stories"
          title="Real Couples. Real Blessings."
          description="Every successful marriage begins with faith, trust, and God's perfect timing."
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
          className="mt-10 grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:mt-12 sm:p-6 md:grid-cols-3"
        >
          <TrustHighlight
            icon={
              <Heart className="h-6 w-6 text-[#0B2D5C]" />
            }
            iconClassName="bg-[#0B2D5C]/10"
            title="Faith-Centered Matches"
            description="Christian relationships built on shared values."
          />

          <TrustHighlight
            icon={
              <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
            }
            iconClassName="bg-[#D4AF37]/20"
            title="Verified Success Stories"
            description="Genuine couples who found their life partners."
          />

          <TrustHighlight
            icon={
              <Star className="h-6 w-6 text-amber-500" />
            }
            iconClassName="bg-amber-100"
            title="Trusted Across India"
            description="Thousands of Christian families trust Holy Matrimony."
          />
        </motion.div>

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
            delay: 0.1,
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
            aria-label="View previous testimonials"
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
            {testimonials.map(
              (item, index) => (
                <motion.div
                  key={item.id}
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
                  whileHover={{
                    y: -6,
                  }}
                  className="w-[88%] shrink-0 snap-center sm:w-[48%] lg:w-[32%]"
                >
                  <TestimonialCard
                    {...item}
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
            aria-label="View next testimonials"
            className="absolute -right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B2D5C] shadow-xl transition hover:scale-105 hover:border-blue-300 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-30 sm:flex lg:-right-5"
          >
            <ChevronRight
              size={24}
            />
          </button>
        </motion.div>

        <div className="mt-2 flex justify-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() =>
              scrollCarousel(
                "previous"
              )
            }
            disabled={!canScrollLeft}
            aria-label="Previous testimonials"
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
            aria-label="Next testimonials"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B2D5C] shadow-md disabled:opacity-30"
          >
            <ChevronRight
              size={21}
            />
          </button>
        </div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.25,
          }}
          className="mt-14 rounded-3xl bg-[#0B2D5C] px-5 py-9 text-center text-white shadow-xl sm:mt-20 sm:px-8 sm:py-10"
        >
          <div className="flex justify-center gap-1 text-amber-400">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <Star
                key={index}
                className="h-5 w-5 fill-current"
              />
            ))}
          </div>

          <h3 className="mt-5 text-2xl font-bold sm:text-3xl">
            Thousands of Christian
            Families Trust Holy Matrimony
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Every profile, conversation,
            and successful marriage
            reflects our commitment to
            helping believers build
            Christ-centered families.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium">
            <span>✓ Verified Profiles</span>
            <span>✓ Church Based</span>
            <span>✓ Privacy Protected</span>
            <span>✓ Trusted Across India</span>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

function TrustHighlight({
  icon,
  iconClassName,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={[
          "rounded-2xl p-3",
          iconClassName,
        ].join(" ")}
      >
        {icon}
      </div>

      <div>
        <h4 className="font-semibold text-slate-900">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}