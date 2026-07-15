"use client";

import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { stats } from "@/data/stats";

export default function Statistics() {
  return (
    <section className="py-24 bg-slate-50">
      <Container>

        <SectionHeading
          title="Trusted Across India"
          subtitle="Thousands of Christian families have found meaningful relationships through Holy Matrimony."
        />

        <div className="grid md:grid-cols-4 gap-8">

          {stats.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white p-10 shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-5xl font-bold text-[#D4AF37]">
                {item.number}
              </h3>

              <p className="mt-4 text-[#0B2D5C] font-semibold">
                {item.label}
              </p>
            </div>
          ))}

        </div>

      </Container>
    </section>
  );
}