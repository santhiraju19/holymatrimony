import {
  ReactNode,
} from "react";

import AdminLayoutShell from "@/features/admin/layout/AdminLayoutShell";

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