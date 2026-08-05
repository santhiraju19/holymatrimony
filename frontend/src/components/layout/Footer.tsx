"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  CheckCircle2,
  Church,
  Globe2,
  Heart,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  href: string;
  shortLabel: string;
}

const exploreLinks: FooterLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Search Profiles",
    href: "/search",
  },
  {
    label: "Membership Plans",
    href: "/membership",
  },
  {
    label: "Success Stories",
    href: "/success-stories",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const supportLinks: FooterLink[] = [
  {
    label: "Help Centre",
    href: "/help",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Safety Tips",
    href: "/safety",
  },
  {
    label: "Report a Concern",
    href: "/contact",
  },
];

const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    shortLabel: "IG",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    shortLabel: "FB",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    shortLabel: "IN",
  },
];

const trustItems = [
  "Privacy-first matchmaking",
  "Secure profile management",
  "Protected member communication",
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#06162C] text-white">
      <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-44 right-0 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-3xl" />

      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-[#D4AF37]/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-7 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F1D674] to-[#A97910] text-[#06162C] shadow-[0_14px_35px_rgba(212,175,55,0.24)]">
                <Heart
                  size={27}
                  fill="currentColor"
                />

                <Sparkles
                  size={13}
                  className="absolute -right-1 -top-1 text-white"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F2D675]">
                  <Sparkles size={14} />

                  Faith-centred matchmaking
                </div>

                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Begin your meaningful journey
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Create your profile and connect
                  with Christian members seeking a
                  God-centred and committed life
                  partnership.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] px-6 text-sm font-black text-[#06162C] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Register Free

                <ArrowUpRight size={17} />
              </Link>

              <Link
                href="/search"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-6 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                Browse Profiles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[1.35fr_0.8fr_0.8fr_1.25fr]">
          <section>
            <Link
              href="/"
              aria-label="Holy Matrimony home"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F2D675]/30 bg-[#D4AF37]/10 text-[#F2D675] shadow-lg">
                <Church size={24} />
              </div>

              <div>
                <p className="text-xl font-black">
                  Holy Matrimony
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                  Faith • Family • Forever
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              India&apos;s privacy-first
              Christian matrimony platform,
              helping believers discover
              meaningful, respectful and
              faith-centred life partnerships.
            </p>

            <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-emerald-400"
                />

                <span className="text-xs font-semibold text-slate-300">
                  Privacy protected
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-[#F2D675]"
                />

                <span className="text-xs font-semibold text-slate-300">
                  Secure communication
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Follow us
              </p>

              <div className="mt-3 flex gap-3">
                {socialLinks.map(
                  (item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      title={item.label}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xs font-black text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:text-[#F2D675]"
                    >
                      {item.shortLabel}
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              {exploreLinks.map(
                (item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#F2D675]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600 transition group-hover:bg-[#D4AF37]" />

                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
              Support
            </h3>

            <ul className="mt-5 space-y-3">
              {supportLinks.map(
                (item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#F2D675]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600 transition group-hover:bg-[#D4AF37]" />

                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#F2D675]">
                  <MapPin size={17} />
                </div>

                <address className="text-sm not-italic leading-6 text-slate-400">
                  Holy Matrimony Services Pvt Ltd
                  <br />
                  5/1 Krishna Nagar,
                  <br />
                  PF Office Road,
                  <br />
                  Brindavan Gardens,
                  <br />
                  Guntur – 522002,
                  <br />
                  Andhra Pradesh, India
                </address>
              </div>

              <a
                href="tel:+919133919777"
                className="flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#F2D675]">
                  <Phone size={17} />
                </span>

                +91 91339 19777
              </a>

              <a
                href="mailto:support@theholymatrimony.com"
                className="flex min-w-0 items-center gap-3 text-sm text-slate-400 transition hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#F2D675]">
                  <Mail size={17} />
                </span>

                <span className="truncate">
                  support@theholymatrimony.com
                </span>
              </a>

              <Link
                href="/"
                className="flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#F2D675]">
                  <Globe2 size={17} />
                </span>

                theholymatrimony.com
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-12 grid gap-3 border-t border-white/10 pt-7 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <CheckCircle2
                size={15}
                className="shrink-0 text-emerald-400"
              />

              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Holy Matrimony Services
            Pvt Ltd. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>

            <Link
              href="/safety"
              className="transition hover:text-white"
            >
              Safety
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-white"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}