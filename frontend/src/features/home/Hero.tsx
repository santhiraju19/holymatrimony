"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Church,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

const featureCards = [
  {
    label: "Trust Verification",
    description: "Mobile & identity checks",
    icon: BadgeCheck,
    iconClassName: "text-emerald-600",
    bgClassName: "bg-emerald-50",
  },
  {
    label: "Church Verification",
    description: "Faith-based trust layer",
    icon: Church,
    iconClassName: "text-blue-600",
    bgClassName: "bg-blue-50",
  },
  {
    label: "Privacy Protected",
    description: "Designed for safer connections",
    icon: ShieldCheck,
    iconClassName: "text-violet-600",
    bgClassName: "bg-violet-50",
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

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-16 lg:min-h-[92vh] lg:grid-cols-2 lg:gap-16 lg:pb-32 lg:pt-20">
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
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm"
          >
            <HeartHandshake size={16} />
            Faith • Family • Forever
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
            Find a Life Partner

            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Who Shares Your Faith
            </span>

            and Family Values
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
            A Christian matrimony platform built for meaningful
            connections, with detailed profiles, partner preferences,
            trust verification and church-based verification.
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
            className="mt-10 grid gap-3 sm:grid-cols-3 lg:mt-12"
          >
            {featureCards.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  whileHover={{
                    y: -4,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-md backdrop-blur-sm"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bgClassName}`}
                  >
                    <Icon
                      className={item.iconClassName}
                      size={21}
                    />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-800">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    {item.description}
                  </p>
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
                scale: [1, 1.04, 1],
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

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-white/5" />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <div className="max-w-sm rounded-2xl border border-white/40 bg-white/90 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <HeartHandshake size={23} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      Meaningful Matches
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Discover people based on faith, community,
                      education, lifestyle and partner preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
            className="absolute -left-2 top-6 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md sm:-left-6 sm:top-12"
          >
            <div className="flex items-center gap-2">
              <BadgeCheck
                size={20}
                className="text-emerald-600"
              />

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Trust Verification
                </p>

                <p className="text-[10px] text-slate-500">
                  Built into profiles
                </p>
              </div>
            </div>
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
            className="absolute -right-2 top-28 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md sm:-right-6 sm:top-36"
          >
            <div className="flex items-center gap-2">
              <Church
                size={20}
                className="text-blue-600"
              />

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Church Verification
                </p>

                <p className="text-[10px] text-slate-500">
                  Additional trust layer
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
