import { ReactNode } from "react";

import AuthHero from "@/features/auth/components/AuthHero";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6">

        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-2">

          {/* Left Side */}

          <AuthHero />

          {/* Right Side */}

          <div className="flex items-center justify-center p-10 lg:p-16">

            <div className="w-full max-w-md">

              {children}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}