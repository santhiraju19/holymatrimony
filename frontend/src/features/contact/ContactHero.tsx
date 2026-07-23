"use client";

import Link from "next/link";
import {
  ArrowRight,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  Users,
} from "lucide-react";

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary to-indigo-900 text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: "url('/images/hero-couple.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/40" />

      {/* Decorative Blobs */}
      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-pink-400/10 blur-3xl" />

      <div className="relative container mx-auto px-6 py-24 lg:py-32">
        {/* Breadcrumb */}
        <div className="mb-10 flex items-center text-sm text-white/70">
          <Link href="/" className="hover:text-white">
            Home
          </Link>

          <ChevronRight size={16} className="mx-2" />

          <span>Contact Us</span>
        </div>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left */}
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
              Holy Matrimony Services Pvt Ltd
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight lg:text-6xl">
              Let's Begin Your
              <span className="block text-yellow-300">
                Journey Together
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/85">
              Whether you're looking for membership assistance,
              profile verification, technical support, or simply
              have a question, our team is here to help you every
              step of the way.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-semibold text-primary transition hover:scale-105"
              >
                Register Now
                <ArrowRight size={18} />
              </Link>

              <a
                href="tel:+919133919777"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-4 font-semibold transition hover:bg-white hover:text-primary"
              >
                <Phone size={18} />
                Call Us
              </a>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-bold">
                Why Families Trust Holy Matrimony
              </h2>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <Users className="text-yellow-300" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Growing Christian Community
                    </h3>

                    <p className="mt-1 text-white/80">
                      Thousands of Christian families are part of
                      our trusted matrimonial platform.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <ShieldCheck className="text-green-300" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Verified Profiles
                    </h3>

                    <p className="mt-1 text-white/80">
                      We encourage profile verification to help
                      build trust and confidence.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    <HeartHandshake className="text-pink-300" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Dedicated Support
                    </h3>

                    <p className="mt-1 text-white/80">
                      Friendly assistance for membership,
                      verification, and technical queries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl bg-white/10 p-6">
                <div className="flex items-center gap-3">
                  <Mail className="text-yellow-300" />

                  <div>
                    <p className="font-semibold">
                      Email Support
                    </p>

                    <p className="text-white/80">
                      support@theholymatrimony.com
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Phone className="text-green-300" />

                  <div>
                    <p className="font-semibold">
                      Call Us
                    </p>

                    <p className="text-white/80">
                      +91 91339 19777
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-20 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <h3 className="text-4xl font-bold text-yellow-300">
              12K+
            </h3>

            <p className="mt-2 text-white/80">
              Registered Members
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <h3 className="text-4xl font-bold text-green-300">
              98%
            </h3>

            <p className="mt-2 text-white/80">
              Verified Profiles
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <h3 className="text-4xl font-bold text-pink-300">
              24 hrs
            </h3>

            <p className="mt-2 text-white/80">
              Average Response
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <h3 className="text-4xl font-bold text-cyan-300">
              ★★★★★
            </h3>

            <p className="mt-2 text-white/80">
              Trusted Support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}