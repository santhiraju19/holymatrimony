"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  canAccessAdminNavigationItem,
  getAdminNavigationItemForPath,
  getFirstAccessibleAdminHref,
} from "@/features/admin/layout/adminNavigation";

import {
  useAdminAccess,
} from "./AdminAccessProvider";

interface AdminRouteAccessBoundaryProps {
  children: ReactNode;
}

export default function AdminRouteAccessBoundary({
  children,
}: AdminRouteAccessBoundaryProps) {
  const pathname = usePathname();

  const {
    access,
  } = useAdminAccess();

  if (!access) {
    return null;
  }

  const navigationItem =
    getAdminNavigationItemForPath(pathname);

  /*
   * Unknown routes are intentionally not treated as permission failures.
   * This keeps route existence and 404 handling separate from access
   * control.
   */
  if (!navigationItem) {
    return <>{children}</>;
  }

  const canAccess =
    canAccessAdminNavigationItem(
      access,
      navigationItem
    );

  if (canAccess) {
    return <>{children}</>;
  }

  const fallbackHref =
    getFirstAccessibleAdminHref(access);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert
            size={28}
            strokeWidth={2}
          />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
          Restricted Area
        </p>

        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          You do not have access to this section
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Your administrator account does not include the permission required
          to view this page.
        </p>

        {fallbackHref ? (
          <Link
            href={fallbackHref}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Go to an accessible section
          </Link>
        ) : (
          <p className="mt-6 text-sm font-medium text-slate-500">
            Contact a super administrator to request access.
          </p>
        )}
      </div>
    </div>
  );
}
