"use client";

import { churches } from "@/data/churches";

export default function ChurchPartners() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#0B2D5C]">
            Trusted Church Partners
          </h2>

          <p className="mt-4 text-gray-600">
            Serving Christian communities across India.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {churches.map((church) => (
            <div
              key={church.id}
              className="rounded-2xl border bg-white p-8 text-center shadow-sm hover:shadow-lg transition"
            >
              <p className="font-semibold text-[#0B2D5C]">
                {church.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}