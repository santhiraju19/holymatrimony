"use client";

import Link from "next/link";
import {
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Company */}
          <div>
            <h3 className="text-2xl font-bold text-white">
              Holy Matrimony
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              India's trusted Christian matrimony platform helping
              believers find God-centered life partners.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              Quick Links
            </h4>

            <ul className="space-y-3">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/search" className="hover:text-white">
                  Search
                </Link>
              </li>

              <li>
                <Link href="/membership" className="hover:text-white">
                  Membership
                </Link>
              </li>

              <li>
                <Link href="/success-stories" className="hover:text-white">
                  Success Stories
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              Support
            </h4>

            <ul className="space-y-3">
              <li>
                <Link href="/help" className="hover:text-white">
                  Help Centre
                </Link>
              </li>

              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link href="/safety" className="hover:text-white">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">
              Contact Us
            </h4>

            <div className="space-y-4">

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-amber-400" />
                <span>
                  Holy Matrimony Services Pvt Ltd
                  <br />
                  5/1 Krishna Nagar,
                  <br />
                  PF Office Road,
                  <br />
                  Brindavan Gardens,
                  <br />
                  Guntur - 522002,
                  <br />
                  Andhra Pradesh, India
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-400" />
                <span>+91 9133919777</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-400" />
                <span>support@theholymatrimony.com</span>
              </div>

            </div>

            <div className="mt-6">
              <Link
                href="https://theholymatrimony.com"
                target="_blank"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
              >
                <Globe className="h-5 w-5" />
                Visit Our Website
              </Link>
            </div>

          </div>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {year} Holy Matrimony Services Pvt Ltd.
          All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}