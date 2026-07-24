"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="bg-gradient-to-r from-primary to-indigo-700 py-20 text-white">
      <div className="container mx-auto max-w-5xl px-4 text-center">
        <Heart
          className="mx-auto mb-6"
          size={48}
        />

        <h2 className="text-4xl font-bold">
          Ready to Find Your God-Ordained Life Partner?
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-white/90">
          Join thousands of Christian families who trust Holy Matrimony.
          Begin your journey today with faith, confidence, and a
          community that cares.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-primary transition hover:scale-105"
          >
            Register Now
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/membership"
            className="rounded-xl border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-primary"
          >
            View Membership Plans
          </Link>
        </div>
      </div>
    </section>
  );
}