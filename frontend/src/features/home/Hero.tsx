"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Church,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

const featureCards = [
  {
    label: "Verified Profiles",
    icon: ShieldCheck,
    iconClassName: "text-emerald-600",
  },
  {
    label: "Trusted Churches",
    icon: Church,
    iconClassName: "text-blue-600",
  },
  {
    label: "Privacy Protected",
    icon: HeartHandshake,
    iconClassName: "text-pink-600",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-pink-300/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:min-h-[92vh] lg:grid-cols-2 lg:gap-16 lg:py-20">
        <motion.div
          initial={{
            opacity: 0,
            x: -60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
          className="min-w-0"
        >
          <motion.span
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.6,
            }}
            className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm"
          >
            India&apos;s Trusted Christian Matrimony
          </motion.span>

          <motion.h1
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Find the

            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Christian Life Partner
            </span>

            God Has Prepared For You
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
              duration: 0.8,
            }}
            className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8"
          >
            Connect with verified Christian families across India.
            Experience secure, church-based matchmaking designed to
            help you build a Christ-centered marriage filled with
            faith, love, privacy, and trust.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.6,
              duration: 0.8,
            }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
          >
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Register Free
            </Link>

            <Link
              href="/search"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              Browse Profiles
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.8,
              duration: 0.8,
            }}
            className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-12"
          >
            {featureCards.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-md backdrop-blur-sm"
                >
                  <Icon
                    className={item.iconClassName}
                    size={28}
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="relative h-[440px] overflow-hidden rounded-[28px] shadow-2xl sm:h-[540px] lg:h-[650px] lg:rounded-[32px]">
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/hero-couple.jpg"
                alt="Christian wedding couple"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-white/5" />
          </div>

          <motion.div
            animate={{
              y: [-6, 6, -6],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-3 top-4 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-md sm:-left-5 sm:top-12 sm:px-5 sm:py-4 lg:-left-8 lg:top-14"
          >
            <p className="text-xl font-bold text-blue-600 sm:text-2xl lg:text-3xl">
              20,000+
            </p>

            <p className="text-xs text-slate-500 sm:text-sm">
              Verified Members
            </p>
          </motion.div>

          <motion.div
            animate={{
              y: [6, -6, 6],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-4 right-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-md sm:-right-5 sm:bottom-10 sm:px-5 sm:py-4 lg:-right-8 lg:bottom-12"
          >
            <p className="text-xl font-bold text-emerald-600 sm:text-2xl lg:text-3xl">
              350+
            </p>

            <p className="text-xs text-slate-500 sm:text-sm">
              Partner Churches
            </p>
          </motion.div>

          <motion.div
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur-md sm:top-5 sm:px-5 sm:py-4"
          >
            <p className="text-xl font-bold text-pink-600 sm:text-2xl lg:text-3xl">
              98%
            </p>

            <p className="text-xs text-slate-500 sm:text-sm">
              Customer Satisfaction
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}