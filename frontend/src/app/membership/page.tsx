import type { Metadata } from "next";

import CTA from "@/features/membership/components/CTA";
import FAQ from "@/features/membership/components/FAQ";
import FeatureComparison from "@/features/membership/components/FeatureComparison";
import Hero from "@/features/membership/components/Hero";
import PricingSection from "@/features/membership/components/PricingSection";

export const metadata: Metadata = {
  title:
    "Christian Matrimony Membership Plans",

  description:
    "Explore Holy Matrimony membership plans for Christian singles, including advanced search, communication, verification and premium matchmaking features.",

  alternates: {
    canonical:
      "https://www.theholymatrimony.com/membership",
  },

  openGraph: {
    title:
      "Holy Matrimony Membership Plans",

    description:
      "Explore membership options designed to help Christian singles discover and connect with meaningful matches.",

    url:
      "https://www.theholymatrimony.com/membership",

    type:
      "website",
  },
};

export default function MembershipPage() {
  return (
    <main>
      <Hero />

      <PricingSection />

      <FeatureComparison />

      <FAQ />

      <CTA />
    </main>
  );
}