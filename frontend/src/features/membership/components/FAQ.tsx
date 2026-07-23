"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const faqs = [
  {
    question: "How do I upgrade my membership?",
    answer:
      "You can upgrade your membership anytime from your dashboard or the Membership page. Your premium features will be activated immediately after successful payment.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can upgrade or downgrade your membership whenever you like. Any applicable adjustments will be reflected according to our membership policy.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support UPI, Credit Cards, Debit Cards, Net Banking and popular wallets through our secure payment gateway.",
  },
  {
    question: "Can I cancel my membership?",
    answer:
      "Yes. You can cancel auto-renewal at any time. Your membership benefits will continue until the end of the active subscription period.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Absolutely. All payments are processed through PCI-DSS compliant payment gateways with industry-standard encryption.",
  },
  {
    question: "Do premium members get better visibility?",
    answer:
      "Yes. Gold and Platinum members receive higher profile visibility, priority search placement, and additional premium matchmaking features.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-14 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Frequently Asked Questions
          </span>

          <h2 className="mt-6 text-4xl font-bold">
            Have Questions?
          </h2>

          <p className="mt-4 text-gray-600">
            Everything you need to know about Holy Matrimony memberships.
          </p>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, index) => {
            const open = openIndex === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(open ? -1 : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-lg font-semibold">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={cn(
                      "transition-transform duration-300",
                      open && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-all duration-300",
                    open
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t px-6 py-5 text-gray-600">
                      {faq.answer}
                    </div>
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