import type {
  Metadata,
} from "next";

import {
  ReactNode,
} from "react";

import AuthHero from "@/features/auth/components/AuthHero";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

interface Props {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: Props) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-2 py-3 sm:px-4 sm:py-5 lg:p-6">
        <div className="grid w-full overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[28px] lg:grid-cols-2 lg:rounded-[32px]">
          <AuthHero />

          <div className="flex w-full items-center justify-center px-2 py-4 sm:px-5 sm:py-7 md:px-8 md:py-10 lg:p-16">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
