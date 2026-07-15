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
    <div className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-[#0B2D5C]">
        {title}
      </h2>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}