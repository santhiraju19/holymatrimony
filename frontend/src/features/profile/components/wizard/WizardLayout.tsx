import { ReactNode } from "react";

interface WizardLayoutProps {
  title: string;
  children: ReactNode;
}

export default function WizardLayout({
  title,
  children,
}: WizardLayoutProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow sm:p-5 lg:p-6">
      <h2 className="text-xl font-bold text-[#0B2D5C] sm:text-2xl">
        {title}
      </h2>

      <div className="mt-5 sm:mt-6">
        {children}
      </div>
    </div>
  );
}