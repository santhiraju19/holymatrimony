"use client";

import {
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Office Address",
    content: [
      "Holy Matrimony Services Pvt Ltd",
      "5/1 Krishna Nagar",
      "PF Office Road",
      "Brindavan Gardens",
      "Guntur - 522002",
      "Andhra Pradesh, India",
    ],
  },
  {
    icon: Phone,
    title: "Phone Number",
    content: [
      "+91 9133919777",
    ],
  },
  {
    icon: Mail,
    title: "Email Address",
    content: [
      "support@theholymatrimony.com",
    ],
  },
  {
    icon: Clock,
    title: "Office Hours",
    content: [
      "Monday – Saturday",
      "9:00 AM – 6:00 PM",
      "Sunday - Closed",
    ],
  },
];

export default function ContactInfo() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold">
            Get In Touch
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We're always happy to assist you. Reach us through any of
            the following channels, and our team will get back to you
            as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {contactInfo.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon
                    size={30}
                    className="text-primary"
                  />
                </div>

                <h3 className="mb-4 text-xl font-bold">
                  {item.title}
                </h3>

                <div className="space-y-2 text-gray-600">
                  {item.content.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}