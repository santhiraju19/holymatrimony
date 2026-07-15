import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/features/home/Hero";
import QuickSearch from "@/features/home/QuickSearch";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <QuickSearch />
      <Footer />
    </main>
  );
}