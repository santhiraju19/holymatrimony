"use client";

import Link from "next/link";
import Button from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50 to-slate-100">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-yellow-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:flex lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#0B2D5C]">
            Christian Matrimony Membership Plans
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-[#0B2D5C] lg:text-6xl">
            Choose the Right Membership
            <span className="block text-yellow-600">
              For Your Blessed Journey
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Unlock premium Christian matchmaking features designed to help you
            connect with genuine, verified profiles and find the life partner
            God has planned for you.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register">
              <Button size="lg">
                Register Free
              </Button>
            </Link>

            <a href="#plans">
              <Button
                variant="outline"
                size="lg"
              >
                Compare Plans
              </Button>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-slate-600">
            <div>✔ Verified Christian Profiles</div>
            <div>✔ Safe & Secure Platform</div>
            <div>✔ Trusted Matchmaking</div>
          </div>
        </div>

        <div className="mt-16 lg:mt-0">
          <div className="rounded-3xl border border-white/50 bg-white p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="rounded-2xl bg-blue-50 p-5">
                <h3 className="text-xl font-bold text-[#0B2D5C]">
                  Why Upgrade?
                </h3>

                <ul className="mt-4 space-y-3 text-slate-600">
                  <li>✔ Unlimited Interests</li>
                  <li>✔ Chat with Members</li>
                  <li>✔ View Contact Details</li>
                  <li>✔ Priority Search Ranking</li>
                  <li>✔ Premium Customer Support</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-[#0B2D5C] p-6 text-white">
                <h4 className="text-lg font-semibold">
                  Thousands of Christian Families Trust Holy Matrimony
                </h4>

                <p className="mt-2 text-blue-100">
                  Start your journey today and meet verified Christian brides
                  and grooms from trusted churches across India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}