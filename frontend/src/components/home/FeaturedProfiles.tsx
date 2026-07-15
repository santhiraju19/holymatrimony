"use client";

import { featuredProfiles } from "@/data/profiles";

export default function FeaturedProfiles() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">
            Featured Profiles
          </p>

          <h2 className="mt-4 text-5xl font-bold text-[#0B2D5C]">
            Meet Our Members
          </h2>

          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Browse a selection of verified Christian profiles from across India.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex h-64 items-center justify-center bg-slate-100 text-gray-400">
                Photo Placeholder
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#0B2D5C]">
                  {profile.name}
                </h3>

                <p className="mt-2 text-gray-600">
                  {profile.age} Years • {profile.denomination}
                </p>

                <p className="mt-2 text-gray-600">
                  {profile.profession}
                </p>

                <p className="text-gray-500">
                  {profile.location}
                </p>

                <button className="mt-6 w-full rounded-xl bg-[#D4AF37] py-3 font-semibold text-white transition hover:bg-[#c39b2e]">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}