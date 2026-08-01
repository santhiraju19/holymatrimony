import FeaturedProfiles from "@/features/home/FeaturedProfiles";
import FinalCTA from "@/features/home/FinalCTA";
import Hero from "@/features/home/Hero";
import HowItWorks from "@/features/home/HowItWorks";
import Pricing from "@/features/home/Pricing";
import QuickSearch from "@/features/home/QuickSearch";
import Statistics from "@/features/home/Statistics";
import SuccessStories from "@/features/home/SuccessStories";
import Testimonials from "@/features/home/Testimonials";
import TrustedChurches from "@/features/home/TrustedChurches";
import WhyChooseUs from "@/features/home/WhyChooseUs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Statistics />
      <QuickSearch />
      <WhyChooseUs />
      <HowItWorks />
      <FeaturedProfiles />
      <SuccessStories />
      <Testimonials />
      <TrustedChurches />
      <Pricing />
      <FinalCTA />
    </main>
  );
}