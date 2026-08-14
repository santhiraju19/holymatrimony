"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AdminGuard from "@/features/admin/auth/AdminGuard";
import AdminHeader from "@/features/admin/layout/AdminHeader";
import AdminSidebar from "@/features/admin/layout/AdminSidebar";

interface AdminLayoutShellProps {
  children: ReactNode;
}

export default function AdminLayoutShell({
  children,
}: AdminLayoutShellProps) {
  const pathname = usePathname();

  const isLoginPage =
    pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <AdminGuard>
        {children}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen overflow-x-hidden bg-slate-50">
        <div className="flex min-h-screen min-w-0">
          <AdminSidebar />

          <div className="min-w-0 flex-1">
            <AdminHeader />

            <main className="min-w-0 p-3 sm:p-4 lg:p-5 xl:p-6">
              <div className="mx-auto w-full max-w-[1360px]">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}