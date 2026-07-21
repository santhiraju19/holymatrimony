"use client";

import { motion } from "framer-motion";
import { Heart, ShieldCheck, Star } from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/common/SectionHeading";
import TestimonialCard from "@/components/cards/TestimonialCard";

import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Decorative Background */}
      <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#0B2D5C]/10 blur-3xl" />

      <Container>
        <SectionHeading
          badge="Success Stories"
          title="Real Couples. Real Blessings."
          description="Every successful marriage begins with faith, trust, and God's perfect timing."
        />

        {/* Trust Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:grid-cols-3"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#0B2D5C]/10 p-3">
              <Heart className="h-6 w-6 text-[#0B2D5C]" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Faith-Centered Matches
              </h4>

              <p className="text-sm text-slate-600">
                Christian relationships built on shared values.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#D4AF37]/20 p-3">
              <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Verified Success Stories
              </h4>

              <p className="text-sm text-slate-600">
                Genuine couples who found their life partners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-100 p-3">
              <Star className="h-6 w-6 text-amber-500" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Trusted Across India
              </h4>

              <p className="text-sm text-slate-600">
                Thousands of Christian families trust Holy Matrimony.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -8,
              }}
              className="h-full"
            >
              <TestimonialCard {...item} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 rounded-3xl bg-[#0B2D5C] px-8 py-10 text-center text-white shadow-xl"
        >
          <div className="flex justify-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-5 w-5 fill-current"
              />
            ))}
          </div>

          <h3 className="mt-5 text-3xl font-bold">
            Thousands of Christian Families Trust Holy Matrimony
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">
            Every profile, every conversation, and every successful marriage
            reflects our commitment to helping believers build Christ-centered
            families.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium">
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