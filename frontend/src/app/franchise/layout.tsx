import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import FranchiseLayoutShell from "@/features/franchise/layout/FranchiseLayoutShell";

export const metadata: Metadata = {
  title: {
    default: "Franchise Portal | Holy Matrimony",
    template: "%s | Holy Matrimony Franchise",
  },
  description:
    "Holy Matrimony authorized franchise operations portal.",
  robots: {
    index: false,
    follow: false,
  },
};

interface FranchiseLayoutProps {
  children: ReactNode;
}

export default function FranchiseLayout({
  children,
}: FranchiseLayoutProps) {
  return (
    <FranchiseLayoutShell>
      {children}
    </FranchiseLayoutShell>
  );
}
