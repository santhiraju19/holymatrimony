import { ReactNode } from "react";

import AuthHero from "@/features/auth/components/AuthHero";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: Props) {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-start justify-center sm:items-center sm:px-4 sm:py-6 lg:px-6">
        <div className="grid min-h-dvh w-full bg-white sm:min-h-0 sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-2xl lg:grid-cols-2 lg:rounded-[32px]">
          {/* Desktop brand / marketing panel */}
          <AuthHero />

          {/* Authentication content */}
          <section className="flex w-full items-start justify-center px-4 pb-8 pt-6 sm:items-center sm:px-8 sm:py-10 lg:px-12 lg:py-14 xl:px-16">
            <div className="w-full max-w-md">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
