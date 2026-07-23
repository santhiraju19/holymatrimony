import Hero from "@/features/home/Hero";
import Statistics from "@/features/home/Statistics";
import QuickSearch from "@/features/home/QuickSearch";
import WhyChooseUs from "@/features/home/WhyChooseUs";
import HowItWorks from "@/features/home/HowItWorks";
import FeaturedProfiles from "@/features/home/FeaturedProfiles";
import SuccessStories from "@/features/home/SuccessStories";
import Testimonials from "@/features/home/Testimonials";
import TrustedChurches from "@/features/home/TrustedChurches";
import Pricing from "@/features/home/Pricing";
import FinalCTA from "@/features/home/FinalCTA";

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