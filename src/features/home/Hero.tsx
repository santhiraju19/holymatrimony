"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Church,
  HeartHandshake,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
    </div>

      <div className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            India's Trusted Christian Matrimony
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-6xl">
            Find the
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Christian Life Partner
            </span>
            God Has Prepared For You
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Connect with verified Christian families across India. Experience
            secure, church-based matchmaking designed to help you build a
            Christ-centered marriage filled with faith, love and trust.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              Register Free
            </Link>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 shadow transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-xl"
            >
              Browse Profiles
              <ArrowRight size={18} />
            </Link>

          </div>

          {/* Features */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3">

            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md">
              <ShieldCheck className="text-green-600" size={28} />
              <span className="font-medium text-slate-700">
                Verified Profiles
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md">
              <Church className="text-blue-600" size={28} />
              <span className="font-medium text-slate-700">
                Trusted Churches
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md">
              <HeartHandshake className="text-pink-600" size={28} />
              <span className="font-medium text-slate-700">
                Privacy Protected
              </span>
            </div>

          </div>
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative h-[650px] overflow-hidden rounded-[32px] shadow-2xl">

            <Image
              src="/images/hero-couple.jpg"
              alt="Christian Wedding Couple"
              fill
              priority
              sizes="(max-width:768px)100vw,50vw"
              className="object-cover"
            />

          </div>

          {/* Card 1 */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute -left-8 top-14 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-md"
          >
            <p className="text-3xl font-bold text-blue-600">20,000+</p>
            <p className="text-sm text-slate-500">Verified Members</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
            className="absolute -right-8 bottom-12 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-md"
          >
            <p className="text-3xl font-bold text-green-600">350+</p>
            <p className="text-sm text-slate-500">Partner Churches</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="absolute left-1/2 top-6 -translate-x-1/2 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-md"
          >
            <p className="text-3xl font-bold text-pink-600">98%</p>
            <p className="text-sm text-slate-500">Customer Satisfaction</p>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}