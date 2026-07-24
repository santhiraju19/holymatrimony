import ContactHero from "@/features/contact/ContactHero";
import ContactInfo from "@/features/contact/ContactInfo";
import ContactForm from "@/features/contact/ContactForm";
import ContactMap from "@/features/contact/ContactMap";
import ContactFAQ from "@/features/contact/ContactFAQ";
import ContactCTA from "@/features/contact/ContactCTA";

export const metadata = {
  title: "Contact Us | Holy Matrimony",
  description:
    "Get in touch with Holy Matrimony Services Pvt Ltd. Contact us for membership support, profile verification, technical assistance, or general enquiries.",
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