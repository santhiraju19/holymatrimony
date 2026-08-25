import type {
  Metadata,
} from "next";

import {
  ReactNode,
} from "react";

import AdminLayoutShell from "@/features/admin/layout/AdminLayoutShell";

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

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  );
}
