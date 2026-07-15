import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import QuickSearch from "@/components/home/QuickSearch";
import Footer from "@/components/layout/Footer";

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