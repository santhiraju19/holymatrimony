"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Church,
  BrainCircuit,
  Lock,
  Video,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Church,
    title: "Church Verified Profiles",
    description:
      "Profiles can be verified through churches, helping families connect with confidence and trust.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: ShieldCheck,
    title: "Identity Verification",
    description:
      "Government ID and mobile verification reduce fake profiles and improve authenticity.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BrainCircuit,
    title: "Smart AI Matching",
    description:
      "Advanced matching based on denomination, education, profession, location, interests, and faith.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Lock,
    title: "Complete Privacy",
    description:
      "Control who can view your profile, photos, and contact details with advanced privacy settings.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Video,
    title: "Video Introductions",
    description:
      "Share a short introduction video to help families know you better before connecting.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Friendly support team available to guide you throughout your matchmaking journey.",
    color: "from-indigo-500 to-blue-600",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Why Holy Matrimony?
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Everything You Need to Find Your God-Given Life Partner
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            We combine faith, technology, security, and verified profiles to
            create a safe and meaningful Christian matrimony experience.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color}`}
                >
                  <Icon className="text-white" size={30} />
                </div>

                <h3 className="mb-4 text-2xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-24" />
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}