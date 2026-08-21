"use client";

import {
  Church,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

const denominations = [
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
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            <Church size={15} />
            Christian Denominations
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
            Built for Diverse Christian Communities
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Holy Matrimony supports members from different Christian
            denominations and church backgrounds while allowing each member
            to define the faith and community preferences important to them.
          </p>
        </motion.div>

        <div className="relative mt-12 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent"
          />

          <motion.div
            animate={{
              x: [
                "0%",
                "-50%",
              ],
            }}
            transition={{
              repeat:
                Infinity,

              duration:
                25,

              ease:
                "linear",
            }}
            className="flex w-max gap-4 sm:gap-5"
          >
            {[
              ...denominations,
              ...denominations,
            ].map(
              (
                denomination,
                index
              ) => (
                <div
                  key={`${denomination}-${index}`}
                  className="flex h-24 w-52 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                    <Church
                      size={17}
                    />
                  </span>

                  <span className="text-sm font-bold text-slate-700">
                    {
                      denomination
                    }
                  </span>
                </div>
              )
            )}
          </motion.div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-5 text-slate-400">
          Denomination names indicate supported profile and search
          preferences and do not imply endorsement or formal partnership
          with any church organization.
        </p>
      </div>
    </section>
  );
}
