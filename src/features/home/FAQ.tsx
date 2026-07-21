"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "Is Holy Matrimony only for Christians?",
    answer:
      "Yes. Holy Matrimony is exclusively designed for Christians across all denominations to help believers find a God-centered life partner.",
  },
  {
    question: "How are profiles verified?",
    answer:
      "We verify mobile numbers, email addresses, and perform profile moderation. Church verification is also available for increased authenticity.",
  },
  {
    question: "Can I search by denomination and church?",
    answer:
      "Yes. You can search by denomination, church, location, education, profession, age, and many other filters.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Absolutely. Your privacy is one of our highest priorities. Sensitive information is protected and only shared according to your privacy settings.",
  },
  {
    question: "Do you offer premium membership?",
    answer:
      "Yes. Premium members receive advanced search, unlimited interests, contact viewing, priority visibility, and additional exclusive features.",
  },
  {
    question: "Can parents create profiles?",
    answer:
      "Yes. Parents and guardians can register and manage profiles for their children while maintaining privacy and security.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-5xl px-6">

        <div className="mb-14 text-center">
          <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
            Frequently Asked Questions
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Have Questions?
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about Holy Matrimony.
          </p>
        </div>

        <div className="space-y-5">

          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-lg font-semibold text-slate-900">
                    {item.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-slate-600 leading-7">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}