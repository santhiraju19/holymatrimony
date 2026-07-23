"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Heart,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Top */}
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 lg:grid-cols-5">

          {/* Company */}
          <div className="lg:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 text-2xl font-bold text-white">
                HM
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Holy Matrimony
                </h3>

                <p className="text-sm text-slate-400">
                  Christian Matrimony Services
                </p>
              </div>

            </div>

            <p className="mt-6 leading-8 text-slate-400">
              Holy Matrimony helps Christian brides and grooms find their
              God-ordained life partner through verified profiles,
              faith-centered matching, and trusted matrimonial services.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-sm">
                  Verified Profiles
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <BadgeCheck size={18} className="text-amber-400" />
                <span className="text-sm">
                  Trusted Platform
                </span>
              </div>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h4 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h4>

            <div className="space-y-3">

              <Link href="/" className="block hover:text-white">
                Home
              </Link>

              <Link href="/about" className="block hover:text-white">
                About
              </Link>

              <Link href="/search" className="block hover:text-white">
                Search Profiles
              </Link>

              <Link href="/membership" className="block hover:text-white">
                Membership
              </Link>

              <Link href="/contact" className="block hover:text-white">
                Contact
              </Link>

            </div>

          </div>

          {/* Legal */}

          <div>

            <h4 className="mb-5 text-lg font-semibold text-white">
              Legal
            </h4>

            <div className="space-y-3">

              <Link href="/privacy-policy" className="block hover:text-white">
                Privacy Policy
              </Link>

              <Link href="/terms" className="block hover:text-white">
                Terms & Conditions
              </Link>

              <Link href="/refund-policy" className="block hover:text-white">
                Refund Policy
              </Link>

              <Link href="/cookie-policy" className="block hover:text-white">
                Cookie Policy
              </Link>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h4 className="mb-5 text-lg font-semibold text-white">
              Contact
            </h4>

            <div className="space-y-4">

              <div className="flex gap-3">

                <Phone size={18} className="mt-1 text-blue-400" />

                <div>
                  <p>+91 98765 43210</p>
                  <p>+91 91234 56789</p>
                </div>

              </div>

              <div className="flex gap-3">

                <Mail size={18} className="mt-1 text-blue-400" />

                <div>
                  support@theholymatrimony.com
                </div>

              </div>

              <div className="flex gap-3">

                <MapPin size={18} className="mt-1 text-blue-400" />

                <div>
                  8-17-154,
                  <br />
                  1st Line,
                  <br />
                  Mangaldas Nagar,
                  <br />
                  Guntur - 522001,
                  <br />
                  Andhra Pradesh
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Divider */}

      <div className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row">

          <p className="text-sm text-slate-500">
            © {year} Holy Matrimony Services Pvt Ltd. All Rights Reserved.
          </p>

          <div className="flex gap-5">

            <a href="#">
              <Facebook className="h-5 w-5 hover:text-white" />
            </a>

            <a href="#">
              <Instagram className="h-5 w-5 hover:text-white" />
            </a>

            <a href="#">
              <Youtube className="h-5 w-5 hover:text-white" />
            </a>

            <a href="#">
              <Linkedin className="h-5 w-5 hover:text-white" />
            </a>

          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">

            Made with

            <Heart
              size={16}
              className="fill-red-500 text-red-500"
            />

            in India

          </div>

        </div>

      </div>

    </footer>
  );
}