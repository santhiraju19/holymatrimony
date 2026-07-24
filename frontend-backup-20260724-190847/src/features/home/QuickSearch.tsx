"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function QuickSearch() {
  return (
    <section className="relative -mt-12 z-20">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="rounded-[32px] border border-white/30 bg-white/90 backdrop-blur-xl shadow-2xl p-8"
        >

          <div className="mb-8 text-center">

            <h2 className="text-3xl font-bold text-slate-900">
              Find Your Life Partner
            </h2>

            <p className="mt-2 text-slate-600">
              Search thousands of verified Christian profiles.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">

            {/* Age */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Age
              </label>

              <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600">
                <option>18 - 25</option>
                <option>26 - 30</option>
                <option>31 - 35</option>
                <option>36 - 40</option>
                <option>40+</option>
              </select>
            </div>

            {/* Denomination */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Denomination
              </label>

              <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600">

                <option>Any</option>
                <option>CSI</option>
                <option>Catholic</option>
                <option>Baptist</option>
                <option>Pentecostal</option>
                <option>Lutheran</option>

              </select>

            </div>

            {/* Location */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>

              <input
                type="text"
                placeholder="City / State"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
              />

            </div>

            {/* Profession */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Profession
              </label>

              <input
                type="text"
                placeholder="Engineer, Doctor..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
              />

            </div>

            {/* Search Button */}

            <div className="flex items-end">

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition hover:scale-105"
              >
                <Search size={18} />
                Search
              </button>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}