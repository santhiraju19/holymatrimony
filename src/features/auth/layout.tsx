import { ReactNode } from "react";

import AuthHero from "@/features/auth/components/AuthHero";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6">

        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">

          {/* Left Hero */}

          <AuthHero />

          {/* Right Content */}

          <div className="flex items-center justify-center p-8 lg:p-16">

            <div className="w-full max-w-md">

              {children}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}