"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function QuickSearch() {
  return (
    <section className="relative -mt-16 z-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl bg-white p-8 shadow-2xl">

          <h2 className="text-2xl font-bold text-[#0B2D5C]">
            Begin Your Journey
          </h2>

          <p className="mt-2 text-gray-500">
            Search verified Christian brides and grooms.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-6">

            <select className="rounded-xl border p-3">
              <option>I am</option>
              <option>Groom</option>
              <option>Bride</option>
            </select>

            <select className="rounded-xl border p-3">
              <option>Looking For</option>
              <option>Bride</option>
              <option>Groom</option>
            </select>

            <input
              type="number"
              placeholder="Age From"
              className="rounded-xl border p-3"
            />

            <input
              type="number"
              placeholder="Age To"
              className="rounded-xl border p-3"
            />

            <select className="rounded-xl border p-3">
              <option>Denomination</option>
              <option>CSI</option>
              <option>Baptist</option>
              <option>Catholic</option>
              <option>Pentecostal</option>
            </select>

            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search
            </Button>

          </div>
        </div>
      </div>
    </section>
  );
}