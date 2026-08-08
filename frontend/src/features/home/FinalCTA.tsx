"use client";

import Button from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0B2D5C] via-[#123B74] to-[#0B2D5C] py-24">

      {/* Background Glow */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">

        <span className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold tracking-wide text-amber-300">
          Trusted Christian Matrimony
        </span>

        <h2 className="mt-8 text-4xl font-bold leading-tight text-white md:text-5xl">
          Your God-Ordained
          <br />
          Life Partner Awaits
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-200">
          Join thousands of Christian families who trust Holy Matrimony
          to help them find meaningful, faith-centered relationships that
          lead to lifelong marriages.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

          <Button
            href="/register"
            size="lg"
          >
            Register Free
          </Button>

          <Button
            href="/search"
            variant="outline"
            size="lg"
          >
            Browse Profiles
          </Button>

        </div>

        <div className="mt-12 grid gap-6 text-white sm:grid-cols-3">

          <div>
            <div className="text-3xl font-bold text-amber-300">
              10,000+
            </div>

            <p className="mt-2 text-slate-300">
              Verified Profiles
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold text-amber-300">
              2,500+
            </div>

            <p className="mt-2 text-slate-300">
              Happy Marriages
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold text-amber-300">
              100%
            </div>

            <p className="mt-2 text-slate-300">
              Christian Community
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}