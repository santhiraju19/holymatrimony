"use client";

import { motion } from "framer-motion";
import {
  Church,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

import { churches } from "@/data/churches";

export default function ChurchPartners() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">

      {/* Background Decoration */}
      <div className="absolute -left-28 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[#0B2D5C]/10 blur-3xl" />

      <Container>

        <SectionHeading
          badge="Church Network"
          title="Trusted Church Partners"
          description="Working alongside Christian churches and ministries across India to build faith-centered marriages."
        />

        {/* Trust Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:grid-cols-3"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#0B2D5C]/10 p-3">
              <Church className="h-6 w-6 text-[#0B2D5C]" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Church Connected
              </h4>

              <p className="text-sm text-slate-600">
                Supporting believers through trusted congregations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#D4AF37]/20 p-3">
              <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Verified Community
              </h4>

              <p className="text-sm text-slate-600">
                Encouraging genuine Christian relationships.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-green-100 p-3">
              <HeartHandshake className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Faith-Centered
              </h4>

              <p className="text-sm text-slate-600">
                Helping families grow through Christ-centered marriages.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Church Grid */}
        <div className="mt-16 grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {churches.map((church, index) => (
            <motion.div
              key={church.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              whileHover={{
                y: -6,
              }}
              className="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-xl"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2D5C]/10 transition group-hover:bg-[#D4AF37]/20">
                <Church className="h-7 w-7 text-[#0B2D5C]" />
              </div>

              <h3 className="font-semibold text-[#0B2D5C]">
                {church.name}
              </h3>

              <span className="mt-4 inline-block rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-[#0B2D5C]">
                Partner Church
              </span>
            </motion.div>
          ))}
        </div>

      </Container>
    </Section>
  );
}