import FeaturedProfiles from "@/features/home/FeaturedProfiles";
import FinalCTA from "@/features/home/FinalCTA";
import Hero from "@/features/home/Hero";
import HowItWorks from "@/features/home/HowItWorks";
import Pricing from "@/features/home/Pricing";
import QuickSearch from "@/features/home/QuickSearch";
import TrustedChurches from "@/features/home/TrustedChurches";
import WhyChooseUs from "@/features/home/WhyChooseUs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <QuickSearch />
      <WhyChooseUs />
      <HowItWorks />
      <FeaturedProfiles />
      <TrustedChurches />
      <Pricing />
      <FinalCTA />
    </main>
  );
}
