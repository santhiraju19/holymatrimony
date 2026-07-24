"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const cards = [
  {
    title: "Call Us",
    subtitle: "Speak with our support team",
    value: "+91 91339 19777",
    icon: Phone,
    href: "tel:+919133919777",
    bg: "from-blue-500 to-cyan-500",
    button: "Call Now",
  },
  {
    title: "WhatsApp",
    subtitle: "Quick support & enquiries",
    value: "+91 91339 19777",
    icon: MessageCircle,
    href: "https://wa.me/919133919777",
    bg: "from-green-500 to-emerald-500",
    button: "Chat Now",
  },
  {
    title: "Email",
    subtitle: "We'll reply within 24 hours",
    value: "support@theholymatrimony.com",
    icon: Mail,
    href: "mailto:support@theholymatrimony.com",
    bg: "from-pink-500 to-rose-500",
    button: "Send Email",
  },
  {
    title: "Visit Office",
    subtitle: "Meet our support team",
    value: "Guntur, Andhra Pradesh",
    icon: MapPin,
    href: "/contact",
    bg: "from-violet-500 to-indigo-600",
    button: "View Location",
  },
];

export default function ContactCards() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Gradient Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 transition duration-500 group-hover:opacity-10`}
                />

                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br ${card.bg} p-4 text-white shadow-lg`}
                >
                  <Icon size={30} />
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {card.title}
                </h3>

                <p className="mt-2 text-gray-500">
                  {card.subtitle}
                </p>

                <p className="mt-5 font-semibold text-primary break-words">
                  {card.value}
                </p>

                <Link
                  href={card.href}
                  className="mt-8 inline-flex items-center gap-2 font-semibold text-primary transition hover:gap-3"
                >
                  {card.button}

                  <ArrowRight size={18} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}