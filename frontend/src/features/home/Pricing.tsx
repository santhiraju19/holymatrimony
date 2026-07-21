"use client";

import { motion } from "framer-motion";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/common/SectionHeading";
import PricingCard from "@/components/cards/PricingCard";

import { pricingPlans } from "@/data/pricing";

export default function Pricing() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <SectionHeading
          badge="Membership Plans"
          title="Choose the Plan That Fits You"
          description="Unlock premium features and connect with genuine, verified Christian matches."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                duration: 0.45,
              }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}