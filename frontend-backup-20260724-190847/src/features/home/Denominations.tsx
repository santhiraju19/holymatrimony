"use client";

import {
  Church,
  Cross,
  Landmark,
  Building2,
  Users,
  Heart,
} from "lucide-react";

import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";

const denominations = [
  {
    name: "Catholic",
    profiles: "2,400+",
    icon: Church,
  },
  {
    name: "CSI",
    profiles: "1,800+",
    icon: Landmark,
  },
  {
    name: "CNI",
    profiles: "950+",
    icon: Building2,
  },
  {
    name: "Pentecostal",
    profiles: "3,100+",
    icon: Cross,
  },
  {
    name: "Baptist",
    profiles: "1,250+",
    icon: Users,
  },
  {
    name: "Methodist",
    profiles: "700+",
    icon: Heart,
  },
  {
    name: "Lutheran",
    profiles: "520+",
    icon: Church,
  },
  {
    name: "Orthodox",
    profiles: "860+",
    icon: Cross,
  },
];

export default function Denominations() {
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeading
          title="Browse by Denomination"
          subtitle="Find matches within your faith tradition while respecting your personal preferences."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {denominations.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.name}
                className="group cursor-pointer p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2D5C] text-white transition-colors duration-300 group-hover:bg-[#D4AF37] group-hover:text-black">
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#0B2D5C]">
                  {item.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {item.profiles} Active Profiles
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}