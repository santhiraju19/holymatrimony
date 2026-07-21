import Hero from "@/features/home/Hero";
import QuickSearch from "@/features/home/QuickSearch";
import Features from "@/features/home/Features";
import WhyChooseUs from "@/features/home/WhyChooseUs";
import HowItWorks from "@/features/home/HowItWorks";
import FeaturedProfiles from "@/features/home/FeaturedProfiles";
import Testimonials from "@/features/home/Testimonials";
import Statistics from "@/features/home/Statistics";
import ChurchPartners from "@/features/home/ChurchPartners";
import Denominations from "@/features/home/Denominations";
import Pricing from "@/features/home/Pricing";
import DownloadApp from "@/features/home/DownloadApp";
import FAQ from "@/features/home/FAQ";
import FinalCTA from "@/features/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickSearch />
      <Features />
      <WhyChooseUs />
      <HowItWorks />
      <FeaturedProfiles />
      <Testimonials />
      <Statistics />
      <ChurchPartners />
      <Denominations />
      <Pricing />
      <DownloadApp />
      <FAQ />
      <FinalCTA />
    </>
  );
}