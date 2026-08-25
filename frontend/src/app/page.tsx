import type {
  Metadata,
} from "next";

import FeaturedProfiles from "@/features/home/FeaturedProfiles";
import FinalCTA from "@/features/home/FinalCTA";
import Hero from "@/features/home/Hero";
import HowItWorks from "@/features/home/HowItWorks";
import Pricing from "@/features/home/Pricing";
import QuickSearch from "@/features/home/QuickSearch";
import TrustedChurches from "@/features/home/TrustedChurches";
import WhyChooseUs from "@/features/home/WhyChooseUs";

const SITE_URL =
  "https://www.theholymatrimony.com";

export const metadata: Metadata = {
  title:
    "Christian Matrimony in India",

  description:
    "Holy Matrimony helps Christian singles and families in India discover meaningful, faith-centered marriage matches through trusted profiles, partner preferences and verification.",

  alternates: {
    canonical:
      SITE_URL,
  },

  openGraph: {
    title:
      "Holy Matrimony | Christian Matrimony in India",

    description:
      "Discover meaningful Christian marriage matches through a faith-focused matrimony platform built for Christian singles and families in India.",

    url:
      SITE_URL,

    siteName:
      "Holy Matrimony",

    locale:
      "en_IN",

    type:
      "website",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Holy Matrimony | Christian Matrimony in India",

    description:
      "Discover meaningful Christian marriage matches through Holy Matrimony.",
  },
};

const organizationJsonLd = {
  "@context":
    "https://schema.org",

  "@type":
    "Organization",

  "@id":
    `${SITE_URL}/#organization`,

  name:
    "Holy Matrimony",

  url:
    SITE_URL,

  logo:
    `${SITE_URL}/icon.png`,

  description:
    "A Christian matrimony platform helping Christian singles and families discover meaningful, faith-centered marriage matches.",

  contactPoint: {
    "@type":
      "ContactPoint",

    contactType:
      "customer support",

    url:
      `${SITE_URL}/contact`,

    availableLanguage: [
      "English",
    ],
  },
};

const websiteJsonLd = {
  "@context":
    "https://schema.org",

  "@type":
    "WebSite",

  "@id":
    `${SITE_URL}/#website`,

  url:
    SITE_URL,

  name:
    "Holy Matrimony",

  description:
    "Christian matrimony platform for meaningful, faith-centered marriage matches.",

  publisher: {
    "@id":
      `${SITE_URL}/#organization`,
  },

  inLanguage:
    "en-IN",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              organizationJsonLd
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              websiteJsonLd
            ),
        }}
      />

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
    </>
  );
}
