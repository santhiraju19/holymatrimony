"use client";

import { motion } from "framer-motion";
import {
  Users,
  Church,
  HeartHandshake,
  BadgeCheck,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "20,000+",
    label: "Verified Members",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: Church,
    value: "350+",
    label: "Partner Churches",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: HeartHandshake,
    value: "5,000+",
    label: "Successful Matches",
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
  {
    icon: BadgeCheck,
    value: "98%",
    label: "Customer Satisfaction",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export default function Stats() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Trusted by Thousands
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Building Christian Families Across India
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
            Every profile is built on trust, verified identity, and shared
            Christian values.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                className="rounded-3xl bg-white p-8 shadow-lg transition-all"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}
                >
                  <Icon className={item.color} size={34} />
                </div>

                <h3 className="text-5xl font-extrabold text-slate-900">
                  {item.value}
                </h3>

                <p className="mt-3 text-lg text-slate-600">
                  {item.label}
                </p>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}