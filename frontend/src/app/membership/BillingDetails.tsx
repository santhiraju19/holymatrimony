"use client";

import {
  Mail,
  Phone,
  ReceiptText,
  Sparkles,
  UserRound,
} from "lucide-react";

import Input from "@/components/ui/Input";

import {
  useMembership,
} from "@/features/membership/hooks/useMembership";

export default function BillingDetails() {
  const {
    checkoutData,
    updateCheckout,
  } = useMembership();

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/65 via-white to-amber-50/45 px-4 py-3.5 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-sm">
            <ReceiptText size={17} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={9}
                className="text-[#B38B19]"
              />

              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-[#B38B19]">
                Billing Information
              </p>
            </div>

            <h2 className="mt-0.5 text-base font-black text-[#0B2D5C] sm:text-lg">
              Billing Details
            </h2>

            <p className="mt-0.5 text-[10px] leading-5 text-slate-500 sm:text-[11px]">
              Enter your contact information to continue with secure payment.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <SectionHeading
          icon={<UserRound size={14} />}
          title="Contact Information"
          description="Used for your membership order and payment confirmation."
        />

        <div className="mt-3 grid gap-3.5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={checkoutData.fullName}
              onChange={(event) =>
                updateCheckout({
                  fullName: event.target.value,
                })
              }
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={checkoutData.email}
            onChange={(event) =>
              updateCheckout({
                email: event.target.value,
              })
            }
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            value={checkoutData.phone}
            onChange={(event) =>
              updateCheckout({
                phone: event.target.value,
              })
            }
          />

          <div className="md:col-span-2">
            <Input
              label="GST Number (Optional)"
              placeholder="29ABCDE1234F1Z5"
              value={checkoutData.gstNumber ?? ""}
              onChange={(event) =>
                updateCheckout({
                  gstNumber:
                    event.target.value.toUpperCase(),
                })
              }
            />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
          <Mail
            size={15}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <p className="text-[10px] leading-5 text-slate-600">
            Your payment confirmation will be sent to the email address provided above.
          </p>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <Phone
            size={15}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-[10px] leading-5 text-slate-600">
            Please provide an active phone number for your membership order.
          </p>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0B2D5C]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-black text-[#0B2D5C]">
          {title}
        </h3>

        <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
