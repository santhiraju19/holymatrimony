import { ReactNode } from "react";

import Logo from "./Logo";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="relative w-full">
      {/* Mobile-first authentication card.
          The parent auth layout already provides the desktop card,
          so we avoid another heavy nested card on phones. */}
      <div className="w-full sm:rounded-[28px] sm:border sm:border-slate-200 sm:bg-white/90 sm:p-8 sm:shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:backdrop-blur-xl lg:p-9">
        <div className="mb-7 text-center sm:mb-8">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#0B2D5C] sm:mt-6 sm:text-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
