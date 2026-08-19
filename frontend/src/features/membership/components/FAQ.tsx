"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  CircleHelp,
  Sparkles,
} from "lucide-react";

import {
  cn,
} from "@/utils/cn";

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
  const [
    openIndex,
    setOpenIndex,
  ] =
    useState<number>(0);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
            <Sparkles
              size={10}
            />
            Frequently Asked Questions
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.025em] text-[#0B2D5C] sm:text-3xl">
            Membership questions
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
            Everything you need to know before choosing or managing a Holy Matrimony membership.
          </p>
        </div>

        <div className="mt-7 space-y-2.5">
          {faqs.map(
            (
              faq,
              index
            ) => {
              const open =
                openIndex ===
                index;

              return (
                <div
                  key={
                    faq.question
                  }
                  className={[
                    "overflow-hidden rounded-[16px] border bg-white transition",

                    open
                      ? "border-blue-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                      : "border-slate-200 hover:border-slate-300",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    aria-expanded={
                      open
                    }
                    onClick={() =>
                      setOpenIndex(
                        open
                          ? -1
                          : index
                      )
                    }
                    className="flex w-full items-center gap-3 px-3.5 py-3 text-left sm:px-4"
                  >
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",

                        open
                          ? "bg-blue-50 text-[#0B2D5C]"
                          : "bg-slate-50 text-slate-400",
                      ].join(" ")}
                    >
                      <CircleHelp
                        size={14}
                      />
                    </span>

                    <span className="min-w-0 flex-1 text-xs font-black text-[#0B2D5C] sm:text-sm">
                      {
                        faq.question
                      }
                    </span>

                    <ChevronDown
                      size={16}
                      className={cn(
                        "shrink-0 text-slate-400 transition-transform duration-300",
                        open &&
                          "rotate-180 text-[#0B2D5C]"
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
                      <div className="border-t border-slate-100 px-3.5 py-3 text-[11px] leading-6 text-slate-500 sm:px-4 sm:text-xs">
                        {
                          faq.answer
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
