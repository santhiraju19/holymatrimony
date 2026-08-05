"use client";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Crown,
  CreditCard,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import CurrentMembershipCard from "@/features/membership/components/CurrentMembershipCard";
import PaymentHistoryCard from "@/features/membership/components/PaymentHistoryCard";
import PricingSection from "@/features/membership/components/PricingSection";

const membershipBenefits = [
  "View and manage your current membership plan",
  "Review membership start date and expiry date",
  "Check remaining membership validity",
  "Access payment history and downloadable receipts",
  "Compare available upgrade and renewal plans",
  "Manage premium benefits from one secure page",
];

export default function DashboardMembershipPage() {
  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[30px] border border-amber-200/20 bg-gradient-to-br from-[#06162C] via-[#0B2D5C] to-[#174A87] px-5 py-7 text-white shadow-[0_26px_75px_rgba(11,45,92,0.24)] sm:px-8 sm:py-9 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#D4AF37]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D675]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">
              <Sparkles size={14} />

              Member account
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#F2D675] backdrop-blur sm:flex">
                <Crown size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  My Membership
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                  Review your current plan, membership
                  validity, renewal information, premium
                  benefits and payment history from one
                  secure dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.09] p-4 backdrop-blur-xl">
              <ShieldCheck
                size={22}
                className="text-emerald-300"
              />

              <p className="mt-3 text-sm font-black">
                Secure account
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-100">
                Protected membership details
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.09] p-4 backdrop-blur-xl">
              <ReceiptText
                size={22}
                className="text-[#F2D675]"
              />

              <p className="mt-3 text-sm font-black">
                Payment records
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-100">
                Receipts and transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      <CurrentMembershipCard />

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-blue-50 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#071B36] shadow-md">
              <Crown size={21} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B38B19]">
                Membership centre
              </p>

              <h2 className="mt-1 text-xl font-black text-[#0B2D5C]">
                Manage Your Membership
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Everything related to your plan is available
                on this page.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {membershipBenefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-sm font-semibold leading-6 text-slate-700">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-[#F2D675] shadow-md">
              <CreditCard size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#0B2D5C]">
                Upgrade or Renew
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Compare available plans below and select the
                membership that best suits your communication
                and profile-visibility needs.
              </p>
            </div>
          </div>

          <a
            href="#membership-plans"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#123C73]"
          >
            Compare Plans

            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section
        id="membership-plans"
        className="scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]"
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 px-5 py-5 sm:px-6">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B38B19]">
            Available plans
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#0B2D5C]">
            Membership Plans
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upgrade or renew without leaving your member dashboard.
          </p>
        </div>

        <div className="overflow-hidden">
          <PricingSection />
        </div>
      </section>

      <PaymentHistoryCard />

      <section className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h2 className="font-black text-[#0B2D5C]">
                Need Membership Support?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact support for plan, payment, receipt,
                renewal or membership-status assistance.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
          >
            Contact Support

            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}