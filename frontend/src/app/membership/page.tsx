import Hero from "@/features/membership/components/Hero";
import PricingSection from "@/features/membership/components/PricingSection";
import FeatureComparison from "@/features/membership/components/FeatureComparison";
import FAQ from "@/features/membership/components/FAQ";
import CTA from "@/features/membership/components/CTA";
import CurrentMembershipCard from "@/features/membership/components/CurrentMembershipCard";

export default function MembershipPage() {
  return (
    <main>
      <Hero />
      <PricingSection />
      <CurrentMembershipCard />
      <FeatureComparison />
      <FAQ />
      <CTA />
    </main>
  );
}