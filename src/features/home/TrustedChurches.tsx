"use client";

import { motion } from "framer-motion";

const churches = [
  "CSI",
  "Catholic",
  "Baptist",
  "Methodist",
  "Lutheran",
  "Pentecostal",
  "Brethren",
  "Orthodox",
  "Independent",
  "Seventh-day Adventist",
];

export default function TrustedChurches() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="text-center"
        >

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Trusted Across India
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Trusted by Christian Communities
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
            Holy Matrimony welcomes members from churches and Christian
            denominations across India, helping families connect through
            faith, trust and verified relationships.
          </p>

        </motion.div>

        {/* Marquee */}

        <div className="relative mt-16 overflow-hidden">

          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: "linear",
            }}
            className="flex w-max gap-6"
          >

            {[...churches, ...churches].map((church, index) => (
              <div
                key={index}
                className="flex h-28 w-56 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <span className="text-lg font-bold text-slate-700">
                  {church}
                </span>
              </div>
            ))}

          </motion.div>

        </div>

      </div>
    </section>
  );
}