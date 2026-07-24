"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Quote,
  ShieldCheck,
  Star,
  MapPin,
} from "lucide-react";

import Card from "@/components/ui/Card";

export interface TestimonialCardProps {
  name: string;
  location: string;
  image: string;
  weddingDate: string;
  message: string;
}

export default function TestimonialCard({
  name,
  location,
  image,
  weddingDate,
  message,
}: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{
        duration: 0.3,
      }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:shadow-2xl">

        {/* Decorative Background */}
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#D4AF37]/10 blur-2xl" />

        {/* Quote */}
        <div className="relative z-10 flex items-center justify-between">

          <Quote className="h-10 w-10 text-[#0B2D5C]" />

          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-4 w-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>

        </div>

        {/* Message */}
        <p className="relative z-10 mt-6 text-[16px] leading-8 text-slate-600 italic">
          "{message}"
        </p>

        {/* Divider */}
        <div className="my-8 h-px bg-slate-200" />

        {/* Profile */}
        <div className="relative z-10 flex items-center gap-4">

          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-[#D4AF37]/20">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">

            <h3 className="text-lg font-bold text-slate-900">
              {name}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {location}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <ShieldCheck className="h-4 w-4" />
              Verified Marriage
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">

          <div className="flex items-center gap-2 text-sm font-medium text-[#0B2D5C]">
            <Heart className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
            Married {weddingDate}
          </div>

          <span className="rounded-full bg-[#0B2D5C]/10 px-3 py-1 text-xs font-semibold text-[#0B2D5C]">
            Success Story
          </span>

        </div>

      </Card>
    </motion.div>
  );
}