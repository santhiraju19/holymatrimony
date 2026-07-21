"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { stats } from "@/data/stats";

function CountUp({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1800;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Statistics() {
  return (
    <section className="bg-slate-50 py-24">
      <Container>
        <SectionHeading
          title="Trusted Across India"
          subtitle="Thousands of Christian families have found meaningful relationships through Holy Matrimony."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => {
            const number = Number(
              String(item.number).replace(/[^0-9]/g, "")
            );

            const suffix = String(item.number).replace(/[0-9,]/g, "");

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="group rounded-3xl border border-slate-100 bg-white p-10 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <h3 className="text-5xl font-bold text-[#D4AF37]">
                  <CountUp
                    value={number}
                    suffix={suffix}
                  />
                </h3>

                <p className="mt-4 text-lg font-semibold text-[#0B2D5C]">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}