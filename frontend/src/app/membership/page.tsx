import CTA from "@/features/membership/components/CTA";
import FAQ from "@/features/membership/components/FAQ";
import FeatureComparison from "@/features/membership/components/FeatureComparison";
import Hero from "@/features/membership/components/Hero";
import PricingSection from "@/features/membership/components/PricingSection";

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