"use client";

import { motion } from "framer-motion";
import {
  Church,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/common/SectionHeading";

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
                Built on Christian values and Biblical principles.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Church Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {churches.map((church, index) => (
            <motion.div
              key={church.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-[#0B2D5C]/10 p-3">
                  <Church className="h-6 w-6 text-[#0B2D5C]" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {church.name}
                  </h3>

                  {"city" in church && (
                    <p className="text-sm text-slate-500">
                      {church.city}
                    </p>
                  )}
                </div>
              </div>

              {"description" in church && (
                <p className="text-sm leading-6 text-slate-600">
                  {church.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
