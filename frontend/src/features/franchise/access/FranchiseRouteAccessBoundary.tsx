"use client";

import Link from "next/link";

import type {
  ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  canAccessFranchiseNavigationItem,
  getFirstAccessibleFranchiseHref,
  getFranchiseNavigationItemForPath,
} from "../layout/franchiseNavigation";

import {
  useFranchiseAccess,
} from "./FranchiseAccessProvider";

interface FranchiseRouteAccessBoundaryProps {
  children: ReactNode;
}

export default function FranchiseRouteAccessBoundary({
  children,
}: FranchiseRouteAccessBoundaryProps) {
  const pathname =
    usePathname();

  const {
    access,
  } = useFranchiseAccess();

  if (!access) {
    return null;
  }

  const navigationItem =
    getFranchiseNavigationItemForPath(
      pathname
    );

  /*
   * Unknown routes are intentionally not treated
   * as permission failures. Route existence and
   * Next.js 404 handling remain separate.
   */
  if (!navigationItem) {
    return <>{children}</>;
  }

  const canAccess =
    canAccessFranchiseNavigationItem(
      access.permissions,
      navigationItem
    );

  if (canAccess) {
    return <>{children}</>;
  }

  const fallbackHref =
    getFirstAccessibleFranchiseHref(
      access.permissions
    );

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center justify-center py-8">
      <div className="w-full rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
          Access Restricted
        </p>

        <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
          You do not have access to {navigationItem.label}
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
          Your franchise account does not include the permission required to view this section.
        </p>

        <div className="mx-auto mt-5 max-w-sm rounded-xl bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Required Permission
          </p>

          <p className="mt-1 font-mono text-sm font-semibold text-amber-950">
            {navigationItem.permission}
          </p>
        </div>

        {fallbackHref ? (
          <Link
            href={fallbackHref}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Go to an accessible section
          </Link>
        ) : (
          <p className="mt-6 text-sm font-medium text-slate-500">
            Contact Holy Matrimony HQ to request portal access.
          </p>
        )}
      </div>
    </section>
  );
}
