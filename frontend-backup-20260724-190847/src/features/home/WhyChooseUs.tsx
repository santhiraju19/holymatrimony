"use client";

import {
  ShieldCheck,
  Church,
  Sparkles,
  Lock,
  Users,
  Headphones,
} from "lucide-react";

import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";

const features = [
  {
    title: "Church Verified Profiles",
    description:
      "Increase trust with optional church verification and denomination-specific matching.",
    icon: Church,
  },
  {
    title: "Identity Verification",
    description:
      "Mobile and identity verification help ensure genuine member profiles.",
    icon: ShieldCheck,
  },
  {
    title: "Smart Matchmaking",
    description:
      "Discover compatible matches based on faith, education, profession, lifestyle, and preferences.",
    icon: Sparkles,
  },
  {
    title: "Privacy First",
    description:
      "Control who can view your photos and personal information with advanced privacy settings.",
    icon: Lock,
  },
  {
    title: "Dedicated Support",
    description:
      "Our support team is here to assist you throughout your matchmaking journey.",
    icon: Headphones,
  },
  {
    title: "Christian Community",
    description:
      "Built exclusively for Christians with denomination-aware search and community values.",
    icon: Users,
  },
];

export default function WhyChooseUs() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <SectionHeading
          title="Why Choose Holy Matrimony?"
          subtitle="Built exclusively for the Christian community with trust, faith, and meaningful connections at its core."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="p-8 transition-transform hover:-translate-y-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white">
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-[#0B2D5C]">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}