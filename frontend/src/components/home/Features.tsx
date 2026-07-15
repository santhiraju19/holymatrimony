"use client";

import {
  ShieldCheck,
  Church,
  HeartHandshake,
  MessageCircleHeart,
  Crown,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Church,
    title: "Church Verified Profiles",
    description:
      "Every profile can be verified through trusted churches, ensuring authenticity and trust.",
  },
  {
    icon: ShieldCheck,
    title: "100% Secure & Private",
    description:
      "Your personal information is protected with enterprise-grade security and privacy controls.",
  },
  {
    icon: HeartHandshake,
    title: "Faith-Centered Matching",
    description:
      "Find someone who shares your Christian faith, values, and vision for marriage.",
  },
  {
    icon: MessageCircleHeart,
    title: "Safe Communication",
    description:
      "Connect with confidence through secure messaging and interest requests.",
  },
  {
    icon: Crown,
    title: "Premium Membership",
    description:
      "Unlock advanced search, unlimited interests, and exclusive visibility.",
  },
  {
    icon: Users,
    title: "Trusted Christian Community",
    description:
      "Join thousands of believers seeking lifelong, Christ-centered relationships.",
  },
];

export default function Features() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center mb-16">
          <p className="text-[#D4AF37] font-semibold uppercase tracking-[0.3em]">
            Why Holy Matrimony
          </p>

          <h2 className="mt-4 text-5xl font-bold text-[#0B2D5C]">
            Trusted Christian Matchmaking
          </h2>

          <p className="mt-6 mx-auto max-w-3xl text-lg text-gray-600">
            Built for Christian families who value faith, trust,
            transparency, and lifelong commitment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                  <Icon
                    className="text-[#D4AF37]"
                    size={34}
                  />
                </div>

                <h3 className="text-2xl font-semibold text-[#0B2D5C]">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-8 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}