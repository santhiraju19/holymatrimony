"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How do I register on Holy Matrimony?",
    answer:
      "Click on Register, create your account, verify your email or mobile number, and complete your profile to start finding your God-ordained life partner.",
  },
  {
    question: "Is profile verification mandatory?",
    answer:
      "Verification is optional but highly recommended. Verified profiles receive greater trust and visibility within the platform.",
  },
  {
    question: "Can I upgrade my membership later?",
    answer:
      "Yes. You can upgrade to any premium membership plan at any time from your Membership page.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can call us, send an email, or use the Contact Form. Our support team typically responds within one business day.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Absolutely. We use industry-standard security practices to protect your personal information and respect your privacy.",
  },
];

export default function ContactFAQ() {
  const [open, setOpen] =useState<number | null>(0);

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-gray-600">
            Everything you need to know about Holy Matrimony.
          </p>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <button
                onClick={() =>
                  setOpen(open === index ? null : index)
                }
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold">
                  {faq.question}
                </span>

                {open === index ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </button>

              {open === index && (
                <div className="border-t px-6 py-5 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}