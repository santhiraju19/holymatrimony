"use client";

import { Search } from "lucide-react";

export default function QuickSearch() {
  return (
    <section className="-mt-20 relative z-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="rounded-3xl bg-white p-8 shadow-2xl">

          <h2 className="text-3xl font-bold text-[#0B2D5C]">
            Begin Your Journey
          </h2>

          <p className="mt-2 text-gray-500">
            Find verified Christian brides and grooms across India.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-5">

            <select className="rounded-xl border p-4">
              <option>I am</option>
              <option>Groom</option>
              <option>Bride</option>
            </select>

            <select className="rounded-xl border p-4">
              <option>Age From</option>
              <option>21</option>
              <option>22</option>
              <option>23</option>
            </select>

            <select className="rounded-xl border p-4">
              <option>Age To</option>
              <option>30</option>
              <option>35</option>
              <option>40</option>
            </select>

            <select className="rounded-xl border p-4">
              <option>Denomination</option>
              <option>CSI</option>
              <option>Baptist</option>
              <option>Pentecostal</option>
            </select>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] p-4 font-semibold">
              <Search size={20} />
              Search
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}