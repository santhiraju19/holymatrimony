"use client";

import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Search Profiles", href: "/search" },
    { label: "Membership", href: "/membership" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "FAQ", href: "/faq" },
  ];

  const socialLinks = [
    {
      icon: <FaFacebookF className="h-5 w-5" />,
      href: "#",
    },
    {
      icon: <FaInstagram className="h-5 w-5" />,
      href: "#",
    },
    {
      icon: <FaYoutube className="h-5 w-5" />,
      href: "#",
    },
    {
      icon: <FaLinkedinIn className="h-5 w-5" />,
      href: "#",
    },
    {
      icon: <FaXTwitter className="h-5 w-5" />,
      href: "#",
    },
  ];

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Holy Matrimony
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              India's trusted Christian matrimony platform helping
              believers find their God-ordained life partner through
              faith, trust, and verified profiles.
            </p>

            <div className="mt-6 flex gap-4">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="rounded-full bg-white/10 p-3 transition hover:bg-red-600"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition hover:text-red-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Support
            </h3>

            <ul className="mt-6 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition hover:text-red-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Contact Us
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-red-500" />
                <p className="text-sm text-slate-300">
                  8-17-154, 1st Line,
                  <br />
                  Mangaldas Nagar,
                  <br />
                  Guntur - 522001,
                  <br />
                  Andhra Pradesh, India
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-500" />
                <span className="text-sm text-slate-300">
                  +91 98765 43210
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-500" />
                <span className="text-sm text-slate-300">
                  support@theholymatrimony.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Holy Matrimony Services Pvt.
              Ltd. All rights reserved.
            </p>

            <p className="flex items-center gap-2 text-sm text-slate-400">
              Made with
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              for Christian families.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
