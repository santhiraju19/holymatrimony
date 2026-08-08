"use client";

import {
  ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import AdminGuard from "@/features/admin/auth/AdminGuard";
import AdminHeader from "@/features/admin/layout/AdminHeader";
import AdminSidebar from "@/features/admin/layout/AdminSidebar";

interface AdminLayoutShellProps {
  children: ReactNode;
}

export default function AdminLayoutShell({
  children,
}: AdminLayoutShellProps) {
  const pathname =
    usePathname();

  const isLoginPage =
    pathname ===
    "/admin/login";

  if (isLoginPage) {
    return (
      <AdminGuard>
        {children}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <AdminSidebar />

          <div className="min-w-0 flex-1">
            <AdminHeader />

            <main className="p-5 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}