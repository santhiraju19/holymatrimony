import ContactHero from "@/features/contact/ContactHero";
import ContactInfo from "@/features/contact/ContactInfo";
import ContactForm from "@/features/contact/ContactForm";
import ContactMap from "@/features/contact/ContactMap";
import ContactFAQ from "@/features/contact/ContactFAQ";
import ContactCTA from "@/features/contact/ContactCTA";

export const metadata = {
  title: "Contact Holy Matrimony",

  description:
    "Contact Holy Matrimony for Christian matrimony membership support, profile verification, technical assistance, or general enquiries.",

  alternates: {
    canonical:
      "https://www.theholymatrimony.com/contact",
  },

  openGraph: {
    title:
      "Contact Holy Matrimony",

    description:
      "Get support for membership, verification and your Holy Matrimony account.",

    url:
      "https://www.theholymatrimony.com/contact",

    type:
      "website",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <ContactHero />

      <ContactInfo />

      <ContactForm />

      <ContactMap />

      <ContactFAQ />

      <ContactCTA />
    </main>
  );
}