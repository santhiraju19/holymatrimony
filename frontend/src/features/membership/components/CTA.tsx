import Link from "next/link";
import { ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-primary p-10 text-white shadow-2xl lg:p-16">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">
              ❤️ Holy Matrimony Premium
            </span>

            <h2 className="mt-6 text-4xl font-bold md:text-5xl">
              Find Your God-Given Life Partner
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
              Join thousands of Christian brides and grooms who have trusted
              Holy Matrimony to begin their lifelong journey. Unlock premium
              features and connect with genuine, verified profiles today.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/membership/checkout">
                <Button
                  className="w-full bg-white text-primary hover:bg-gray-100 sm:w-auto"
                >
                  Upgrade Membership
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-primary sm:w-auto"
                >
                  Create Free Profile
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="flex items-center justify-center gap-3">
                <ShieldCheck className="h-6 w-6" />
                <span>100% Secure Payments</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <span>Verified Christian Profiles</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <span>Dedicated Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}