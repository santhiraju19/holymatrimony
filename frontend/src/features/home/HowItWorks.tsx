"use client";

import {
  UserPlus,
  FileCheck,
  Search,
  HeartHandshake,
  Church,
} from "lucide-react";

import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";

const steps = [
  {
    id: "01",
    title: "Create Your Profile",
    description:
      "Register and complete your Christian matrimony profile with accurate personal and family details.",
    icon: UserPlus,
  },
  {
    id: "02",
    title: "Profile Verification",
    description:
      "Verify your mobile number and identity. Church verification helps build trust within the community.",
    icon: FileCheck,
  },
  {
    id: "03",
    title: "Discover Matches",
    description:
      "Receive carefully matched Christian profiles based on denomination, education, profession and preferences.",
    icon: Search,
  },
  {
    id: "04",
    title: "Express Interest",
    description:
      "Send or receive interests and begin meaningful conversations with suitable matches.",
    icon: HeartHandshake,
  },
  {
    id: "05",
    title: "Blessed Marriage",
    description:
      "Meet with family approval and begin your lifelong journey together with God's blessings.",
    icon: Church,
  },
];

export default function HowItWorks() {
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeading
          title="How Holy Matrimony Works"
          subtitle="A simple, secure and faith-centered journey towards finding your life partner."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.id}
                className="relative p-8 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2D5C] text-white">
                  <Icon size={28} />
                </div>

                <div className="mt-6">
                  <span className="text-sm font-bold tracking-widest text-[#D4AF37]">
                    STEP {step.id}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-[#0B2D5C]">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}