"use client";

import { MapPin, Navigation, Clock3 } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

export default function ContactMap() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold">Visit Our Office</h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            We'd love to welcome you. Visit our office during business
            hours or reach out through any of our online channels.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Office Information */}
          <div className="rounded-3xl bg-white p-8 shadow-lg lg:col-span-2">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <MapPin className="text-primary" size={30} />
            </div>

            <h3 className="text-2xl font-bold">
              Holy Matrimony Services Pvt Ltd
            </h3>

            <div className="mt-6 space-y-2 leading-7 text-gray-600">
              <p>5/1 Krishna Nagar</p>
              <p>PF Office Road</p>
              <p>Brindavan Gardens</p>
              <p>Guntur - 522002</p>
              <p>Andhra Pradesh, India</p>
            </div>

            <div className="mt-8">
              <a
                href="https://www.google.com/maps/search/?api=1&query=5/1+Krishna+Nagar+PF+Office+Road+Brindavan+Gardens+Guntur+522002"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                <Navigation size={18} />
                Get Directions
              </a>
            </div>
          </div>

          {/* Google Map */}
          <div className="overflow-hidden rounded-3xl shadow-lg lg:col-span-3">
            <iframe
              title="Holy Matrimony Office"
              src="https://www.google.com/maps?q=Brindavan+Gardens+Guntur+522002&output=embed"
              width="100%"
              height="500"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-14 rounded-3xl bg-white p-10 shadow-lg">
          <h3 className="text-center text-3xl font-bold">
            Follow Holy Matrimony
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Stay connected with us for Christian relationship advice,
            wedding inspiration, success stories, announcements, and
            platform updates.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <a
              href="https://facebook.com/theholymatrimony"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FaFacebookF size={24} />
            </a>

            <a
              href="https://instagram.com/theholymatrimonyofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FaInstagram size={24} />
            </a>

            <a
              href="https://youtube.com/@theholymatrimonyofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FaYoutube size={24} />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-700 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FaLinkedinIn size={24} />
            </a>

            <a
              href="#"
              aria-label="X"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FaXTwitter size={24} />
            </a>
          </div>
        </div>

        {/* Response Promise */}
        <div className="mt-12 rounded-3xl bg-primary p-10 text-white shadow-xl">
          <div className="flex flex-col items-center text-center">
            <Clock3 size={42} />

            <h3 className="mt-4 text-3xl font-bold">
              We Respond Quickly
            </h3>

            <p className="mt-4 max-w-3xl text-white/90">
              Our dedicated support team is here to help you. Phone
              enquiries are answered during office hours, while emails
              and contact form submissions are typically responded to
              within one business day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}